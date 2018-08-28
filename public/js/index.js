/**
 * http://usejsdoc.org/
 */

window.enableAdapter = true; // enable adapter.js

var connection = new RTCMultiConnection();

$(document).ready(function(){
	getIndexEjs();
	browserCheck(true);
	
	// 대화명 초기화
	$.removeCookie('userName');
	$('#userName').css('display', 'none');
	
	// 로그인체크 후 유니크룸 확인
	if($('#userName').val() && $('#userName').val().length > 0) getUniqueRoom();
	
	// 그룹명 input tag
	$('.bottom_right').on('keydown', '#room-id', function(key) {
		if(key.keyCode != 13) return;
//		$('#userName').focus();
		$('#open-or-join-room').trigger('click');
	});
	
	// 대화명 input tag
	$('#userName').keydown(function(key) {
		if(key.keyCode != 13) return;
		$('#open-or-join-room').trigger('click');
	});
	
	
	// 로그인 버튼
	$('.bottom_right').on('click', '#openLoginDiv', function(){
		loginUISet();
	});
	
	// 비회원 버튼
	$('.bottom_right').on('click', '#notLoginDiv', function(){
		location.reload();
	});
	
	// 회원가입 버튼
	$('.bottom_right').on('click', '#openSignupDiv', function(){
		signupUISet();
	});
	
	
	// SNS icon button
	$('.bottom_right').on('click', '.btn-login img', function(){
		if($(this).attr('alt') != 'Hamonikr') {
			location.href='https://' + location.host + '/login/' + $(this).attr('alt');
		} else {
//			location.href='http://localhost/hamoniRenewal/acountLogin.php';
			location.href='http://hamonikr.org/acountLogin.php';
//			if($(this).data('name') == 'login') location.href='http://hamonikr.org/acountLogin.php';
//			if($(this).data('name') == 'join') location.href='http://hamonikr.org/index.php?mid=menu_home&act=dispMemberSignUpForm';
		}
	});
	
	
	// 접속 또는 참여하기 버튼
	$('#open-or-join-room').click(function(){
		openOrJoinRoomFnt();
	});
});


//로그인회원 유니크룸 체크
function getUniqueRoom(){
	// 회원 유니크룸 확인
	$.ajax({
		url : 'uniqueRoom',
		type : 'post',
		dataType : 'json',
		success : function(data){
			if(!data.sendResult) {
				return;	// 방이 없는 경우
			}
			
			var unique_room = data.unique_room;
			
			// 내 방 자동입력 - url입력이 아닌 경우에만
			if(($.cookie('roomid') == undefined || $.cookie('roomid') == '') && unique_room != null) {
				$('#room-id').val(unique_room.trim());
			}
		},
		error : function(request, status, error){
			console.log('status : ' + status + '\nrequest : ' + request + '\nerror : ' + error);
		}
	});
}


// bottom_right_main.ejs 불러오기
function getIndexEjs(){
	$.ajax({
		url	:"/bottom_right_main",
		async : false,
		success : function(result, status, xhr){
			$('.bottom_right').html(result);
		},
		error : function(result, status, error){
			console.log(' ==== loginUISet() error : ' + result + '\n' + status + '\n' + error);
		}
	});
}


//로그인 버튼
function loginUISet(){
	$.ajax({
		url	:"/login",
		success : function(result, status, xhr){
			$('.bottom_right').html(result);
		},
		error : function(result, status, error){
			console.log(' ==== loginUISet() error : ' + result + '\n' + status + '\n' + error);
		}
	});
}

//회원가입 버튼
function signupUISet(){
	$.ajax({
		url	:"/join",
		success : function(result, status, xhr){
			$('.bottom_right').html(result);
		},
		error : function(result, status, error){
			console.log(' ==== loginUISet() error : ' + result + '\n' + status + '\n' + error);
		}
	});
}

//비회원 버튼 -- 사용X
function publicLoginUISet(){
	$.ajax({
		url	:"/member/publicLogin",
		success : function(result, status, xhr){
			$('.bottom_right').html(result);
		},
		error : function(result, status, error){
			console.log(' ==== publicLoginUISet() error : ' + result + '\n' + status + '\n' + error);
		}
	});
}



// 접속 또는 참여하기 버튼
function openOrJoinRoomFnt(){
	if( !browserCheck(true) ) return;

	var inputRoomid = $('#room-id').val().replace(/^\s+|\s+$/g, '');
		
	// 방이름 입력확인
	if(inputRoomid.length < 1) {
		$('#room-id').focus();
		return;
	}
	
	location.href='https://' + location.host + '/' + $('#room-id').val().replace(/^\s+|\s+$/g, '');
}