/**
 * https://hamonia.kr/
 */

// 브라우저 체크 - return boolean
function browserCheck(isAlert){
	
	var text = browserCheckReturnText();
	var checkBrowser = false;
	
//	 if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
//		// iOS safari 인 경우
//		alert('아이폰에서 이용하실 수 없습니다.');
//		return;
//	}

//	if (/iPhone|iPad|iPod/i.test(navigator.userAgent) || /Android/i.test(navigator.userAgent)) {
//		alert('모바일은 지원 예정입니다. PC를 이용해 주시기 바랍니다.');
//		return;
//	}

//	if(text != 'Chrome' && text != 'Firefox' && text != 'Opera' && text != 'Safari'){
	if(text != 'Chrome' && text != 'Firefox' && text != 'Safari'){
		if(isAlert){
			alert('하모니아는 크롬, 파이어폭스,  사파리 브라우저로 이용하실 수 있습니다.');
//			alert('하모니아는 크롬, 파이어폭스, 오페라,  사파리 브라우저로 이용하실 수 있습니다.');
		}
		return checkBrowser;
	}
	
	checkBrowser = true;
	
	return checkBrowser;
}


// 브라우저 체크 - return 브라우저명
function browserCheckReturnText(){
	var agt = navigator.userAgent.toLowerCase();
	var text = '';
	
	if (agt.indexOf("kakaotalk") != -1)			text = 'kakaotalk';
	else if (agt.indexOf("edge/") != -1)		text = 'Edge';
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
	
//	alert('navigator.userAgent : ' + navigator.userAgent + '\n\nyour browser : ' + text);
	
	return text;
}