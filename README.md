## Screenshot

![hamonia](https://github.com/ivsteam/HamoniaMediaWeaver/blob/master/hamonia-media-weaver.png)

## Hamonia Media Weaver

[인베슘](http://invesume.com) 에서는 하모니아 미디어 위버 서비스를 누구나 사용할 수 있게 무료로 제공하고 있습니다.
별도의 프로그램 설치가 필요없이, 웹브라우저만 있으면 어디서든 서로 영상대화가 가능합니다.

## 지원되는 웹브라우저

![supported](https://github.com/ivsteam/HamoniaMediaWeaver/blob/master/webrtc-supported.png)

- Desktop PC. Google Chrome 28. Mozilla Firefox 22. Safari 11. Opera 18. 
- Android. Google Chrome 28 (enabled by default since 29) Opera Mobile 12.
- iOS 11. MobileSafari/WebKit.

## 사용법

1) 먼저 [https://hamonia.kr](https://hamonia.kr) 사이트로 접속해서 방을 생성합니다.
2) 개설자는 방 주소를 대화하고 싶은 다른 참여자와 공유하세요.
3) 참여자는 방 개설자에게 전달받은 주소를 웹브라우저로 붙여넣기 합니다.


## 직접 서버에 구축해서 사용하는 경우

```bash
 - git clone https://github.com/ivsteam/HamoniaMediaWeaver.git
 - cd HamoniaMediaWeaver-master
 - sudo npm install 
 - sudo node server.js
 - https://localhost
```

## WebRTC Stream Resolution 
```bash
Video Stream Resolution Setting
 		mandatory: {
			maxWidth: 1920,
			maxHeight: 1080,
			minWidth: 1280,
			minHeight: 720,
			minAspectRatio: 1.77,
			minFrameRate: 30,
			maxFrameRate: 64
		 }
  
Audio Stream Resolution Setting  
 		mandatory: {
 		echoCancellation: true,
 		googEchoCancellation: true,
 		googAutoGainControl: true,
 		googAutoGainControl2: true,
 		googNoiseSuppression: true,
 		googHighpassFilter: true,
 		googTypingNoiseDetection: false,
 		}
	
```

## Text Chat Translate
```bash
- 채팅 번역은 네이버 파파고API을 사용.( 한글/영문 번역 기능.)
- server.js파일의 client_id, cliten_secrt 변경

// translation] naver
var express = require('express');
var client_id = '******';
var client_secret = '*********';
var request = require('request');
http_app.post('/translate', function(req, res){

	var api_url = 'https://openapi.naver.com/v1/papago/n2mt';
	var queryText = req.body.textData;
	var sourceLanguage = req.body.source;
	var targetLanguage = req.body.target;
	
	var options = {
		url: api_url,
		form: {'source': sourceLanguage, 'target': targetLanguage, 'text': queryText},
		headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
	};

	request.post(options, function (error, response, body) {

		if (!error && response.statusCode == 200) {
			var jsonData = JSON.parse(body);

			var resData = {}
			resData.success = 'Y';
			resData.translateData = jsonData.message.result.translatedText;
			res.send(resData);

		} else {
			res.status(response.statusCode).end();
			console.log('error = ' + response.statusCode);
		}
	});
});
```
## 버그 제출 및 기타 이슈 제안

이 프로젝트와 관련하여 이슈는 [상단의 이슈 탭](https://github.com/ivsteam/HamoniaMediaWeaver/issues)을 이용해 주세요.

## 참여하기

참여자 지침 [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) 을 먼저 읽어보시고, 깃헙의 풀리퀘스트 과정을 따라 제출해주세요.

## 릴리즈 관리

[릴리즈 목록](https://github.com/ivsteam/HamoniaMediaWeaver/tags) 에서 확인 가능합니다.

## 개발에 참여하신 분

이 프로젝트에 참여한 개발자들을 보시려면 [contributors](https://github.com/ivsteam/HamoniaMediaWeaver/contributors) 에서 확인하세요.

## 라이선스

이 프로젝트는 아파치 2.0 라이선스로 배포됩니다. 자세한 라이선스 내용은 [LICENSE](LICENSE) 파일을 확인하세요.

