var listOfUsers = {};
var roomList = {};
var shiftedModerationControls = {};
var ScalableBroadcast;
var logger = require('./log4js-utils').logger();

//maximum member of users = customMaxParticipantsAllowed
var customMaxParticipantsAllowed = 4;




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
	


    function onConnection(socket) {

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
                logger.ingo('extra-data-updated is :: ' +  e);
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
                logger.ingo('become-a-public-moderator is :: '+ e);
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
                logger.ingo('dont-make-me-moderator is :: '+ e);
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
                logger.ingo('get-public-moderators is :: ' + e);
            }
        });
	

        socket.on('changed-uuid', function(newUserId, callback) {
			roomList[newUserId] = {
				userid: socket.userid,
				roomNm : newUserId
			};
			logger.info("changed-uuid is :: "+ JSON.stringify(roomList[newUserId]));
            callback = callback || function() {};

            if (params.dontUpdateUserId) {
                delete params.dontUpdateUserId;
                return;
            }

            try {
                if (listOfUsers[socket.userid] && listOfUsers[socket.userid].socket.userid == socket.userid) {
                    if (newUserId === socket.userid) return;

                    var oldUserId = socket.userid;
                    listOfUsers[newUserId] = listOfUsers[oldUserId];
                    listOfUsers[newUserId].socket.userid = socket.userid = newUserId;
                    delete listOfUsers[oldUserId];

                    callback();
                    return;
                }
                socket.userid = newUserId;
                appendUser(socket);

                callback();
            } catch (e) {
                logger.ingo('changed-uuidis :: '+ e);
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
                logger.ingo('disconnect-with is :: '+ e);
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

        socket.on('check-presence', function(userid, callback) {
            if (!listOfUsers[userid]) {
                callback(false, userid, {});
            } else {
                callback(userid !== socket.userid, userid, listOfUsers[userid].extra);
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
                logger.ingo('onMessageCallback is ::' + e);
            }
        }

        function joinARoom(message) {
        	
			roomList[message.sender] = {
				userid: message.sender,
				roomNm : message.remoteUserId
			};
			
            var roomInitiator = listOfUsers[message.remoteUserId];

            if (!roomInitiator) {
                return;
            }

            var usersInARoom = roomInitiator.connectedWith;
            var maxParticipantsAllowed = roomInitiator.maxParticipantsAllowed;
            
            // 인원수
            roomMemberCnt = Object.keys(usersInARoom).length+1;
            
            if (Object.keys(usersInARoom).length >= maxParticipantsAllowed) {
            	var memCnt = roomMemberCnt + '/' + ( customMaxParticipantsAllowed );
				
				socket.emit('room-full', message.remoteUserId, memCnt);

                if (roomInitiator.connectedWith[socket.userid]) {
                    delete roomInitiator.connectedWith[socket.userid];
                }
                return;
            }

            var inviteTheseUsers = [roomInitiator.socket];
            Object.keys(usersInARoom).forEach(function(key) {
                inviteTheseUsers.push(usersInARoom[key]);
            });

            var keepUnique = [];
            inviteTheseUsers.forEach(function(userSocket) {
                if (userSocket.userid == socket.userid) return;
                if (keepUnique.indexOf(userSocket.userid) != -1) {
                    return;
                }
                keepUnique.push(userSocket.userid);

                if (params.oneToMany && userSocket.userid !== roomInitiator.socket.userid) return;

                message.remoteUserId = userSocket.userid;
                userSocket.emit(socketMessageEvent, message);
            });
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

                    if (listOfUsers[message.remoteUserId]) {
                        joinARoom(message);
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
                            joinARoom(message);
                            return;
                        }

                        setTimeout(repeater, 1000);
                    })();

                    return;
                }

                onMessageCallback(message);
            } catch (e) {
                logger.ingo('on-socketMessageEvent is ::' + e);
            }
        });


        socket.on('disconnect', function() {
            try {
                if (socket && socket.namespace && socket.namespace.sockets) {
                    delete socket.namespace.sockets[this.id];
//					delete roomList[this.id];
                }
				
            } catch (e) {
                logger.ingo('disconnect is ::' + e);
            }

            try {
                var message = shiftedModerationControls[socket.userid];

                if (message) {
                    delete shiftedModerationControls[message.userid];
                    onMessageCallback(message);
                }
            } catch (e) {
                logger.ingo('disconnect is :: ' + e);
            }

            try {
				
				delete roomList[socket.userid];

                // inform all connected users
                if (listOfUsers[socket.userid]) {
                    var firstUserSocket = null;
			
                    for (var s in listOfUsers[socket.userid].connectedWith) {
                        if (!firstUserSocket) {
                            firstUserSocket = listOfUsers[socket.userid].connectedWith[s];
                        }

                        listOfUsers[socket.userid].connectedWith[s].emit('user-disconnected', socket.userid);

                        if (listOfUsers[s] && listOfUsers[s].connectedWith[socket.userid]) {

                            delete listOfUsers[s].connectedWith[socket.userid];
                            listOfUsers[s].socket.emit('user-disconnected', socket.userid);

                        }
                    }

                    if (socket.shiftModerationControlBeforeLeaving && firstUserSocket) {
                        firstUserSocket.emit('become-next-modrator', sessionid);
                    }
                }
            } catch (e) {
                logger.ingo('disconnect is :: ' +  e);
            }

            delete listOfUsers[socket.userid];
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
