/**
 * https://hamonia.kr/
 */

// 브라우저 체크 - return boolean
function browserCheck(isAlert){
	
	var text = browserCheckReturnText();
	var msg = '하모니아는 크롬, 파이어폭스, 오페라, 사파리 브라우저로 이용하실 수 있습니다.';
	var checkBrowser = true;
	
	
	// 기기별 사용설정
	if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
		
		// iOS safari 아닌 경우
		if(text != 'Safari'){
			msg = 'iOS는 사파리 브라우저로 이용하실 수 있습니다.';
			checkBrowser = false;
		}
		
		// iOS 버전 체크 - iOS 11.2  부터 WebRTC 지원
		var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
		var ios_versions = [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
		var notProblemVersions = true;
		
		// 버전체크
		if(ios_versions[0] < 11) notProblemVersions = false;
		if(ios_versions[0] == 11 && ios_versions[1] < 2) notProblemVersions = false;
		
//		alert(ios_versions[0] + '.' + ios_versions[1]);	ex) 11.4
		
		// 지원버전 이하인경우
		if( !notProblemVersions ){
			msg = 'iOS 11.2 이상에서 이용하실 수 있습니다.';
			checkBrowser = false;
		}
		
	}else if(/Android/i.test(navigator.userAgent)) {
		msg = '안드로이드는 크롬 브라우저로 이용하실 수 있습니다.';
		
		// android 브라우저별 사용여부 설정 - 주석 == 사용하는 브라우저
		if(text == 'kakaotalk'){ checkBrowser = false; }
		else if(text == 'Samsung')	{ checkBrowser = false; }
		else if(text == 'Ucbrowser'){ checkBrowser = false; }
		else if(text == 'Edge')		{ checkBrowser = false; }
		else if(text == 'OperaMini'){ checkBrowser = false; }
//		else if(text == 'Opera')	{ checkBrowser = false; }
//		else if(text == 'Chrome')	{ checkBrowser = false; }
		else if(text == 'Star Office'){ checkBrowser=false; }
		else if(text == 'WebTV')	{ checkBrowser = false; }
		else if(text == 'Beonex')	{ checkBrowser = false; }
		else if(text == 'Chimera')	{ checkBrowser = false; }
		else if(text == 'NetPositive'){ checkBrowser=false; }
		else if(text == 'Phoenix')	{ checkBrowser = false; }
		else if(text == 'Firefox')	{ checkBrowser = false; }
		else if(text == 'Safari')	{ checkBrowser = false; }
		else if(text == 'SkipStone'){ checkBrowser = false; }
		else if(text == 'Netscape')	{ checkBrowser = false; }
		else if(text == 'Mozilla')	{ checkBrowser = false; }
		else if(text == 'other')	{ checkBrowser = false; }
	}
	
	
	// PC 브라우저별 사용여부 설정 - 주석 == 사용하는 브라우저
	else if(text == 'Ie')		{ checkBrowser = false; }
	else if(text == 'kakaotalk'){ checkBrowser = false; }
	else if(text == 'Samsung')	{ checkBrowser = false; }
	else if(text == 'Ucbrowser'){ checkBrowser = false; }
	else if(text == 'Edge')		{ checkBrowser = false; }
	else if(text == 'OperaMini'){ checkBrowser = false; }
//	else if(text == 'Opera')	{ checkBrowser = false; }
//	else if(text == 'Chrome')	{ checkBrowser = false; }
	else if(text == 'Star Office'){ checkBrowser=false; }
	else if(text == 'WebTV')	{ checkBrowser = false; }
	else if(text == 'Beonex')	{ checkBrowser = false; }
	else if(text == 'Chimera')	{ checkBrowser = false; }
	else if(text == 'NetPositive'){ checkBrowser=false; }
	else if(text == 'Phoenix')	{ checkBrowser = false; }
//	else if(text == 'Firefox')	{ checkBrowser = false; }
//	else if(text == 'Safari')	{ checkBrowser = false; }
	else if(text == 'SkipStone'){ checkBrowser = false; }
	else if(text == 'Netscape')	{ checkBrowser = false; }
	else if(text == 'Mozilla')	{ checkBrowser = false; }
	else if(text == 'other')	{ checkBrowser = false; }
	
	
	if( !checkBrowser && isAlert ) alert(msg);
	
	return checkBrowser;
}


// 브라우저 체크 - return 브라우저명
function browserCheckReturnText(){
	var agt = navigator.userAgent.toLowerCase();
	var text = '';
	
	if ((navigator.appName == 'Netscape' && agt.indexOf('trident') != -1) 
			|| (agt.indexOf("msie") != -1)) 	text = 'Ie';
	else if (agt.indexOf("kakaotalk") != -1)	text = 'kakaotalk';
	else if (agt.indexOf("samsung") != -1)		text = 'Samsung';
	else if (agt.indexOf("ucbrowser") != -1)	text = 'Ucbrowser';
	else if (agt.indexOf("edge/") != -1)		text = 'Edge';
	else if (agt.indexOf("trident") != -1)		text = 'Trident';
//	else if (agt.indexOf("opr/") != -1)			text = 'OperaMini';	// 미적용 수정필요
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
	else 										text = 'other';
	
//	alert('navigator.userAgent.toLowerCase() : ' + navigator.userAgent.toLowerCase() + '\n\nyour browser : ' + text);
//	alert('navigator.userAgent : ' + navigator.userAgent + '\n\nyour browser : ' + text); //other
//	alert('navigator.appName : ' + navigator.appName + '\n\nyour browser : ' + text); //ie
	
	return text;
}