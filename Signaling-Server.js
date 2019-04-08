var log4js_utils = require('./log4js-utils');
var logger = log4js_utils.logger();
var loggerSignaling = log4js_utils.loggerSignaling();

var send_email_utils = require('./send-email-utils');


var listOfUsers = {};
var roomList = {};
var shiftedModerationControls = {};
var ScalableBroadcast;
//maximum member of users = customMaxParticipantsAllowed
var customMaxParticipantsAllowed = 4;	// 방 인원수

var isRoomAndUserListLog = true; // 사용자 & 방 리스트 로그
var isErrorSendEmail = false;	// 에러 메일 전송


module.exports = exports = function(app, socketCallback) {
    socketCallback = socketCallback || function() {};
	
    if (!!app.listen) {
        var io = require('socket.io');

        try {
            // use latest socket.io
            io = io(app);
            io.on('connection', onConnection);
        } catch (e) {
            // otherwise fallback
            io = io.listen(app, {
                log: false,
                origins: '*:*'
            });

            io.set('transports', [
                'websocket',
                'xhr-polling',
                'jsonp-polling'
            ]);

            io.sockets.on('connection', onConnection);
        }
    } else {
        onConnection(app);
    }

	
    // to secure your socket.io usage: (via: docs/tips-tricks.md)
    // io.set('origins', 'https://domain.com');

    function appendUser(socket) {

        var alreadyExist = listOfUsers[socket.userid];
        var extra = {};

        if (alreadyExist && alreadyExist.extra) {
            extra = alreadyExist.extra;
        }

        var params = socket.handshake.query;

        if (params.extra) {
            try {
                if (typeof params.extra === 'string') {
                    params.extra = JSON.parse(params.extra);
                }
                extra = params.extra;
            } catch (e) {
                extra = params.extra;
            }
        }
        
        listOfUsers[socket.userid] = {
            socket: socket,
            connectedWith: {},
            isPublic: false, // means: isPublicModerator
            extra: extra || {},
//          maxParticipantsAllowed: params.maxParticipantsAllowed || 1000
            maxParticipantsAllowed: customMaxParticipantsAllowed-1 || 1000
        };
    }
	
	
	// error handling
    function errorHandlerFnt(msg, content, err){
    	loggerSignaling.error('[ERROR] ' + msg);
    	if(content != null) loggerSignaling.error('[ERROR] ' + content);
    	if(err != null && err.stack != null) loggerSignaling.error('[ERROR] ' + err.stack);
    	
    	// 메일 발송
    	if(isErrorSendEmail) send_email_utils.sendEmailFnt(err, logger, loggerSignaling, 'Signaling');
    }

 // 방 목록 & 사용자 목록 확인
    function logForRoomAndUsers(textInfo){
		if( !isRoomAndUserListLog ) return;
		
    	for(var key in roomList){
			for(var key1 in roomList[key]){
				logger.info(textInfo + " - roomList["+key+"]["+key1+"][userid] is :: " + roomList[key][key1]['userid']);
			}
		}
		
		for(var key2 in listOfUsers){
			for(var key3 in listOfUsers[key2]){
				logger.info(textInfo + " - listOfUsers["+key2+"]["+key3+"] is :: " + listOfUsers[key2][key3]);
			}
        }
    }
	
    function onConnection(socket) {
		logForRoomAndUsers('onConnection start');
	
        var params = socket.handshake.query;
        var socketMessageEvent = params.msgEvent || 'RTCMultiConnection-Message';

        var sessionid = params.sessionid;
        var autoCloseEntireSession = params.autoCloseEntireSession;
        
        if (params.enableScalableBroadcast) {
            if (!ScalableBroadcast) {
                ScalableBroadcast = require('./Scalable-Broadcast.js');
            }
            ScalableBroadcast(socket, params.maxRelayLimitPerUser);
        }

        // [disabled]
        if (false && !!listOfUsers[params.userid]) {
            params.dontUpdateUserId = true;

            var useridAlreadyTaken = params.userid;
            params.userid = (Math.random() * 1000).toString().replace('.', '');
            socket.emit('userid-already-taken', useridAlreadyTaken, params.userid);
            return;
        }

		if(params.roomid) socket.roomid = params.roomid;
        socket.userid = params.userid;
        appendUser(socket);


        if (autoCloseEntireSession == 'false' && Object.keys(listOfUsers).length == 1) {
            socket.shiftModerationControlBeforeLeaving = true;
        }

        socket.on('shift-moderator-control-on-disconnect', function() {
            socket.shiftModerationControlBeforeLeaving = true;
        });

        socket.on('extra-data-updated', function(extra) {
            try {
                if (!listOfUsers[socket.userid]) return;
                listOfUsers[socket.userid].extra = extra;

                for (var user in listOfUsers[socket.userid].connectedWith) {
                    listOfUsers[user].socket.emit('extra-data-updated', socket.userid, extra);
                }
            } catch (e) {
                errorHandlerFnt('extra-data-updated is ::', null, e);
            }
        });

        socket.on('get-remote-user-extra-data', function(remoteUserId, callback) {
            callback = callback || function() {};
            if (!remoteUserId || !listOfUsers[remoteUserId]) {
                callback('remoteUserId (' + remoteUserId + ') does NOT exist.');
                return;
            }
            callback(listOfUsers[remoteUserId].extra);
        });

        socket.on('become-a-public-moderator', function() {
            try {
                if (!listOfUsers[socket.userid]) return;
                listOfUsers[socket.userid].isPublic = true;
            } catch (e) {
                errorHandlerFnt('become-a-public-moderator is :: ', null, e);
            }
        });

        var dontDuplicateListeners = {};
        socket.on('set-custom-socket-event-listener', function(customEvent) {
            if (dontDuplicateListeners[customEvent]) return;
            dontDuplicateListeners[customEvent] = customEvent;

            socket.on(customEvent, function(message) {
                try {
                    socket.broadcast.emit(customEvent, message);
                } catch (e) {}
            });
        });

        socket.on('dont-make-me-moderator', function() {
            try {
                if (!listOfUsers[socket.userid]) return;
                listOfUsers[socket.userid].isPublic = false;
            } catch (e) {
                errorHandlerFnt('dont-make-me-moderator is :: ', null, e);
            }
        });

        socket.on('get-public-moderators', function(userIdStartsWith, callback) {
            try {
                userIdStartsWith = userIdStartsWith || '';
                var allPublicModerators = [];
                for (var moderatorId in listOfUsers) {
                    if (listOfUsers[moderatorId].isPublic && moderatorId.indexOf(userIdStartsWith) === 0 && moderatorId !== socket.userid) {
                        var moderator = listOfUsers[moderatorId];
                        allPublicModerators.push({
                            userid: moderatorId,
                            extra: moderator.extra
                        });
                    }
                }

                callback(allPublicModerators);
            } catch (e) {
                errorHandlerFnt('get-public-moderators is :: ', null, e);
            }
        });


        // 방 존재유무 확인
		socket.on('check-presence', function(roomid, callback) {
			logger.info(' check-presence - roomid : ' + roomid + ' // ' + (!roomList[roomid]));
            if (!roomList[roomid]) {
        		callback(false);
        	} else {
        		callback(true);
        	}
        });


		// 방 생성 및 사용자 명 변경
        socket.on('changed-uuid', function(roomid, callback) {
			try{
				var oldUserId = socket.userid;
        		
        		if( !roomList[roomid] ) roomList[roomid] = [];
	        	
				roomList[roomid].push(socket);
				
//				logForRoomAndUsers('changed-uuid 1');

	            callback = callback || function() {};

    	        if (params.dontUpdateUserId) {
        	        delete params.dontUpdateUserId;
            	    return;
            	}

				appendUser(socket);

//  	  		logForRoomAndUsers('changed-uuid 3');
        	        
            	callback();
            } catch (e) {
               	errorHandlerFnt('changed-uuid e is :: ', null, e);
            }
        });

        socket.on('set-password', function(password) {
            try {
                if (listOfUsers[socket.userid]) {
                    listOfUsers[socket.userid].password = password;
                }
            } catch (e) {
                logger.ingo('set-password is :: '+ e);
            }
        });

        // 방장이 방 종료시 다른 사용자 접속 종료(사용X)
        socket.on('disconnect-with', function(remoteUserId, callback) {
            try {
                if (listOfUsers[socket.userid] && listOfUsers[socket.userid].connectedWith[remoteUserId]) {
                    delete listOfUsers[socket.userid].connectedWith[remoteUserId];
                    socket.emit('user-disconnected', remoteUserId);
                }

                if (!listOfUsers[remoteUserId]) return callback();

                if (listOfUsers[remoteUserId].connectedWith[socket.userid]) {
                    delete listOfUsers[remoteUserId].connectedWith[socket.userid];
                    listOfUsers[remoteUserId].socket.emit('user-disconnected', socket.userid);
                }
                callback();
            } catch (e) {
                logger.ingo('disconnect-with is :: ' + e);
            }
        });

        socket.on('close-entire-session', function(callback) {
            try {
                var connectedWith = listOfUsers[socket.userid].connectedWith;
                Object.keys(connectedWith).forEach(function(key) {
                    if (connectedWith[key] && connectedWith[key].emit) {
                        try {
                            connectedWith[key].emit('closed-entire-session', socket.userid, listOfUsers[socket.userid].extra);
                        } catch (e) {}
                    }
                });

                delete shiftedModerationControls[socket.userid];
                callback();
            } catch (e) {
                logger.ingo('close-entire-session is :: ' + e);
            }
        });

        function onMessageCallback(message) {
            try {
                if (!listOfUsers[message.sender]) {
                    socket.emit('user-not-found', message.sender);
                    return;
                }

                if (!message.message.userLeft && !listOfUsers[message.sender].connectedWith[message.remoteUserId] && !!listOfUsers[message.remoteUserId]) {
                    listOfUsers[message.sender].connectedWith[message.remoteUserId] = listOfUsers[message.remoteUserId].socket;
                    listOfUsers[message.sender].socket.emit('user-connected', message.remoteUserId);

                    if (!listOfUsers[message.remoteUserId]) {
                        listOfUsers[message.remoteUserId] = {
                            socket: null,
                            connectedWith: {},
                            isPublic: false,
                            extra: {},
                            maxParticipantsAllowed: params.maxParticipantsAllowed || 1000
                        };
                    }

                    listOfUsers[message.remoteUserId].connectedWith[message.sender] = socket;

                    if (listOfUsers[message.remoteUserId].socket) {
                        listOfUsers[message.remoteUserId].socket.emit('user-connected', message.sender);
                    }
                }

                if (listOfUsers[message.sender].connectedWith[message.remoteUserId] && listOfUsers[socket.userid]) {
                    message.extra = listOfUsers[socket.userid].extra;
                    listOfUsers[message.sender].connectedWith[message.remoteUserId].emit(socketMessageEvent, message);
                }
            } catch (e) {
                errorHandlerFnt('onMessageCallback is :: ', null, e);
            }
        }

        // 방 접속
        function joinARoomNoOwner(message) {
        	logger.info('joinARoomNoOwner - message.remoteUserId : ' + message.remoteUserId);
			try{
				var roomid = message.roomid;
        		var currentRoom = roomList[roomid];
        		var roomMemberCnt = currentRoom.length;
				
				// 인원수
//        		logger.info('joinARoomNoOwner - roomMemberCnt : ' + roomMemberCnt);
        		if (roomMemberCnt >= customMaxParticipantsAllowed) {
            		var memCnt = roomMemberCnt + '/' + ( customMaxParticipantsAllowed );
					
					socket.emit('room-full', roomid, memCnt);
                	return;
            	}
            
            	// 정보 전달 - peer 연결
        		currentRoom.forEach(function(userSocket){
            		console.log('---- : ' + userSocket.userid);
            		if (params.oneToMany) return;
            		
            		message.remoteUserId = userSocket.userid;
            		userSocket.emit(socketMessageEvent, message);
            	});

				// 사용자 목록에 추가
            	roomList[roomid].push(socket);
            	
//				logForRoomAndUsers('joinARoomNoOwner');
			} catch (e) {
                errorHandlerFnt('joinARoomNoOwner is :: ', null, e);
            }
		}


        var numberOfPasswordTries = 0;
        socket.on(socketMessageEvent, function(message, callback) {

            if (message.remoteUserId && message.remoteUserId === socket.userid) {
                // remoteUserId MUST be unique
                return;
            }
			
            try {
                if (message.remoteUserId && message.remoteUserId != 'system' && message.message.newParticipationRequest) {
                    if (listOfUsers[message.remoteUserId] && listOfUsers[message.remoteUserId].password) {
                        if (numberOfPasswordTries > 3) {
                            socket.emit('password-max-tries-over', message.remoteUserId);
                            return;
                        }

                        if (!message.password) {
                            numberOfPasswordTries++;
                            socket.emit('join-with-password', message.remoteUserId);
                            return;
                        }

                        if (message.password != listOfUsers[message.remoteUserId].password) {
                            numberOfPasswordTries++;
                            socket.emit('invalid-password', message.remoteUserId, message.password);
                            return;
                        }
                    }

                    if (roomList[message.roomid]) {
                        joinARoomNoOwner(message);
                        return;
                    }
                }

                if (message.message.shiftedModerationControl) {
                    if (!message.message.firedOnLeave) {
                        onMessageCallback(message);
                        return;
                    }
                    shiftedModerationControls[message.sender] = message;
                    return;
                }
                // for v3 backward compatibility; >v3.3.3 no more uses below block
                if (message.remoteUserId == 'system') {
                    if (message.message.detectPresence) {
                        if (message.message.userid === socket.userid) {
                            callback(false, socket.userid);
                            return;
                        }

                        callback(!!listOfUsers[message.message.userid], message.message.userid);
                        return;
                    }
                }

                if (!listOfUsers[message.sender]) {
                    listOfUsers[message.sender] = {
                        socket: socket,
                        connectedWith: {},
                        isPublic: false,
                        extra: {},
                        maxParticipantsAllowed: params.maxParticipantsAllowed || 1000
                    };
                }

                // if someone tries to join a person who is absent
                if (message.message.newParticipationRequest) {
                    var waitFor = 60 * 10; // 10 minutes
                    var invokedTimes = 0;
                    (function repeater() {
                        if (typeof socket == 'undefined' || !listOfUsers[socket.userid]) {
                            return;
                        }

                        invokedTimes++;
                        if (invokedTimes > waitFor) {
                            socket.emit('user-not-found', message.remoteUserId);
                            return;
                        }

                        // if user just come online
                        if (listOfUsers[message.remoteUserId] && listOfUsers[message.remoteUserId].socket) {
                            joinARoomNoOwner(message);
                            return;
                        }

                        setTimeout(repeater, 1000);
                    })();

                    return;
                }

                onMessageCallback(message);
            } catch (e) {
                errorHandlerFnt('on-socketMessageEvent is :: ', null, e);
            }
        });


		// 접속종료
        socket.on('disconnect', function() {
//			logForRoomAndUsers('disconnect start');
            try {
                if (socket && socket.namespace && socket.namespace.sockets) {
                    delete socket.namespace.sockets[this.id];
                }
            } catch (e) {
                errorHandlerFnt('disconnect socket is :: ', null, e);
            }

            try {
                var message = shiftedModerationControls[socket.userid];

                if (message) {
                    delete shiftedModerationControls[message.userid];
                    onMessageCallback(message);
                }
            } catch (e) {
                errorHandlerFnt('disconnect message is :: ', null, e);
            }


            try {
				var roomid = socket.handshake.query['roomid'];
                
            	// 룸에서 자신의 정보 삭제
        		logger.info("roomList["+roomid+"] is :: " + roomList[roomid]);
        		if(roomList[roomid]){
	        		for(var i=0; i<roomList[roomid].length ;++i){
	        			logger.info("roomList[roomid][i]['userid'] : " + roomList[roomid][i]['userid'] + " // socket.userid : " + socket.userid);
	        			
	        			if(roomList[roomid][i]['userid'] == socket.userid){
							// 첫 번째 제거
	        				if(i == 0) {
	        					logger.info("-- delete(i == 0)");
	        					roomList[roomid].shift();
	        				}

	        				// 마지막 제거
	        				else if (i == roomList[roomid].length-1){
	        					logger.info("-- delete(i == roomList[roomid].length-1)");
	        					roomList[roomid].pop();
	        				}

							// 그 외 제거
	        				else{
	        					logger.info("-- delete else");
	        					roomList[roomid].splice(i, i);
	        				}
	        				break;
	        			}
	        		}
                  
                  	// 해당 방의 접속자 확인
	        		logger.info(" ---- disconnect - delete after - room user list log start ---- ");
	        		for(var i=0; i<roomList[roomid].length ;++i){
	        			logger.info("roomList["+roomid+"]["+i+"]['userid'] : " + roomList[roomid][i]['userid']);
	        		}
	        		logger.info(" ---- disconnect - delete after - room user list log end ---- ");
        		}
        		
        		// 사용자가 없는 경우 방 삭제
        		if(roomList[roomid] && roomList[roomid].length <= 0){
                    logger.info("roomList["+roomid+"] is delete " + roomList[roomid]);
        			delete roomList[roomid];
        		}
        		
            } catch (e) {
                errorHandlerFnt('disconnect delete is :: ', null, e);
            }

            try{
            	// 사용자삭제
            	delete listOfUsers[socket.userid];
            	
            	logForRoomAndUsers('disconnect end');
            } catch (e) {
            	errorHandlerFnt('disconnect delete listOfUsers is :: ', null, e);
            }
        });

        if (socketCallback) {
            socketCallback(socket);
        }
    }
};


// removing JSON from cache
function uncache(jsonFile) {
    searchCache(jsonFile, function(mod) {
        delete require.cache[mod.id];
    });

    Object.keys(module.constructor._pathCache).forEach(function(cacheKey) {
        if (cacheKey.indexOf(jsonFile) > 0) {
            delete module.constructor._pathCache[cacheKey];
        }
    });
}

function searchCache(jsonFile, callback) {
    var mod = require.resolve(jsonFile);

    if (mod && ((mod = require.cache[mod]) !== undefined)) {
        (function run(mod) {
            mod.children.forEach(function(child) {
                run(child);
            });

            callback(mod);
        })(mod);
    }
}
