/**
 * http://hamonia.kr/
 */

var filter = "win16|win32|win64|mac|linux x86_32|linux x86_64|macintel";
var checkmob = 0 > filter.indexOf(navigator.platform.toLowerCase());
//var checkmob = true;	// true is mobile/

var isWidthLongWindow = true;

var chatWidth = 280;
var boardWidth = 800;

var isFileshare = false;
var isChangeName = false;

$(document).ready(function(){
	// set UI
	checkedWindowType();
	windowReset();
	defaultUISet();
	refreshVideoView(false);
	
	// URL 표시
	$('.displayUrl').text(decodeURI(location.href, 'UTF-8'));
	
	
	// file share 제거 - UX/UI 적용 후 제거
	if( !isFileshare ) deleteFileshareFnt();
	
	
	// 이름 변경 창 open
	$('#videos-container').on('click', '.media-box h2', function(){
		if($(this).next().attr('id') != 'myVideo') return;
		
		$('#mask').css('display', 'block');
		$('#changeNameAlert').css('display', 'block');
		
		changeNameWindowFnt();
	});
	
	// 이름변경 엔터 처리
	$('#newName').keydown(function(key){
		if(key.keyCode != 13) return;
		$('#changeNameAlert .changeNameBtn').trigger('click');
	});
	
	// 이름 변경 확인
	$('#changeNameAlert .changeNameBtn').click(function(){
		changeNameFnt(true);
	});
	
	// 이름 변경 취소
	$('#changeNameAlert .changeNameCancelBtn').click(function(){
		changeNameFnt(false);
	});
	
	
	//set button
	// 메뉴 버튼
	$('#menuBtn').click(function(){
		menuFnc();
	});
	
	// 채팅창 open/close 버튼
	$('.chatBtn').click(function(){
		chattingDivFnt();
	});
	
	// 채팅 메세지 전송 버튼
	$('#messageSendBtn').click(function(){
		sendMessageFnt();
	});
	
	// 영상 버튼
	$('.videoBtn').click(function(){
		videoBtnFnt();
	});
	
	// 마이크 버튼
	$('.md-mic').click(function(){
		localStream.getAudioTracks()[0].enabled = !(localStream.getAudioTracks()[0].enabled);
		micUIFnt();	// 마이크 아이콘변경
	});
	
	// 스피커 버튼
	$('.md-volume-up').click(function(){
		var containers = $('.media-container');
		var videos = $('#videos-container video');
		var check = $('.buttonVolume').data('value');
		
		// 설정
		$('.buttonVolume').data('value', !check);
		
		for(var i=0; i<videos.length ;++i){
			if(videos[i].id != 'myVideo') {
				videos[i].muted = check;
				
				if(check) connection.streamEvents[containers.eq(i).attr('id')].stream.mute('audio');
				else connection.streamEvents[containers.eq(i).attr('id')].stream.unmute('audio');
			}
		}
		
		volumeUIFnt();	// 스피커 아이콘변경
	});
	
	// 카메라 버튼
	$('.md-videocam').click(function(){
		localStream.getVideoTracks()[0].enabled = !(localStream.getVideoTracks()[0].enabled);
		videoUIFnt();	// 비디오 아이콘변경
	});
	
	// 옵션 버튼
	$('.buttonOption').click(function(){
		optionFnt();
	});
	
	// 옵션창 확인 버튼
	$('.optionOkBtn').click(function(){
		var useDevice = $('#selectCamera').data('value');
		var selectDevice = $('#selectCamera').val();
		
		var checkbox = $('#myVideoRotate').is(':checked');
		var saveval = $('#myVideoRotate').data('value');
		
		if(checkbox != saveval) $('#myVideoRotate').data('value', checkbox);
		if(useDevice != selectDevice) {
			// 카메라 변경
			cameraChangeFnt(selectDevice);
		}
		
		optionFnt();
	});
	
	// 옵션창 닫기 버튼
	$('.optionCloseBtn').click(function(){
		var checkbox = $('#myVideoRotate').is(':checked');
		var saveval = $('#myVideoRotate').data('value');
		
		if(checkbox != saveval) $('#myVideoRotate').trigger('click');
		
		optionFnt();
	});
	
	
	// 옵션창 - 내 영상 좌우반전
	$('#myVideoRotate').click(function(){
		if($(this).is(':checked')) $('#myVideo').css('transform', 'rotateY(180deg)');
		else $('#myVideo').css('transform', 'rotateY(0deg)');
	});
	
	
	// 초대창 링크 클릭
	$('#inviteUrl').click(function(){
		clipboardBtn();
	});
	
	// 초대창 링크복사 버튼
	$('#text_c_enter').click(function(){
		clipboardBtn();
	});
	
	// 초대창 닫기 버튼
	$('#inviteAlertNoBtn').click(function(){
		inviteFnt();
	});
	
	
	// 메뉴 알림 확인처리용
	$('#menuDiv .btn').click(function(){
		$('.newInfoDiv').css('display', 'none');
	});
	
	
	// 모바일 선택영상 크게 보기
	$('#videos-container').on('click', '.media-container', function(){
//		changeVideo(this);
	});
});



$(window).resize(function(){
	$('#videos-container').css('width', $(window).width() + 'px');
	
	checkedWindowType();
	windowReset();
	
	if(navigator.platform){
		if(!checkmob){
			var chatOpenCheck = $('#chat-container').data('value');
			
			videoBtnFnt();
			
			if(chatOpenCheck) $('.chatBtn').trigger('click');
			
			// 권한 설정
			$('#permissionAlert').css('left', ($(window).width() - $('#permissionAlert').width() ) / 2)
			.css('top', ($(window).height() - $('#permissionAlert').height() - 80 ) / 2);
		}
	}
});



// 창이 가로형 인지 세로형 인지 확인
function checkedWindowType(){
	if($(window).width() >= $(window).height()) isWidthLongWindow = true;
	else isWidthLongWindow = false;
}



// file share 제거 - UX/UI 적용 후 제거
function deleteFileshareFnt(){
	$('#file-container').hide();
	$('#share-file').hide();
	$('.chat-output').css('height', 'calc(100% - 40px)').css('padding-top', '60px');
	
	if(navigator.platform){
		if(checkmob){
			$('.chat-output').css('padding-top', '75px');
		}
	}
}


/**** UI start ****/
// UI 재설정
function windowReset(){
	if(navigator.platform){
		if(checkmob) {
			//alert("Mobile");
			if($('#chat-container').data('value')){
				console.log('---- windowReset() // 채팅창 열린경우');
				$('#joinRoom').height($(window).height() - 52);		// 채팅창 열린경우
			}else{
				console.log('---- windowReset() // 채팅창 닫힌경우');
				$('#joinRoom').height($(window).height() - $('#joinRoom').css('padding-top').split('px')[0] - $('#footerMenu').height()); // 채팅창 닫힌경우
			}
		}else{
			//alert("PC");
			$('#joinRoom').height($(window).height() - 110);
		}
	}
	$('#chat-container').height($(window).height()).css('right', '-' + $('#textRoom').width() + 'px');
	$('#linkInfoDiv > div').css('margin-top', ($('#linkInfoDiv').height() - $('#linkInfoDiv > div').height()) / 2 + 'px');
	
	// 알림창 사이즈 조절 - window.width < alert.width
	alertUIFnt();
	changeNameWindowFnt();
}

// UI default setting
function defaultUISet(){
	if(navigator.platform){
		if(checkmob){
			//alert("Mobile");
			// main bottom_right
			$('.box3 img').css('width', '100px').css('margin-bottom', '15px');
			
			// logo
			$('#logo').css('height', '50px').css('padding', '10px');
			
			// 초대 및 정보
			$('#linkDiv').css('display', 'inline-block');
			$('.userCntDiv').css('display', 'inline-block');
			$('.displayUrl').css('display', 'none');
			
			// 종료버튼
			$('#btn-leave-room').css('font-size', '1.3rem').css('width', '35px').css('height', '35px');
			$('#closeText').css('display', 'none');
			
			// 전체
			$('#joinRoom').css('padding-top', '52px');
			
			// 메뉴
			$('#menuDiv').css('padding', '.5rem');
			$('#share-file').css('top', '4rem').css('right', '.5rem').css('width', '50px').css('height', '50px');
			
			// 채팅
			$('#chat-container').css('min-width', '0').css('width', '100%').css('display', 'none');
			
			// 영상
			$('#myVideo').parent('.media-box').parent('.media-container').addClass('mainVideo');
		}else{
			//alert("PC");
//			$('#logo').css('position', 'fixed');
//			$('.videoBtn').remove();
			$('#menuBtn').remove();
			$('#menuDiv').css('top', '1rem');
			$('.menuLineDiv').css('display', 'inline-block');
			$('#chat-container').css('width', chatWidth + 'px');
			
			// 채팅
			$('#chat-container').css('left', $(window).width() + 40 + 'px');
		}
		
		// 영상 전체화면 아이콘
		$('.media-controls').css('display', 'none');
		
		// 옵션창
		$('#optionAlert').css('left', ($(window).width() - $('#optionAlert').width() ) / 2)
								.css('top', ($(window).height() - $('#optionAlert').height() - 130 ) / 2);
	}
}


// 닉네임변경창
function changeNameWindowFnt(){
	$('#newName').val(userName);
	$('#changeNameAlert').css('left', ($(window).width() - $('#changeNameAlert').width() ) / 2)
						.css('top', ($(window).height() - $('#changeNameAlert').height() - 80 ) / 2);
}

// 이름 변경 확인/취소
function changeNameFnt(isChange){
	if(isChange){
		var newName = $('#newName').val().replace(/^\s+|\s+$/g, '');
		
		if(newName.length < 1) {
			$('#newName').focus();
			return;
		}
		
		// changeNameValue + user .media-container id + changeNameValue + newUserName
		connection.send(
				changeNameValue 
				+ escape( $('#myVideo').parent('.media-box').parent('.media-container').attr('id') ) 
				+ changeNameValue 
				+ escape(newName)
		);
		
		userName = newName;
		$('#userName').val(newName);
		$.cookie('userName', newName);
		
		$('#myVideo').data('name', newName);
		$('#myVideo').prev('h2').text(newName);
		
		if( !isChangeName ) isChangeName = !isChangeName;
	}
	
	$('#changeNameAlert').css('display', '');
	$('#mask').css('display', 'none');
}


// 알림창 사이즈 조절 - window.width < alert.width
function alertUIFnt(){
	// 메세지창
	if($(window).width() < $('#messageAlert').width()){
		$('#messageAlert').width($(window).width()).css('left', '');
	}else{
		$('#messageAlert').css('width', '').css('left', ($(window).width() - $('#messageAlert').width() ) / 2);
	}
	
	// 권한 허용방법 알림창
	if($(window).width() < $('#permissionAlert').width()){
		$('#permissionAlert').width($(window).width()).css('left', '');
	}else{
		$('#permissionAlert').css('width', '').css('left', ($(window).width() - $('#permissionAlert').width() ) / 2);
	}
	
	// 옵션창
	if($(window).width() < $('#optionAlert').width()){
		$('#optionAlert').width($(window).width()).css('left', '');
	}else{
		$('#optionAlert').css('width', '').css('left', ($(window).width() - $('#optionAlert').width() ) / 2)
	}
}


// 영상 사이즈 조절
function refreshVideoView(newStreamCheck){
	var videoDiv = $('.media-container');
	var cnt = videoDiv.length;
	
	// web video css
	videoDiv.css('margin', '').css('display', '').css('position', '').css('top', '').css('right', '').css('z-index', '');
	videoDiv.children('.media-box').children('video').css('width', '');
	
	if(isWidthLongWindow && !checkmob ){
		// window type width > height && PC
		$('#joinRoom').css('padding-left', '').css('padding-right', '');
		$('#videos-container').css('text-align', '');
		$('#linkInfoDiv').css('width', '0.0001px').css('height', '').css('display', '');
		
		videoDiv.css('margin', '');
		
		if(cnt == 1){
			// 접속자 1명
			videoDiv.css('width', '48.5%').css('height', '');
			
			$('#videos-container').css('text-align', 'left');
			$('#linkInfoDiv').css('width', '48.5%');
			$('#linkInfoDiv > div').css('margin-top', ($('#linkInfoDiv').height() - $('#linkInfoDiv > div').height()) / 2 + 'px');
			
		}else if(cnt == 2){
			// 접속자 2명
			var vcWidth = $('#videos-container').width();
			
			if(vcWidth >= 1200) videoDiv.css('width', '32%').css('height', '');
			else videoDiv.css('width', '').css('height', '');
			
		}else if (cnt == 3) {
			// 접속자 3명
			
			// true == 1:1:1 비율	// false == 2개 : 1개 비율
			var isSameWidth = true;
			
			if( !isSameWidth ){
				videoDiv.css('width', '36%').css('height', '50%').css('display', 'block');
				videoDiv.eq(cnt-1).css('width', '60%').css('height', '100%');
				
				$('#linkInfoDiv').css('display', 'none');
			}
			
			if( isSameWidth ) videoDiv.css('width', '32%').css('height', '');
		}else if (cnt == 4) {
			// 접속자 4명
			videoDiv.css('width', '').css('height', '47%');
			
			$('#linkInfoDiv').css('display', 'none');
		}
	}else{
		// window type width < height
		$('#joinRoom').css('padding-left', '0').css('padding-right', '0');
		$('#linkInfoDiv').css('width', '').css('height', '').css('display', 'none');
		
		videoDiv.css('margin', '0%');
		
		if(cnt == 1){
			// 접속자 1명
			videoDiv.css('width', '100%').css('height', '50%');
			
			$('#videos-container').css('text-align', 'left');
			$('#linkInfoDiv').css('width', '100%').css('height', '50%').css('display', '');
			$('#linkInfoDiv > div').css('margin-top', ($('#linkInfoDiv').height() - $('#linkInfoDiv > div').height()) / 2 + 'px');
		}else if(cnt == 2){
			// 접속자 2명
			videoDiv.css('width', '100%').css('height', '50%');
			
		}else if (cnt == 3) {
			// 접속자 3명
			videoDiv.css('width', '100%').css('height', '50%');
			
			// 내 영상 사이즈 조절
			$('#myVideo').parent('.media-box').parent('.media-container')
			.css('width', '100px').css('height', '100px').css('right', '0').css('position', 'absolute').css('z-index', '2');
		}else if (cnt == 4) {
			// 접속자 4명
			videoDiv.css('width', '').css('height', '50%');
		}
	}
	
	// 닉네임 표시
	for(var i=0; i<cnt ;++i){
		var userIdTxt = videoDiv.eq(i).children('.media-box').children('video').data('name');
		videoDiv.eq(i).children('.media-box').children('h2').text(userIdTxt);
	}
	
	// 내 닉네임 텍스트 추가
	if( !isChangeName ) {
		var myNameTxt = $('#myVideo').parent('.media-box').children('h2');
		myNameTxt.text(myNameTxt.text() + '(변경하기)');
	}
	
	// 내 닉네임 css
	$('#myVideo').parent('.media-box').children('h2').css('cursor', 'pointer');
	
	// 인원수 체크
	countUsers();
}

function countUsers(){
	// 인원수 체크
	$('#userCnt').text(connection.peers.getLength()+1);
}
/**** UI end ****/


//채팅창 open/close 버튼
function chattingDivFnt(){
	var chatOpenCheck = $('#chat-container').data('value');
	
	if(navigator.platform){
		if(checkmob){
//			alert("Mobile");
			if(chatOpenCheck){
				console.log(' ---- close chatting');

				// 채팅창
				$('#chat-container').css('display', 'none');
				$('#chat-container').data('value', false);
			}else{
				console.log(' ---- open chatting');
				
				// 로고
				$('#logo').css('display', 'block');
				
				// 채팅창
				$('#chat-container').css('display', 'block');
				$('#input-text-chat').focus();
				$('#chat-container').data('value', true);
				
				// 하단메뉴
				$('#footerMenu').css('display', 'none');
			}
		}else{
//			alert("PC");
			videoBtnFnt();
			
			if( !chatOpenCheck ){
				// 메뉴
				$('#menuDiv').css('right', chatWidth + 'px');
				 
				// 메뉴 버튼
				$('.chatBtn').css('display', 'none');
				$('.videoBtn').css('display', '');
				 
				// 영상
				$('#videos-container').css('width', $('#videos-container').width() - chatWidth + 'px');
				 
				// 채팅
				$('#chat-container').css('height', $(window).height()).css('left', $(window).width() - chatWidth + 'px').css('display', 'inline-block');
				$('#input-text-chat').focus();
				$('#chat-container').data('value', true);
			}else{
				// 메뉴
				$('#menuDiv').css('right', '');
				 
				$('#chat-container').data('value', false);
			}
			$('#videos-container').css('background-color', '');
		}
		$('#menuBtn').data('value', false);
	}
	
	// new message count remove
	if(newMsgCnt != 0){
		newMsgCnt = 0;
		$('.msgCntDiv').css('display', 'none');
		$('.msgCntDiv > span').text(newMsgCnt);
	}
	
	refreshVideoView(false);
}

//채팅 메세지 전송 버튼
function sendMessageFnt(){
    // removing trailing/leading whitespace
	$('#input-text-chat').val( $('#input-text-chat').val().replace(/^\s+|\s+$/g, '') );
	
    if (!$('#input-text-chat').val().length) return;
    
    $('#input-text-chat').attr('disabled', 'disabled');
    
    var tValue = $('#transValue option:selected').val().split('//');
	if( tValue == "nonTrans" ){
		connection.send(escape(userName) + messageSplit + escape($('#input-text-chat').val()));
		createMeMsgDiv($('#input-text-chat').val());
		$('#input-text-chat').removeAttr('disabled');
		$('#input-text-chat').val('');
		$('#input-text-chat').focus();
	}else{
    // 번역 =====
		$.ajax({
			type: "POST",
			url: "/translate",
			data: {
				textData : $('#input-text-chat').val(),
				source : tValue[0], //입력언어
				target : tValue[1]  // 번역할 언어
			},
			success : function(data) {
				connection.send(escape(userName) + messageSplit + escape(data.translateData));
				createMeMsgDiv(data.translateData + messageSplit + '(' + $('#input-text-chat').val() + ')');
				$('#input-text-chat').removeAttr('disabled');
				$('#input-text-chat').val('');
				$('#input-text-chat').focus();
			},
			error : function(a, b, c){
				console.log('ng:'+ a+'//'+b+'//'+c);
				$('#input-text-chat').removeAttr('disabled');
			},
		});
	}
//    connection.send(escape(userName) + messageSplit + escape($('#input-text-chat').val()));
//    createMeMsgDiv($('#input-text-chat').val());
//    $('#input-text-chat').val('');
//    $('#input-text-chat').focus();
}

//new message count display
function newMsgCntFnc(){
	var checkValue = !$('#chat-container').data('value');
	
	if(checkValue){
		if(newMsgCnt == '99+') return;
		
		newMsgCnt += 1;
		$('.msgCntDiv').css('display', 'block');
		$('.newInfoDiv').css('display', 'block');
		
		if(newMsgCnt == 99) newMsgCnt = '99+';
		$('.msgCntDiv > span').text(newMsgCnt);
	}
}


// 영상 버튼
function videoBtnFnt(){
	var chatOpenCheck = $('#chat-container').data('value');
	
	if(navigator.platform){
		if(checkmob){
//			alert("Mobile");
			
			if( chatOpenCheck ) $('#chat-container').trigger('click');
			
			// 로고
			$('#logo').css('display', 'block');
			
			// 채팅창 닫기
			$('#chat-container').css('display', 'none');
			$('#chat-container').data('value', false);
			
			// 하단메뉴
			$('#footerMenu').css('display', '');
		}else{
//			alert("PC");
			$('#linkInfoDiv').css('display', '');
			
			// 메뉴
			$('#menuDiv').css('top', '1rem').css('right', '');
			
			// 전체
			$('#joinRoom').css('padding-top', '').css('padding-bottom', '').css('position', '');
			$('#joinRoom').css('height', '').css('width', '');
			
			// 영상
			$('#videos-container').css('width', '100%').css('background-color', '');
			$('.media-container-boardview').removeClass('media-container-boardview');
			
			
			// logo
			$('#logo').css('padding', '');
			$('#logo img').css('height', '');
			
			// 종료버튼
			$('#btn-leave-room').css('font-size', '1.5rem').css('width', '').css('height', '');
			$('#closeText').css('display', '');	
			
			$('.userCntDiv').css('display', '');
			
			// 채팅
			$('#chat-container').css('left', '100%').data('value', false);
			
			// 메뉴 재배치
			$('.useWebBoard').css('display', '');
			$('#footerMenu').css('text-align', '');
			$('#footerMenu > div').css('margin-left', '');
		}
	}
	// 메뉴 버튼
	$('.chatBtn').css('display', '');
	$('#footerMenu .videoBtn').css('display', 'none');
	
	$('#menuBtn').data('value', false);
	$('#chat-container').data('value', false);
	
	windowReset();
	refreshVideoView(false);
}



//마이크 off 버튼 UI
function micUIFnt(){
	if($('.buttonMic').hasClass('md-mic')){
		$('.buttonMic').removeClass('md-mic');
		$('.buttonMic').addClass('md-mic-off');
		$('.buttonMic').attr('title', '마이크 켜기');
	}else if($('.buttonMic').hasClass('md-mic-off')){
		$('.buttonMic').removeClass('md-mic-off');
		$('.buttonMic').addClass('md-mic');
		$('.buttonMic').attr('title', '마이크 끄기');
	}
}

// 스피커off 버튼 UI
function volumeUIFnt(){
	if($('.buttonVolume').hasClass('md-volume-up')){
		$('.buttonVolume').removeClass('md-volume-up');
		$('.buttonVolume').addClass('md-volume-off');
		$('.buttonVolume').attr('title', '스피커 켜기');
	}else if($('.buttonVolume').hasClass('md-volume-off')){
		$('.buttonVolume').removeClass('md-volume-off');
		$('.buttonVolume').addClass('md-volume-up');
		$('.buttonVolume').attr('title', '스피커 끄기');
	}
}


// 영상 off 버튼 UI
function videoUIFnt(){
	if($('.buttonVideo').hasClass('md-videocam')){
		$('.buttonVideo').removeClass('md-videocam');
		$('.buttonVideo').addClass('md-videocam-off');
		$('.buttonVideo').attr('title', '카메라 끄기');
	}else if($('.buttonVideo').hasClass('md-videocam-off')){
		$('.buttonVideo').removeClass('md-videocam-off');
		$('.buttonVideo').addClass('md-videocam');
		$('.buttonVideo').attr('title', '카메라 켜기');
	}
}


//전체화면
var fsCheck = false;
function goFullscreen(data){
	var fullscreenTarget = document.getElementById('page-top');
	
	if (fsCheck) { 
		if(document.exitFullscreen) {
		    document.exitFullscreen();
		} else if(document.webkitExitFullscreen) {
		    document.webkitExitFullscreen();
		} else if(document.mozCancelFullScreen) {
		    document.mozCancelFullScreen();
		} else if(document.msExitFullscreen) {
		    document.msExitFullscreen();
		}
		$(data).attr('class', $(data).attr('class').replace('-exit', ''));
		fsCheck = false;
	} else {
		if (fullscreenTarget.requestFullscreen) {
		    fullscreenTarget.requestFullscreen();
		} else if (fullscreenTarget.webkitRequestFullScreen) {
		    fullscreenTarget.webkitRequestFullScreen();
		} else if (fullscreenTarget.mozRequestFullScreen) {
		    fullscreenTarget.mozRequestFullScreen();
		} else if (fullscreenTarget.msRequestFullscreen) {
		    fullscreenTarget.msRequestFullscreen();
		}
		$(data).attr('class', $(data).attr('class').replace('md-fullscreen', 'md-fullscreen-exit'));
		fsCheck = true;
	}
}


// 카메라 변경
function cameraChangeFnt(deviceId){
//	if(DetectRTC.browser.name == 'Firefox'){
		$.cookie('cameraInfo', deviceId);
		location.reload();
		return;
//	}
	
	/*
	connection.attachStreams.forEach(function(oldStream) {
		oldStream.stop();
	});
	
	connection.captureUserMedia(function() {
		connection.renegotiate();
	});
	
	// 영상반전 기본값
	if( !$('#myVideoRotate').is(':checked') ) $('#myVideoRotate').trigger('click');
	//*/
}


// 옵션 버튼
function optionFnt(){
	// UI
	var boolVal = $('#optionAlert').data('value');
	
	if( boolVal ){
		$('#mask').css('display', 'none');
		$('#optionAlert').css('display', 'none');
	}else{
		$('#mask').css('display', 'block');
		$('#optionAlert').css('display', 'block');
		
		// select camera
		$('#selectCamera').empty();
		DetectRTC.load(function() {
			// 사용중
			DetectRTC.videoInputDevices.forEach(function(camera) {
				if(camera.deviceId == $('#selectCamera').data('value')) 
					$('#selectCamera').append($('<option></option>').val(camera.deviceId).text('(사용중) ' + camera.label));
			});
			
			// 목록
			DetectRTC.videoInputDevices.forEach(function(camera) {
				if(camera.deviceId != $('#selectCamera').data('value')) 
					$('#selectCamera').append($('<option></option>').val(camera.deviceId).text(camera.label));
			});
		});
	}
	$('#optionAlert').data('value', !boolVal);
}



// 초대 버튼 , 초대창 닫기 버튼
function inviteFnt(){
	var boolVal = $('#inviteAlert').data('value');
	
	if( boolVal ){
		$('#mask').css('display', 'none');
		$('#inviteAlert').css('display', 'none');
	}else{
		$('#mask').css('display', 'block');
		$('#inviteAlert').css('display', 'block');
		
		var url = location.href;
		
		$('#inviteUrl').text(url);
	}
	$('#inviteAlert').data('value', !boolVal);
}


//초대창 - 링크복사
function clipboardBtn() {
	$('#clip_target').val(decodeURI(location.href, 'UTF-8'));
	$('#clip_target').select();

	// Use try & catch for unsupported browser
	try {
		// The important part (copy selected text)
	 	var successful = document.execCommand('copy');
	 	alert ( "주소가 복사되었습니다. \'Ctrl+V\'를 눌러 붙여넣기 해주세요." );
	 	// if(successful) answer.innerHTML = 'Copied!';
	 	// else answer.innerHTML = 'Unable to copy!';
	} catch (err) {
		alert('이 브라우저는 지원하지 않습니다.');
	}
}


// 모바일 선택영상 크게 보기
function changeVideo(videoDiv){
	// 모바일체크
	if(navigator.platform){
		if(!checkmob){
			return;
		}
	}
	// 영상수체크
	if($('.media-container').length > 4){
		return;
	}
	
	// 화면크기체크
	if($(videoDiv)[0].style.width == '100%'){
		return
	}
	
	var leftVal = $(videoDiv).eq(0).css('left');
	
	$('.mainVideo').removeClass('mainVideo').css('left', leftVal);
	$(videoDiv).eq(0).addClass('mainVideo').css('left', '');
}


/**** 채팅 start ****/
//시간설정
function timeSetting(){
	var now = new Date();
	var hh;
	var mm;
	var apm;
	
	if(now.getHours() <= 12){
     hh = now.getHours();
     apm = ' am';
 }else{
     hh = now.getHours() - 12;
     apm = ' pm';
 }
	
	if(now.getMinutes() < 10){
		mm = '0' + now.getMinutes();
	}else{
		mm = now.getMinutes();
	}
	return hh + ':' + mm + apm;
}

//채팅 - 나
function createMeMsgDiv(messageg){
	var $li = $('<li></li>').attr('class','meMsgDiv');
	var $span_time = $('<span></span>').attr('class','timeSpan').text(timeSetting());
	
	var $oriMsg = $('<div></div>').text(messageg.split(messageSplit)[0]);
	var $trnMsg = $('<div></div>').text(messageg.split(messageSplit)[1]);
	
	var $div_message = $('<div></div>').attr('class','messageBox');
	
	$div_message.append($oriMsg);
	$div_message.append($trnMsg);
	
	$li.append($span_time);
	$li.append($div_message);
	$('.chat-output').append($li);
	
	$('.chat-output').scrollTop($('.chat-output')[0].scrollHeight);
}

//채팅 - 나아님
function createreceMsgDiv(userName, message){
	var $li = $('<li></li>').attr('class','receMsgDiv');
	var $img_iconBox = $('<div></div>').attr('class','iconBox');
	var $img = $('<i></i>').attr('class','mdi md-account-circle');
	
	var $messageDiv = $('<div></div>').attr('class','messageDiv');
	var $div_message = $('<div></div>').attr('class','messageBox').text(message);
	var $span_time = $('<span></span>').attr('class','timeSpan').text(timeSetting());
	var $div_userName = $('<div></div>').attr('class','userTextDiv').text(userName);

	$img_iconBox.append($img);
	$messageDiv.append($div_userName);
	$messageDiv.append($div_message);
	$messageDiv.append($span_time);
	
	$li.append($img_iconBox);
	$li.append($messageDiv);
	
	$('.chat-output').append($li);
	
	$('.chat-output').scrollTop($('.chat-output')[0].scrollHeight);
}
/**** 채팅 end ****/
