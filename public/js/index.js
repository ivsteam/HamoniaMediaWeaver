/**
 * 
 */

window.enableAdapter = true; // enable adapter.js
var connectionCheck = false;

var localStream;
var roomName = '';
var userName = '';
var fileSelectValue = '::::f!le$electCheckV@lue::::';
var messageSplit = "::::H@moni@::split::::";
var newMsgCnt = 0;		// 새 메세지 수


// 브라우저 체크
function browserCheck(){
	var agt = navigator.userAgent.toLowerCase();
	var text = '';
	
	if (agt.indexOf("edge/") != -1)				text = 'Edge';
	else if (agt.indexOf("trident") != -1)		text = 'Trident';
	else if (agt.indexOf("opr/") != -1)			text = 'Opera';
	else if (agt.indexOf("chrome") != -1)		text = 'Chrome';
	else if (agt.indexOf("staroffice") != -1)	text = 'Star Office';
	else if (agt.indexOf("webtv") != -1)		text = 'WebTV';
	else if (agt.indexOf("beonex") != -1)		text = 'Beonex';
	else if (agt.indexOf("chimera") != -1)		text = 'Chimera';
	else if (agt.indexOf("netpositive") != -1)	text = 'NetPositive';
	else if (agt.indexOf("phoenix") != -1)		text = 'Phoenix';
	else if (agt.indexOf("firefox") != -1)		text = 'Firefox';
	else if (agt.indexOf("safari") != -1)		text = 'Safari';
	else if (agt.indexOf("skipstone") != -1)	text = 'SkipStone';
	else if (agt.indexOf("netscape") != -1)		text = 'Netscape';
	else if (agt.indexOf("mozilla/5.0") != -1)	text = 'Mozilla';
	
	console.log(' ---- agt //  text : ' + agt + ' // ' + text);
	
	return text;
}


$('.bottom_right').on('click', '#open-or-join-room', function(){
	
	// 비회원 사용자 id 설정
	if(!$('#userName').val()){
		$('#userName').val(messageSplit + connection.token());
	}
	
	
	
	var text = browserCheck();
	
	
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
    	$.cookie('roomid', '');
    	
        if (!isRoomExists) {
//            showRoomURL(roomid);
        }
    });
});

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
	location.href= "/";
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
    sendMessageFnt();
};

var chatContainer = document.querySelector('.chat-output');

function appendDIV(event) {
	
	if(event.data.indexOf(messageSplit) != -1){
		// 채팅 메세지를 받은 경우
		createreceMsgDiv(unescape(event.data.split(messageSplit)[0]), unescape(event.data.split(event.data.split(messageSplit)[0]+messageSplit)[1]));
		newMsgCntFnc();
		return;
	}
	
	if(event.data.indexOf(fileSelectValue) != -1){
		var valueData = unescape(event.data.split(fileSelectValue)[1]);
		var valueDataTrueCheck = valueData.indexOf('&fileNm=');
		var whiteboardTrueCheck = valueData.indexOf('&param=');
		var whiteboardClickCheck = valueData.indexOf('&whiteBoard=');
		
		if(valueDataTrueCheck != -1){
			// board 파일선택 버튼 disabled
			
			valueDataTrueCheck = valueData.split('&fileNm=');
			
			if(valueDataTrueCheck[0] == 'true'){
				$('#pdf').data('value', false).attr('disabled', valueDataTrueCheck[0]).parent('a.file').attr('disabled', valueDataTrueCheck[0]);
				$('#pdfName').text(valueDataTrueCheck[1]);
				$('#imgDiv').empty();
			}
		}else if( whiteboardTrueCheck != -1 ){
			whiteboardTrueCheck = valueData.split('&param=');
			$('#whiteboard').attr('src', whiteboardTrueCheck[1] + userName);
		}else if ( whiteboardClickCheck != -1 ){
		}
		else{
			$('#imgDiv').append('<img id="' + valueDataTrueCheck[1] + '" src="' + valueData + '" class="uploadImg">');
		}
		return;
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


connection.bandwidth = {
    audio: 128,
    video: 1024,
    screen: 1024
};

var text = browserCheck();
if (/iPhone|iPad|iPod/i.test(navigator.userAgent) || /Android/i.test(navigator.userAgent)) {
	var videoConstraintsMobile = {
		mandatory: {
			minWidth: 1280,
			minAspectRatio: 1.77
		},
		optional: [{facingMode: 'user'}]
	}; 
	connection.mediaConstraints.video = videoConstraintsMobile;
}else{
	var videoConstraints = {
		mandatory: {
			maxWidth: 1920,
			maxHeight: 1080,
			minWidth: 1280,
			minHeight: 720,
			minAspectRatio: 1.77,
			minFrameRate: 30,
			maxFrameRate: 64
		},
		optional: [{facingMode: 'user'}]
	}; 
	connection.mediaConstraints.video = videoConstraints;
}

connection.sdpConstraints.mandatory = {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: true
};

connection.videosContainer = document.getElementById('videos-container');
connection.onstream = function(event) {
	var existing = document.getElementById(event.streamid);
	if(existing && existing.parentNode) {
		existing.parentNode.removeChild(existing);
	}

    event.mediaElement.removeAttribute('src');
    event.mediaElement.removeAttribute('srcObject');

    var width;
    var video = document.createElement('video');
    var text = browserCheck();
    
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent) && text == 'Safari') {
    	// iOS safari 인 경우
		video.controls = true;
		video.setAttribute('muted', true);
		video.setAttribute('playsinline', true);
	}else{
		try {
			video.setAttributeNode(document.createAttribute('autoplay'));
			video.setAttributeNode(document.createAttribute('playsinline'));
		} catch (e) {
			video.setAttribute('autoplay', true);
			video.setAttribute('playsinline', true);
		}
	}

    
    if(event.type === 'local') {
    	// 내 영상
        video.muted = true;
        video.id = "myVideo";
    	
		localStream = event.stream;
        
		try {
            video.setAttributeNode(document.createAttribute('muted'));
        } catch (e) {
            video.setAttribute('muted', true);
        }
        
        roomName = $('#room-id').val();
        userName = $('#userName').val();
        
        if(userName.indexOf(messageSplit) != -1){
        	userName = 'Guest' + userName.split(messageSplit)[1];
        }
        
        $('#joinRoom').css('display', 'block');
        $('#createRoom').remove();
        
//        width = 100;
    }else{
    	// 그 외
        video.muted = true;
    	video.id = event.userid;
    	width = parseInt(connection.videosContainer.clientWidth / 2) - 20;
//    	width = 15;
    }
    
    video.srcObject = event.stream;

    var mediaElement = getHTMLMediaElement(video, {
        //title: event.userid, // 영상 상단 text
        buttons: ['full-screen'],
        width: width,
        showOnMouseEnter: false
    });
    
    mediaElement.dataset.name = event.userid;
    connection.videosContainer.appendChild(mediaElement);

    setTimeout(function() {
        mediaElement.media.play();
    }, 5000);
    
    mediaElement.id = event.streamid;
    
    $('body').css('overflow', 'hidden');
    
    // 방장표시
   	var mContains = $('.media-container');
   	for(var i=0; i<mContains.length ;++i){
   		if(mContains.eq(i).data('name') == roomName){
   			mContains.eq(i).css('border', '2px solid orange');
   		}
   	}
    
    refreshVideoView(true);
};


connection.onstreamended = function(event) {
	console.log(' ---- onstreamended : ');
    var mediaElement = document.getElementById(event.streamid);
    if (mediaElement) {
        mediaElement.parentNode.removeChild(mediaElement);
    }
};

connection.onmessage = appendDIV;
connection.filesContainer = document.getElementById('file-container');

connection.onopen = function() {
	console.log(' ---- onopen : ');

	var chkIos = browserCheck();
	if (/iPhone|iPad|iPod/i.test(navigator.userAgent) && chkIos == 'Safari') {
		console.log("Safari");
		for( var a=0; a<$('.media-container').length; a++ ){
			$('video')[a].muted = true;
		}
	}
	setTimeout(function() {
		var videoDivCnt = $('.media-container').length;
		for( var a=0; a<videoDivCnt; a++ ){
			if( $('video')[a].muted  ){
				$('video')[a].muted = false;
//				$('video')[a].removeAttribute("controls");
			}else{
			}
		}
		
		tmp = videoDivCnt;
	}, 6000);


    document.getElementById('share-file').disabled = false;
    document.getElementById('input-text-chat').disabled = false;
    document.getElementById('btn-leave-room').disabled = false;
    
    if(roomName == $('#myVideo').parent('.media-box').parent('.media-container').data('name')){
    	// 생성자
    	$('.actions .btn.file').attr('disabled', false);
    	$('#pdf').attr('disabled', false);
    }else{
    	// 접속자
    	$('.actions').css('display', 'none');
    	$('#imgDiv').css('height', '90%');
    	$('.center').css('height', '10%');
    }
    
    
    connectionCheck = true;
    
};

connection.onclose = function(event) {
    if (connection.getAllParticipants().length) {
        console.log('You are still connected with: ' + connection.getAllParticipants().join(', '));
    } else {
    	console.log('Seems session has been closed or all participants left.');
    }
    
    // safari video delete
    $('#'+event.userid).parent('.media-box').parent('.media-container').remove();
	refreshVideoView(false);
};

connection.onEntireSessionClosed = function(event) {
    document.getElementById('share-file').disabled = true;
    document.getElementById('input-text-chat').disabled = true;

    connection.attachStreams.forEach(function(stream) {
        stream.stop();
    });

    // don't display alert for moderator
    if (connection.userid === event.userid) return;
    console.log('Entire session has been closed by the moderator: ' + event.userid);
    
    if(confirm('방장이 영상통화를 종료하였습니다.\n메인페이지로 이동합니다.')) location.reload();
};

connection.onUserIdAlreadyTaken = function(useridAlreadyTaken, yourNewUserId) {
	console.log(' ---- onUserIdAlreadyTaken : ');
    // seems room is already opened
    connection.join(useridAlreadyTaken);
};

function disableInputButtons() {
    document.getElementById('open-or-join-room').disabled = true;
    document.getElementById('room-id').disabled = true;
    document.getElementById('userName').disabled = true; //
    document.getElementById('share-file').disabled = true;
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
