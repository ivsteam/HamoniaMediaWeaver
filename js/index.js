/**
 * 
 */

window.enableAdapter = true; // enable adapter.js

var roomName = '';
var userName = '';
var messageSplit = "::::H@moni@::split::::";
var newMsgCnt = 0;		// 새 메세지 수

document.getElementById('open-or-join-room').onclick = function() {
	if($('#room-id').val().replace(/^\s+|\s+$/g, '').length < 1) {
		$('#room-id').focus();
		return;
	}
	if($('#userName').val().replace(/^\s+|\s+$/g, '').length < 1) {
		$('#userName').focus();
		return;
	}
	
	disableInputButtons();
    connection.openOrJoin(document.getElementById('room-id').value, function(isRoomExists, roomid) {
        if (!isRoomExists) {
//            showRoomURL(roomid);
        }
    });
};

document.getElementById('btn-leave-room').onclick = function() {
    this.disabled = true;

    if (connection.isInitiator) {
        // use this method if you did NOT set "autoCloseEntireSession===true"
        // for more info: https://github.com/muaz-khan/RTCMultiConnection#closeentiresession
        connection.closeEntireSession(function() {
//			document.querySelector('h1').innerHTML = 'Entire session has been closed.';
        	console.log('Entire session has been closed.');
        });
    } else {
        connection.leave();
    }
    
    location.reload();
};

// ......................................................
// ................FileSharing/TextChat Code.............
// ......................................................

document.getElementById('share-file').onclick = function() {
    var fileSelector = new FileSelector();
    fileSelector.selectSingleFile(function(file) {
        connection.send(file);
        
        if(!$('#chat-container').data('value')) {
        	$('.chatBtn').trigger('click');
        }
    });
    
};



document.getElementById('input-text-chat').onkeyup = function(e) {
    if (e.keyCode != 13) return;

    // removing trailing/leading whitespace
    this.value = this.value.replace(/^\s+|\s+$/g, '');
    if (!this.value.length) return;

    connection.send(userName + messageSplit + this.value);
    createMeMsgDiv(this.value);
    this.value = '';
};

var chatContainer = document.querySelector('.chat-output');

function appendDIV(event) {
    if(event.data.indexOf(messageSplit) != -1){
		createreceMsgDiv(event.data.split(messageSplit)[0], event.data.split(event.data.split(messageSplit)[0]+messageSplit)[1]);
		newMsgCntFnc();
    }
}

// ......................................................
// ..................RTCMultiConnection Code.............
// ......................................................

var connection = new RTCMultiConnection();

// by default, socket.io server is assumed to be deployed on your own URL
connection.socketURL = '/';

// comment-out below line if you do not have your own socket.io server
// connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';

connection.socketMessageEvent = 'audio-video-file-chat-demo';

connection.enableFileSharing = true; // by default, it is "false".

connection.session = {
    audio: true,
    video: true,
    data: true
};

connection.sdpConstraints.mandatory = {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: true
};

connection.videosContainer = document.getElementById('videos-container');
connection.onstream = function(event) {
	// 16명 까지만 가능 - view 설정이 완료되면 제거할 것
	if($('.media-container').length + 1 > 16){
		alert('한 그룹당 최대 접속 인원은 16명 입니다.');
		location.reload();
	}
	
    event.mediaElement.removeAttribute('src');
    event.mediaElement.removeAttribute('srcObject');

    var width;
    var video = document.createElement('video');
    
    video.controls = true;
    
    if(event.type === 'local') {
    	// 내 영상
        video.muted = true;
        
        video.id = "myVideo";
        
        roomName = $('#room-id').val();
        userName = $('#userName').val();
        
        $('#joinRoom').css('display', 'block');
        $('#createRoom').remove();
        
        
//        width = 100;
    }else{
    	// 그 외
    	width = parseInt(connection.videosContainer.clientWidth / 2) - 20;
//    	width = 15;
    }
    
    video.srcObject = event.stream;

    var mediaElement = getHTMLMediaElement(video, {
        /*title: event.userid,*/
        buttons: ['full-screen'],
        width: width,
        showOnMouseEnter: false
    });

    connection.videosContainer.appendChild(mediaElement);

    setTimeout(function() {
        mediaElement.media.play();
    }, 5000);
    
    mediaElement.id = event.streamid;
    
    $('body').css('overflow', 'hidden');
    refreshVideoView();
};

connection.onstreamended = function(event) {
    var mediaElement = document.getElementById(event.streamid);
    if (mediaElement) {
        mediaElement.parentNode.removeChild(mediaElement);
    }
    refreshVideoView();
};

connection.onmessage = appendDIV;
connection.filesContainer = document.getElementById('file-container');

connection.onopen = function() {
    document.getElementById('share-file').disabled = false;
    document.getElementById('input-text-chat').disabled = false;
    document.getElementById('btn-leave-room').disabled = false;

//    document.querySelector('h1').innerHTML = 'You are connected with: ' + connection.getAllParticipants().join(', ');
};

connection.onclose = function() {
    if (connection.getAllParticipants().length) {
//		document.querySelector('h1').innerHTML = 'You are still connected with: ' + connection.getAllParticipants().join(', ');
        console.log('You are still connected with: ' + connection.getAllParticipants().join(', '));
    } else {
//		document.querySelector('h1').innerHTML = 'Seems session has been closed or all participants left.';
    	console.log('Seems session has been closed or all participants left.');
    }
};

connection.onEntireSessionClosed = function(event) {
    document.getElementById('share-file').disabled = true;
    document.getElementById('input-text-chat').disabled = true;
    document.getElementById('btn-leave-room').disabled = true;

    document.getElementById('open-or-join-room').disabled = false;
//    document.getElementById('open-room').disabled = false;
//    document.getElementById('join-room').disabled = false;
    document.getElementById('room-id').disabled = false;
    document.getElementById('userName').disabled = false;

    connection.attachStreams.forEach(function(stream) {
        stream.stop();
    });

    // don't display alert for moderator
    if (connection.userid === event.userid) return;
//	document.querySelector('h1').innerHTML = 'Entire session has been closed by the moderator: ' + event.userid;
    console.log('Entire session has been closed by the moderator: ' + event.userid);
};

connection.onUserIdAlreadyTaken = function(useridAlreadyTaken, yourNewUserId) {
    // seems room is already opened
    connection.join(useridAlreadyTaken);
};

function disableInputButtons() {
    document.getElementById('open-or-join-room').disabled = true;
//    document.getElementById('open-room').disabled = true;
//    document.getElementById('join-room').disabled = true;
    document.getElementById('room-id').disabled = true;
    document.getElementById('userName').disabled = true;
}

// ......................................................
// ......................Handling Room-ID................
// ......................................................

function showRoomURL(roomid) {
    var roomHashURL = '#' + roomid;
    var roomQueryStringURL = '?roomid=' + roomid;

    var html = '<h2>Unique URL for your room:</h2><br>';

    html += 'Hash URL: <a href="' + roomHashURL + '" target="_blank">' + roomHashURL + '</a>';
    html += '<br>';
    html += 'QueryString URL: <a href="' + roomQueryStringURL + '" target="_blank">' + roomQueryStringURL + '</a>';

    var roomURLsDiv = document.getElementById('room-urls');
    roomURLsDiv.innerHTML = html;

    roomURLsDiv.style.display = 'block';
}

(function() {
    var params = {},
        r = /([^&=]+)=?([^&]*)/g;

    function d(s) {
        return decodeURIComponent(s.replace(/\+/g, ' '));
    }
    var match, search = window.location.search;
    while (match = r.exec(search.substring(1)))
        params[d(match[1])] = d(match[2]);
    window.params = params;
})();

// 접속시 room 명칭 설정
var roomid = '';
if (localStorage.getItem(connection.socketMessageEvent)) {
	roomid = localStorage.getItem(connection.socketMessageEvent);
//	console.log(' ::::: roomid // userName : ' + roomid + ' // ' + userName);
} else {
//	roomid = connection.token();
}

// roomid 자동입력
document.getElementById('room-id').value = roomid;
document.getElementById('room-id').onkeyup = function() {
    localStorage.setItem(connection.socketMessageEvent, this.value);
};

var hashString = location.hash.replace('#', '');
if (hashString.length && hashString.indexOf('comment-') == 0) {
    hashString = '';
}

var roomid = params.roomid;
if (!roomid && hashString.length) {
    roomid = hashString;
}

if (roomid && roomid.length && $('#userName').val() !==undefined && $('#userName').val().length) {
    document.getElementById('room-id').value = roomid;
    localStorage.setItem(connection.socketMessageEvent, roomid);

    // auto-join-room
    (function reCheckRoomPresence() {
        connection.checkPresence(roomid, function(isRoomExists) {
            if (isRoomExists) {
            	// 방이 있는 경우
                connection.join(roomid);
                
                roomName = $('#room-id').val();
                userName = $('#userName').val();
                
                $('#joinRoom').css('display', 'block');
                $('#createRoom').remove();
                
                return;
                
            }else{
            	// 방이 없는 경우
            	alert('해당 그룹을 찾을 수 없습니다.');
            	location.href = location.protocol + "//" + location.host;
            }

            setTimeout(reCheckRoomPresence, 5000);
        });
    })();

    disableInputButtons();
}