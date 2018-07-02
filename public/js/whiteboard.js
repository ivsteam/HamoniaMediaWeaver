/**
 * http://usejsdoc.org/
 */

var boardDomain = "https://192.168.0.54:3001";

// iframe set
function createBoard(){
	var createTargetId = document.getElementById("whiteBoardLayer");
	var newFrame = document.createElement("iframe");
	newFrame.width="60%";
	newFrame.height="500px";
	newFrame.id = 'whiteboard';
	newFrame.name = 'whiteboard';
	
	
	newFrame.setAttribute("src", boardDomain + "/login?roomname="+$('#room-id').val()+"&username="+$('#userName').val());
//	newFrame.setAttribute("src", boardDomain + "/login?roomname="+roomName+"&username="+userName);
	createTargetId.appendChild(newFrame);
}


// PDFJS.disableStream = true;
// $("#export").attr("disabled", "disabled"); //내보내기  비활성화

// 첨부파일 확장자 체크
function checkImg(obj, ext){ 
	var check = false; 
	var extName = $(obj).val().substring($(obj).val().lastIndexOf(".")+1).toUpperCase(); 
	var str = ext.split(",");
	for (var i=0;i<str.length;i++) { 
		if ( extName == $.trim(str[i]) ) {
		check = true; break; 
		} else check = false;
	}
	if(!check){ 
		alert(ext+" 파일만 업로드 가능합니다.");
	}
	
		// progress end
		$('#imgProgressDiv').css('display', 'none');
return check; 
}
// 첨부파일 용량 확인 
function checkImgSize(obj, size) { 
	var check = false;
	if(window.ActiveXObject) {//IE용인데 IE8이하는 안됨... 
		var fso = new ActiveXObject("Scripting.FileSystemObject"); 
		//var filepath = document.getElementById(obj).value; 
		var filepath = obj[0].value; 
		var thefile = fso.getFile(filepath); 
		sizeinbytes = thefile.size; 
	} else {
	//IE 외 //sizeinbytes = document.getElementById(obj).files[0].size; 
	sizeinbytes = obj[0].files[0].size; 
	}

	var fSExt = new Array('Bytes', 'KB', 'MB', 'GB'); 
	var i = 0; 
	var checkSize = size; 
	while(checkSize>900) { 
		checkSize/=1024; i++; 
	} 
	checkSize = (Math.round(checkSize*100)/100)+' '+fSExt[i]; 
	var fSize = sizeinbytes; 
	if(fSize > size) { 
		alert("첨부파일은 10M 이하로 등록가능합니다."); 
		check = false; 
	} else { check = true; }
	
	// progress end
	$('#imgProgressDiv').css('display', 'none');
	return check; 
} 

var pdfFile;
$('#pdf').change(function() {
	if(!$(this).data('value')) return;
	
	// progress start
	$('#imgProgressDiv').css('display', 'block');
	var checkSize = 1024*1024*10; // 10MB
	if(!checkImg($('#pdf'), "PDF") | !checkImgSize($('#pdf'), checkSize)) { 
		this.value = "";
		return;
	}

	var pdfFileURL = $('#pdf').val();

	if(pdfFileURL) {
		$("#imgDiv").empty();
		var files = $('#pdf').prop('files'); 
		var fileSize = files[0].size;
		var mb;
		if(fileSize) {
			mb = fileSize / 1048576;
			if(mb > 10) {
				alert("파일크기는 최대10Mb 입니다.");
				// progress end
				$('#imgProgressDiv').css('display', 'none');
				return;
			}
		}

		$("#export").removeAttr("disabled", "disabled");
		$("#pdfName").text(files[0].name).attr("title",files[0].name);
		$("#sizeText").text(mb.toFixed(2) + "Mb");
		
		// 정보 전송
		connection.send(fileSelectValue+'true&fileNm='+files[0].name);
		
		/*pdf.jsFileReader를 사용하여 변환*/
		var reader = new FileReader();
		reader.readAsArrayBuffer(files[0]);
		reader.onload = function(e) {
			var myData = new Uint8Array(e.target.result)
			var docInitParams = {
				data: myData
			};
			
			var typedarray = new Uint8Array(this.result);
			PDFJS.getDocument(typedarray).then(function(pdf) { //캔버스로 PDF 변환
//				$("#imgDiv").css("border", "0"); 
				if(pdf) {
					var pageNum = pdf.numPages;
					$("#pagesText").text(pageNum);

					for(var i = 1; i <= pageNum; i++) {
						var canvas = document.createElement('canvas');
						canvas.id = "pageNum" + i;
						canvas.className  = "uploadImg";
						$("#imgDiv").append(canvas);
						var context = canvas.getContext('2d');
						openPage(pdf, i, context);
					}
				}
			});
		};
	}
	
	// progress end
	$('#imgProgressDiv').css('display', 'none');
});
				
$("#imgDiv").on("click",'canvas.uploadImg', function() {
	var imgId = this.id;
	var canvas = document.getElementById(imgId);
	var dataURL = canvas.toDataURL();
	
	var data = {};
	data.imgBase64 = 'dataURL';
	data.message = "message";

	// progress start
	$('#imgProgressDiv').css('display', 'block');
	
	$.ajax({
		type: "POST",
		url: "/cavasImgSave",
		data: {
			imgBase64 : dataURL,
			fileNm : this.id,
			user_id : userName,
			room_name : roomName
		},
		success : function(data) {
			var param = boardDomain + "/login?"+"imgNm="+imgId+"&imgPath="+data.user_id+"&roomname="+roomName+"&username=";
			$('#whiteboard').attr('src', param + userName);
			
			connection.send(fileSelectValue + '/img/' + data.user_id + '/' + data.fileNm);
			connection.send(fileSelectValue+'true&param='+param);
			// progress end
			$('#imgProgressDiv').css('display', 'none');
		},
		error : function(result, status, error){
			console.log(' ==== uploadImg error : ' + result + '\n' + status + '\n' + error);
//			for(var key in result){
//				console.log(' ---- key // result : ' + key + ' // ' + result[key]);
//			}
			
			// progress end
			$('#imgProgressDiv').css('display', 'none');
			alert('전송에 실패하였습니다.\n잠시후 다시 시도해 주시기 바랍니다.');
//		},
	}
//	).done(function(o) {
//		alert("aaa=="+o);
//		console.log('all_saved'); 
	});
});



function dataURItoBlob(dataURI){
	var byteString = atob(dataURI.split(',')[1]);
	var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
	var ab = new ArrayBuffer(byteString.length);
	var ia = new Uint8Array(ab);
	for (var i = 0; i < byteString.length; i++)
	{
		ia[i] = byteString.charCodeAt(i);
	}

	var bb = new Blob([ab], { "type": mimeString });
	return bb;
}

function openPage(pdfFile, pageNumber, context) {
	var scale = 2;
	pdfFile.getPage(pageNumber).then(function(page) {
		viewport = page.getViewport(scale); // reference canvas via context
		var canvas = context.canvas;
		canvas.width = viewport.width;
		canvas.height = viewport.height;
		canvas.style.width = "70%";
//		canvas.style.height = "50%";
		var renderContext = {
			canvasContext: context,
			viewport: viewport
		};
		page.render(renderContext);
	});
	return;
};

//dataURL > Blob
function dataURLtoBlob(dataurl) {
	var arr = dataurl.split(','),
		mime = arr[0].match(/:(.*?);/)[1],
		bstr = atob(arr[1]),
		n = bstr.length,
		u8arr = new Uint8Array(n);
	while(n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}
	return new Blob([u8arr], {
		type: mime
	});
}
//export
$("#export").click(function() {
	var zip = new JSZip();
	var images = zip.folder("images");
	$("canvas").each(function(index, ele) {
		var canvas = document.getElementById("pageNum" + (index + 1));
		images.file("image-" + (index + 1) + ".png", dataURLtoBlob(canvas.toDataURL("image/png", 1.0)), {
			base64: true
		});
	})
	zip.generateAsync({
		type: "blob"
	}).then(function(content) {
		console.log(content);
		saveAs(content, "pdftoimages.zip");
	});
});
