/**
 * https://hamonia.kr
 * 
 * value isOnlyOneOwnerFnt is in RTCMultiConnection.js
 */

window.enableAdapter = true; // enable adapter.js

var isRoomLogger = true;
var isGetStatus = false;	// video 화면에 정보 출력
var connectionCheck = false;

var vdoInfoCheck = false;	// video infomation - width , height , 

var localStream;
var roomName = '';
var userName = '';
var fileSelectValue = '::::f!le$electCheckV@lue::::';
var messageSplit = "::::H@moni@::split::::";
var changeNameValue = '::::ch@nge::user::N@me::::';
var newMsgCnt = 0;		// 새 메세지 수


$(document).ready(function(){
	// os 및 browser 체크
	if( !browserCheck(false) ) location.href = "https://" + location.host;
	
	// 카메라 유무 확인 및 권한 확인(브라우저명)
	checkingHasCameraNPermission(browserCheckReturnText());
});


// 카메라 유무 확인 및 권한 확인(브라우저명)
function checkingHasCameraNPermission(browserText){
	// 카메라 확인
	DetectRTC.load(function() {
		if(DetectRTC.videoInputDevices.length <= 0){
			messageWindowFnt('사용가능한 카메라가 없습니다.<br/>확인후 다시 시도해 주시기 바랍니다.', '/');
		}else{
			
			if(isRoomLogger) {
				var mVideo = connection.mediaConstraints.video;
				for(var key in mVideo)
					for(var key1 in mVideo[key])
						console.log("==== mVideo key : " + key + ' // key1 : ' + key1 
								+ '// mVideo[key] : ' + mVideo[key][key1]);
			}
			
			// 권한을 거부할 경우 관련 알림 Function 은 RTCMultiConnection.js
			// connection.onMediaError = function(error, constraints) { ... }
			
			var userMediaOption = { 
					audio: true,
					video: connection.mediaConstraints.video
			};
			
			// 브라우저에서 자동으로 권한을 묻는 경우
			if(browserText == 'Safari')	{
				if(isRoomLogger) console.log('==== Safari');
				
				roomOpenNJoinFnt();	// 접속
			}
			
			
			else if(browserText == 'Firefox'){
				if($.cookie('cameraInfo') != null){
					if(isRoomLogger) console.log('==== Firefox have cookie');
					
					navigator.mediaDevices.getUserMedia(userMediaOption).then(function(stream){
						if(isRoomLogger) console.log('==== Firefox - connection');
						
						roomOpenNJoinFnt();	// 접속
					}).catch(function(err){
						console.log('==== Firefox - err : ' + err);
					});
				}else{
					if(isRoomLogger) console.log('==== Firefox not cookie');
					roomOpenNJoinFnt();	// 접속
				}
			}
			
			
			// 브라우저에서 권한을 묻지 않는 경우
			else if(browserText == 'Chrome'){
				if(isRoomLogger) console.log('==== Chrome');
				
				// 권한 확인을 위한 반복문 - 크롬
				var interval = setInterval(function permissionIntervalStartFnt(intervalVal){
					var permissionWindowIsOpen = false;
					
					navigator.getUserMedia(userMediaOption, function(localMediaStream) {
						if(isRoomLogger) console.log('==== Chrome - connection');
						
						clearInterval(interval); // 권한 확인 후 반복문 종료
						roomOpenNJoinFnt();		// 접속
						
						// 권한 허용 방법 알림창 닫기
						$('#permissionAlert').css('display','');
					}, function(err) {
						console.log('==== Chrome - err : ' + err);
						
						// 권한 알림창
						if( !permissionWindowIsOpen ){
							permissionWindowIsOpen = true;
							
							// 브라우저별 알림내용 변경
							$('.chrome').css('display', 'block');
							
							$('#permissionAlert').css('left', ($(window).width() - $('#permissionAlert').width() ) / 2)
							.css('top', ($(window).height() - $('#permissionAlert').height() - 80 ) / 2).css('display', 'block');
						}
					});
				}, 1300);
			}else{
				// 권한 확인 - 기타
				navigator.getUserMedia(userMediaOption, function(localMediaStream) {
					roomOpenNJoinFnt();// 접속
				}, function(e) {
					// 권한 알림창
					
					$('#permissionAlert').css('left', ($(window).width() - $('#permissionAlert').width() ) / 2)
					.css('top', ($(window).height() - $('#permissionAlert').height() - 80 ) / 2).css('display', 'block');
				});
			}
		}
	});
}


// 메세지창
function messageWindowFnt(msg, url){
	$('#messageAlert').css('display', 'block');
	$('#messageTag').html(msg);
	$('.messageBtn').attr('onclick', 'location.href="' + url + '"');
	
	$('#messageAlert').css('left', ($(window).width() - $('#messageAlert').width() ) / 2)
					.css('top', ($(window).height() - $('#messageAlert').height() - 80 ) / 2).css('display', 'block');
}


// 접속
function roomOpenNJoinFnt(){
	
	psycareFnt();	// 심리센터
	
	// URL
	if(location.href.split('psycare').length == 2) {
		try{
			$('#room-id').val(location.href.split(location.host+'/')[1].split('?roomid=')[1].split('&name=')[0]);
		}catch(err){
			alert('잘못된 경로입니다.');
			location.href = "https://" + location.host;
		}
	} else {
		$('#room-id').val(location.href.split(location.host+'/')[1]);
	}
	
	var inputRoomid = decodeURI($('#room-id').val().replace(/^\s+|\s+$/g, ''), 'UTF-8');
	
	
	// 방이름 입력확인
	if(inputRoomid.length < 1) {
		$('#room-id').focus();
		location.href = "https://" + location.host;
		return;
	}

	// 대화명 설정
	if($.cookie('userName') != null) $('#userName').val($.cookie('userName'));
	else $('#userName').val('Guest');
	
	
	if($('#userName').val().replace(/^\s+|\s+$/g, '').length < 1) {
		$('#userName').focus();
		return;
	}
	
	disableInputButtons();
    connection.openOrJoin(inputRoomid, function(isRoomExists, roomid) {
    	$.cookie('roomid', '');
		
        if (!isRoomExists) {
//			showRoomURL(roomid);
        }
    });
}



document.getElementById('btn-leave-room').onclick = function() {
    this.disabled = true;
    
    if ( isOnlyOneOwnerFnt && connection.isInitiator) {
        // use this method if you did NOT set "autoCloseEntireSession===true"
        // for more info: https://github.com/muaz-khan/RTCMultiConnection#closeentiresession
        connection.closeEntireSession(function() {
//			document.querySelector('h1').innerHTML = 'Entire session has been closed.';
        	console.log('Entire session has been closed.');
        });
    } else {
        connection.leave();
    }
	location.href = "https://" + location.host;
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
	
	if(event.data.indexOf(changeNameValue) != -1){
		// 닉네임 변경한 경우
		// event.date : changeNameValue + user .media-container id + changeNameValue + newUserName
		
		var containers = $('.media-container');
		
		var id = event.data.split(changeNameValue)[1];
		var newUserName = unescape(event.data.split(changeNameValue)[2]);
		
		// firefox 인 경우 앞 뒤로 {, } 가 붙는데 수신시 %7B, %7D 로 변경되어 전송된다. 변환
		if(id.indexOf('%7B') == 0) id = '{' + id.split('%7B')[1];
		if(id.indexOf('%7D') == (id.length - '%7D'.length)) id = id.split('%7D')[0] + '}';
		
		for(var i=0; i<containers.length ;++i){
			if(containers.eq(i).attr('id') == id){
				var mediabox = containers.eq(i).children('.media-box');
				
				mediabox.children('h2').text(newUserName);
				mediabox.children('video').data('name', newUserName);
			}
		}
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
//			whiteboardClickCheck = valueData.split('&whiteBoard=');
//			var result = window.confirm('룸 참여자가 화이트보드 페이지로 접속하셨습니다. \n 해당 페이지로 이동하시겠습니까?');
//			if(result) {
//				boardDivFnt();	
//			};
		}
		else{
			// 선택된 board 파일 띄우기 - 중복체크
//			var sameCheck = false;
//			for(var i=0; i<$('#imgDiv .uploadImg').length ;++i){
//				if($('#imgDiv .uploadImg').eq(i).attr('src') == valueData){
//					sameCheck = true;
//					break;
//				}
//			}
//			if( !sameCheck ) {
				$('#imgDiv').append('<img id="' + valueDataTrueCheck[1] + '" src="' + valueData + '" class="uploadImg">');
//			}
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
    video: 2048,
    screen: 1024
};

if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
	if(isRoomLogger) console.log("==== $.cookie('cameraInfo') ios : " + $.cookie('cameraInfo'));
	
	// ios 카메라 전환 미구현 - 구현될때까지 버튼 제거
	$('.buttonOption').css('display', 'none');
	
	var videoConstraintsMobile = {
		mandatory: {
//			minWidth: 640,
//			minAspectRatio: 1.77
		},
		optional: [{facingMode: 'user'}]
	}; 
	connection.mediaConstraints.video = videoConstraintsMobile;
}else{
	if(isRoomLogger) console.log("==== $.cookie('cameraInfo') other : " + $.cookie('cameraInfo'));
	
	if(browserCheckReturnText() == 'Safari'){
		// safari 현재 방식으론 카메라 전환이 불가능
		$('.buttonOption').css('display', 'none');
	}

	var videoConstraints;
	
	if($.cookie('cameraInfo') != null){
		// 카메라 변경 리로드시 설정
		
		if(DetectRTC.browser.name === 'Firefox'){
			if(isRoomLogger) console.log('re camera firefox');
			
			videoConstraints = {
				echoCancellation: { exact: false },
				deviceId: { exact: $.cookie('cameraInfo') },
				frameRate: {
					maxWidth: 1920,
					maxHeight: 1080,
					minWidth: 640,
					minHeight: 320,
					minAspectRatio: 1.77,
//					minFrameRate: 30,
					maxFrameRate: 64
				}
			}
		}else{
			if(isRoomLogger) console.log('re camera other');
			
			videoConstraints = {
				mandatory: {
					maxWidth: 1920,
					maxHeight: 1080,
					minWidth: 640,
					minHeight: 320,
					minAspectRatio: 1.77,
//					minFrameRate: 30,
					maxFrameRate: 64
				},
				optional: [
					{ sourceId : $.cookie('cameraInfo') }
				]
			}
		}
	}else{
		// 일반 설정
		if(DetectRTC.browser.name === 'Firefox'){
			if(isRoomLogger) console.log('camera firefox');
			
			videoConstraints = {
				echoCancellation: { exact: false },
				facingMode: 'user',
				frameRate: {
					maxWidth: 1920,
					maxHeight: 1080,
					minWidth: 640,
					minHeight: 320,
					minAspectRatio: 1.77,
//					minFrameRate: 30,
					maxFrameRate: 64
				}
			}
		}else{
			if(isRoomLogger) console.log('camera other');
			
			videoConstraints = {
				mandatory: {
					maxWidth: 1920,
					maxHeight: 1080,
					minWidth: 640,
					minHeight: 320,
					minAspectRatio: 1.77,
//					minFrameRate: 30,
					maxFrameRate: 64
				},
				optional: [{facingMode: 'user'}]
			}; 
		}
	}
	
	connection.mediaConstraints.video = videoConstraints;
}

connection.sdpConstraints.mandatory = {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: true
};

connection.videosContainer = document.getElementById('videos-container');
connection.onstream = function(event) {
	if(isRoomLogger) console.log('---- connection.onstream - event.type : ' + event.type);
	
//	alert(event.mediaElement.videoWidth + ' // ' + event.mediaElement.videoHeight);
	
	var existing = document.getElementById(event.streamid);
	if(existing && existing.parentNode) {
		existing.parentNode.removeChild(existing);
	}

    event.mediaElement.removeAttribute('src');
    event.mediaElement.removeAttribute('srcObject');

    var width;
    var video = document.createElement('video');
    var text = browserCheckReturnText();
    
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
        
        // 닉네임 설정
		if($.cookie('userName') != null) video.setAttribute('data-name', $.cookie('userName'));
        else video.setAttribute('data-name', 'Guest');
    	
		localStream = event.stream;
        
		try {
            video.setAttributeNode(document.createAttribute('muted'));
        } catch (e) {
            video.setAttribute('muted', true);
        }
        
        roomName = $('#room-id').val();
        userName = $('#userName').val();
        
//		if(userName.indexOf(messageSplit) != -1){
//			userName = 'Guest' + userName.split(messageSplit)[1];
//		}
        
        $('#joinRoom').css('display', 'block');
        $('#createRoom').remove();
        
//		width = 100;
        
		// 로딩제거
        $('#roomProgressBar').css('display', 'none');
        
        if(navigator.platform){
    		if(!checkmob){
    			// alert('PC');
    			// 주소표시
    			$('#linkDiv').css('display', '');
    			$('#linkInfoDiv').css('display', '');
    		}
        }
        
        
        // 메뉴표시
        $('#footerMenu').css('display', '');
        
        // 메뉴
        $('#menuDiv').css('display', 'block');
        
        // 설정창 열린경우 닫기
        $('#mask').css('display', 'none');
		$('#optionAlert').css('display', 'none');
        
        // 사용중인 카메라 정보 등록
		if(isRoomLogger) console.log("==== $.cookie('cameraInfo') : " + $.cookie('cameraInfo'));
			
    	if( $.cookie('cameraInfo') != null ) {
    		$('#selectCamera').data('value', $.cookie('cameraInfo'));
    		$.removeCookie('cameraInfo');
    	}else{
    		// 기본값
    		$('#selectCamera').data('value', DetectRTC.videoInputDevices[0].deviceId);
    	}
    	if(isRoomLogger) console.log("==== $('#selectCamera').data('value') : " + $('#selectCamera').data('value'));
    }else{
    	// 그 외
//        video.muted = true;
    	video.id = event.userid;
    	video.setAttribute('data-name', 'Guest');
    	
    	width = parseInt(connection.videosContainer.clientWidth / 2) - 20;
//    	width = 15;
    	
    	// changeNameValue + user .media-container id + changeNameValue + newUserName
    	connection.send(
    			changeNameValue 
    			+ escape( $('#myVideo').parent('.media-box').parent('.media-container').attr('id') ) 
    			+ changeNameValue 
    			+ escape(userName)
    	);
    }
    
    video.srcObject = event.stream;

    var mediaElement = getHTMLMediaElement(video, {
        title: event.userid, // 영상 상단 text
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
    
    // 방장표시
   	var mContains = $('.media-container');
   	for(var i=0; i<mContains.length ;++i){
   		if(mContains.eq(i).data('name') == roomName){
   			
   			if( isOnlyOneOwnerFnt ) mContains.eq(i).css('border', '2px solid orange');
   				
//   			if(userName.indexOf(messageSplit) != -1){
//   	        	userName = 'Guest' + (connection.getAllParticipants().length + 1);
//   	        }
   		}
   	}
   	
   	$('#myVideo')[0].muted = true;
    
    refreshVideoView(true);
};


connection.onstreamended = function(event) {
    var mediaElement = document.getElementById(event.streamid);
    if (mediaElement) {
        mediaElement.parentNode.removeChild(mediaElement);
    }
};

connection.onmessage = appendDIV;
connection.filesContainer = document.getElementById('file-container');

connection.onopen = function() {
	
	var chkIos = browserCheckReturnText();
	console.log("chk=2=======" + $('.media-container').length);
//	if( $('.media-container').length != 0 ){
	
		if (/iPhone|iPad|iPod/i.test(navigator.userAgent) && chkIos == 'Safari') {
			for( var a=0; a<$('.media-container').length; a++ ){
				$('video')[a].muted = true;
			}

			setTimeout(function() {
				var videoDivCnt = $('.media-container').length;
				for( var a=0; a<videoDivCnt; a++ ){
					if( $('video')[a].muted && $('video')[a].id != 'myVideo'){
						$('video')[a].muted = false;
//						$('video')[a].play();
//						$('video')[a].removeAttribute("controls");
					}
				}
				
				tmp = videoDivCnt;
			}, 6000);

		}
		
//	}

//    document.getElementById('share-file').disabled = false;
//    document.getElementById('input-text-chat').disabled = false;
    document.getElementById('btn-leave-room').disabled = false;
    
    if(roomName == $('#myVideo').parent('.media-box').parent('.media-container').data('name')){
    	// 생성자
//    	$('.actions .btn.file').attr('disabled', false);
//    	$('#pdf').attr('disabled', false);
    }else{
    	// 접속자
    	$('.actions').css('display', 'none');
    	$('#imgDiv').css('height', '90%');
    	$('.center').css('height', '10%');
    }
    
//    document.getElementsByClassName('boardBtn')[0].disabled = false;
//    document.getElementsByClassName('chatBtn')[0].disabled = false;
//    document.getElementsByClassName('videoBtn')[0].disabled = false;
    
    connectionCheck = true;
    
//    createBoard();
//    document.querySelector('h1').innerHTML = 'You are connected with: ' + connection.getAllParticipants().join(', ');
};

connection.onclose = function(event) {
//	console.log(' ---- onclose : ' + connection.userid + ' // ' + event.userid);
    if (connection.getAllParticipants().length) {
        console.log('You are still connected with: ' + connection.getAllParticipants().join(', '));
    } else {
    	console.log('Seems session has been closed or all participants left.');
    }
    
    // safari video delete
    $('#'+event.userid).parent('.media-box').parent('.media-container').remove();
	refreshVideoView(false);
};

// 방장 종료시 실행
connection.onEntireSessionClosed = function(event) {
	console.log(' ---- onEntireSessionClosed - sessionid : ' + event.sessionid + ' // userid : ' + event.userid + ' // extra : ' + event.extra);
//    document.getElementById('share-file').disabled = true;
//    document.getElementById('input-text-chat').disabled = true;

//    connection.attachStreams.forEach(function(stream) {
//        stream.stop();
//    });

    // don't display alert for moderator
    if (connection.userid === event.userid) return;
    console.log('Entire session has been closed by the moderator: ' + event.userid);
    
    if(confirm('방장이 영상통화를 종료하였습니다.\n메인페이지로 이동합니다.')) location.href = "https://" + location.host;
};

connection.onUserIdAlreadyTaken = function(useridAlreadyTaken, yourNewUserId) {
	console.log(' ---- onUserIdAlreadyTaken : ');
    // seems room is already opened
    connection.join(useridAlreadyTaken);
};

function disableInputButtons() {
//    document.getElementById('open-or-join-room').disabled = true;
    document.getElementById('room-id').disabled = true;
    document.getElementById('userName').disabled = true;
//    document.getElementById('share-file').disabled = true;
}




//----------------------------------------------------
//getStats codes goes here
//----------------------------------------------------
connection.onPeerStateChanged = function(event) {
	if( !isGetStatus ) return;
	
	if(event.iceConnectionState === 'connected' && event.signalingState === 'stable') {
		if(connection.peers[event.userid].gettingStats === true) {
			return;
		}
		
		connection.peers[event.userid].gettingStats = true; // do not duplicate
		
		var peer = connection.peers[event.userid].peer;
		var interval = 1000;
		
		if(DetectRTC.browser.name === 'Firefox') {
			getStats(peer, peer.getLocalStreams()[0].getTracks()[0], function(stats) {
				onGettingWebRTCStats(stats, event.userid);
			}, interval);
		}
		else {
			getStats(peer, function(stats) {
				onGettingWebRTCStats(stats, event.userid);
			}, interval);
		}
	}
};

function onGettingWebRTCStats(stats, remoteUserId) {
	if(!connection.peers[remoteUserId]) {
		stats.nomore();
	}
	
	var statsData = 'UserID: ' + remoteUserId + '\n';
	statsData += 'Bandwidth: ' + bytesToSize(stats.bandwidth.speed);
	statsData += '\n';
	statsData += 'Encryption: ' + stats.encryption;
	statsData += '\n';
	statsData += 'Codecs: ' + stats.audio.recv.codecs.concat(stats.video.recv.codecs).join(', ');
	statsData += '\n';
	statsData += 'Data: ' + bytesToSize(stats.audio.bytesReceived + stats.video.bytesReceived);
	statsData += '\n';
	statsData += 'ICE: ' + stats.connectionType.remote.candidateType.join(', ');
	statsData += '\n';
	statsData += 'Port: ' + stats.connectionType.remote.transport.join(', ');
	
	var div = getDivByUserId(remoteUserId);
	
	if(!div) {
		return;
	}
	
	statsData = 'NickName: ' + $('#'+remoteUserId).data('name') + '\n' + statsData;
	
	div.querySelector('h2').innerHTML = statsData.replace(/\n/g, '<br>');
}

function getDivByUserId(userid) {
	return document.querySelector('[data-name="' + userid + '"]');
}

function bytesToSize(bytes) {
	var k = 1000;
	var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	if (bytes === 0) {
		return '0 Bytes';
	}
	var i = parseInt(Math.floor(Math.log(bytes) / Math.log(k)), 10);
	return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
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
    
    console.log('0000');
    console.log('1111 : ' + DetectRTC);
    console.log('2222');
    
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
