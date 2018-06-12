/**
 * http://usejsdoc.org/
 */

var filter = "win16|win32|win64|mac|linux x86_32|linux x86_64|macintel";
var checkmob = 0 > filter.indexOf(navigator.platform.toLowerCase());
//var checkmob = true;	// true is mobile


$(document).ready(function(){
	// set UI
	windowReset();
	defaultUISet();
	
	// file share 제거 - UX/UI 적용 후 제거
	deleteFileshareFnt();
	
	
	// 그룹명 input tag
	$('#room-id').keydown(function(key) {
		if(key.keyCode != 13) return;
		$('#name').focus();
	});
		
	// 대화명 input tag
	$('#userName').keydown(function(key) {
		if(key.keyCode != 13) return;
		$('#open-or-join-room').trigger('click');
	});
	
	
	//set button
	// 채팅창 open/close 버튼
	$('.chatBtn').click(function(){
		chattingDivFnt();
	});
	
	// 채팅 메세지 전송 버튼
	$('#messageSendBtn').click(function(){
		sendMessageFnt();
	});
	
	
	// 볼륨 버튼
	$('.md-volume-up').click(function(){
		localStream.getAudioTracks()[0].enabled = !(localStream.getAudioTracks()[0].enabled);
		
		// 아이콘변경
		volumeUIFnt();
	});
	
	
	// 메뉴 버튼
	$('#menuBtn').click(function(){
		menuFnc($(this).data('value'));
	});
	
	
	// 초대 버튼
	$('#invite').click(function(){
		inviteFnt();
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
	
	
	// 모바일 선택영상 크게 보기
	$('#videos-container').on('click', '.media-container', function(){
		changeVideo(this);
	});
});

$(window).resize(function(){
	$('#videos-container').css('width', $(window).width() + 'px');
	windowReset();
	if(navigator.platform){
		if(!checkmob){	
			defaultUISet();
		}
	}
});




// file share 제거 - UX/UI 적용 후 제거
function deleteFileshareFnt(){
	$('#file-container').hide();
	$('#share-file').hide();
	$('.chat-output').css('height', 'calc(100% - 40px)');
	
	if(navigator.platform){
		if(checkmob){
			$('.chat-output').css('padding-top', '65px');
		}
	}
}


/**** UI start ****/
// UI 재설정
function windowReset(){
	$('#joinRoom').height($(window).height());
	$('#chat-container').height($(window).height()).css('right', '-' + $('#textRoom').width() + 'px');
}

// UI default setting
function defaultUISet(){
	if(navigator.platform){
		if(checkmob){	
			//alert("Mobile");
			// logo
			$('#logo img').css('padding-top', '10px');
			$('#logo').css('height', '50px');
			
			// 메뉴
			$('#menuDiv').css('padding', '.5rem');
			$('#menuDiv .btn').css('width', '50px').css('height', '50px');
			$('#share-file').css('top', '4rem').css('right', '.5rem').css('width', '50px').css('height', '50px');
			
			// 채팅
			$('#chat-container').css('min-width', '0').css('width', '0.001px');
			
			// 영상
			$('#myVideo').parent('.media-box').parent('.media-container').addClass('mainVideo');
		}else{
			//alert("PC");
			$('#menuBtn').remove();
			$('#menuDiv').css('top', '1rem');
			$('.menuLineDiv').css('display', 'inline-block');
		}
		
		// 영상 전체화면 아이콘
		$('.media-controls').css('display', 'none');
		
		// 채팅
		$('#chat-container').css('left', $(window).width() + 40 + 'px');
		
		// 초대
		$('#inviteAlert').css('left', ($(window).width() - $('#inviteAlert').width() ) / 2)
								.css('top', ($(window).height() - $('#inviteAlert').height() - 130 ) / 2);
	}
}

// 영상 사이즈 조절
function refreshVideoView(){
	var videoDiv = $('.media-container');
	var cnt = videoDiv.length;
	
	if(navigator.platform){
    	if(checkmob){
    		// mob video css
    		
    		$('.mainVideo').removeClass('mainVideo');
    		
    		if(cnt <= 4){
    			// 본인 포함 4명 이하
    			var idx = 0;
    			
    			videoDiv.css('position', 'absolute').css('width', '33.3333%').css('height', '20%');
    			
    			for(var i=0 ; i<cnt ; ++i){
    				if(videoDiv.eq(i).find('#myVideo').attr('id') === undefined){
    					videoDiv.eq(i).css('left', (idx * 33.3333) + '%');
    					++idx;
    				}
    			}
    			
    			// 본인
    			$('.media-container #myVideo').parent('.media-box').parent('.media-container').addClass('mainVideo').css('left', '');
    			
    		}else{
    			// 본인 포함 5명 이상
    			videoDiv.css('left', '').css('position', 'relative').css('width', '50%').css('height', ( 100 / parseInt(cnt / 2 + cnt % 2)) + '%');
    		}
    		
    	}else{
    		// web video css - 수식으로 변경 필요
    		
	    	if(cnt == 1){
	    		videoDiv.css('width', '100%').css('height', '100%');
	    		
	    	}else if(cnt <= 2){
    			videoDiv.css('width', '50%').css('height', '100%');
    			
    		}else if (cnt <= 4) {
    			videoDiv.css('width', '50%').css('height', '50%');
    			
    		}else if (cnt <= 6) {
    			videoDiv.css('width', '33.3333%').css('height', '50%');
    			
    		}else if (cnt <= 9) {
    			videoDiv.css('width', '33.3333%').css('height', '33.3333%');
    			
    		}else if (cnt <= 12) {
    			videoDiv.css('width', '25%').css('height', '33.3333%');
    			
    		}else if (cnt <= 16) {
    			videoDiv.css('width', '25%').css('height', '25%');
    		}
    	}
	}
}
/**** UI end ****/


//채팅창 open/close 버튼
function chattingDivFnt(){
	if(navigator.platform){
		if(checkmob){
//			alert("Mobile");
			if($('#chat-container').data('value')){
				$('#menuDiv').css('top', '-65px');
				
				$('#chat-container').css('width', '0.001px').css('left', $(window).width() + 'px');
				$('#chat-container').data('value' , false);
			}else{
				$('#menuDiv').css('top', '-130px');
				
				$('#chat-container').css('width', $(window).width() + 'px').css('left', '0px');
				$('#chat-container').data('value' , true);
				
				$('#menuBtn').data('value' , false);
			}
		}else{
//			alert("PC");
			if($('#chat-container').data('value')){
				console.log(' ---- open chatting');
				$('#videos-container').css('width', $(window).width() + 'px');
				$('#chat-container').css('left', $(window).width() + 40 + 'px');
				$('#chat-container').data('value' , false);
			}else{
				console.log(' ---- close chatting');
				$('#videos-container').css('width', $('#videos-container').width() - $('#chat-container').width() + 'px');
				$('#chat-container').css('left', $(window).width() - $('#chat-container').width() + 'px');
				$('#chat-container').data('value' , true);
			}
		}
	}
	
	// new message count remove
	if(newMsgCnt != 0){
		newMsgCnt = 0;
		$('.msgCntDiv').css('display', 'none');
		$('.msgCntDiv > span').text(newMsgCnt);
	}
}

//채팅 메세지 전송 버튼
function sendMessageFnt(){
    // removing trailing/leading whitespace
	$('#input-text-chat').val( $('#input-text-chat').val().replace(/^\s+|\s+$/g, '') );
	
    if (!$('#input-text-chat').val().length) return;

    connection.send(escape(userName) + messageSplit + escape($('#input-text-chat').val()));
    createMeMsgDiv($('#input-text-chat').val());
    $('#input-text-chat').val('');
    
    $('#input-text-chat').focus();
}

//new message count display
function newMsgCntFnc(){
	var checkValue = !$('#chat-container').data('value');
	
	if(checkValue){
		if(newMsgCnt == '99+') return;
		
		newMsgCnt += 1;
		$('.msgCntDiv').css('display', 'block');
		
		if(newMsgCnt == 99) newMsgCnt = '99+';
		$('.msgCntDiv > span').text(newMsgCnt);
	}
}


//볼륨 off 버튼 UI
function volumeUIFnt(){
	if($('.buttonVolume').hasClass('md-volume-up')){
		$('.buttonVolume').removeClass('md-volume-up');
		$('.buttonVolume').addClass('md-volume-off');
	}else if($('.buttonVolume').hasClass('md-volume-off')){
		$('.buttonVolume').removeClass('md-volume-off');
		$('.buttonVolume').addClass('md-volume-up');
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


//메뉴 버튼
function menuFnc(check){
	if(check){
		$('#menuDiv').css('top', '-65px');
		$('#menuBtn').data('value', false);
	}else{
		$('#menuDiv').css('top', '.5rem');
		$('#menuBtn').data('value', true);
	}
	
}


// 초대 버튼 , 초대창 닫기 버튼
function inviteFnt(){
	if( $('#inviteAlert').data('value') ){
		$('#mask').css('display', 'none');
		$('#inviteAlert').css('display', 'none');
		 $('#inviteAlert').data('value', false); 
	}else{
		$('#mask').css('display', 'block');
		$('#inviteAlert').css('display', 'block');
		$('#inviteAlert').data('value', true);
		
		var url = location.href;
		
		url = url.split('//');
		if(url[1].indexOf('?roomid') > 0){
			url = url[1].substr(0, url[1].indexOf('?roomid'));
		}else{
			url = url[1].substr(0, url[1].lastIndexOf('/'));
		}
		
		$('#inviteUrl').text('https://' + url + '?roomid=' + roomName);
	}
}

//초대창 - 링크복사
function clipboardBtn() {
	var text = $("#inviteUrl").text();
	$('#clip_target').val(text);
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
	var $div_message = $('<div></div>').attr('class','messageBox').text(messageg);
	
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
	var $div_userName = $('<div></div>').attr('class','userTextDiv').text(userName);
	var $div_message = $('<div></div>').attr('class','messageBox').text(message);
	var $span_time = $('<span></span>').attr('class','timeSpan').text(timeSetting());
	
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