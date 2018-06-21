/**
 * http://usejsdoc.org/
 */
// iframe set
function createBoard(){
	var createTargetId = document.getElementById("whiteBoardLayer");
	var newFrame = document.createElement("iframe");
	newFrame.width="60%";
	newFrame.height="500px";
	newFrame.id = 'whiteboard';
	newFrame.name = 'whiteboard';
	
	newFrame.setAttribute("src", "https://192.168.0.80:3001/login?roomname="+roomName+"&username="+userName);
	createTargetId.appendChild(newFrame);
}


// PDFJS.disableStream = true;
// $("#export").attr("disabled", "disabled"); //내보내기  비활성화

var pdfFile;
$('#pdf').change(function() {
	var pdfFileURL = $('#pdf').val();
	if(pdfFileURL) {
		$("#imgDiv").empty();
		var files = $('#pdf').prop('files'); 
		var fileSize = files[0].size;
		var mb;
		if(fileSize) {
			mb = fileSize / 1048576;
			if(mb > 10) {
				alert("파일사이즈>10M");
				return;
			}
		}

		$("#export").removeAttr("disabled", "disabled");
		$("#pdfName").text(files[0].name).attr("title",files[0].name);
		$("#sizeText").text(mb.toFixed(2) + "Mb");

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
//								$("#imgDiv").css("border", "0"); 
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
});
				
$("#imgDiv").on("click",'.uploadImg', function() {
	var imgId = this.id;
	var canvas = document.getElementById(imgId);
	var dataURL = canvas.toDataURL();
	
	var data = {};
	data.imgBase64 = 'dataURL';
	data.message = "message";

//					프로그레스바 추가..
	$.ajax({
		type: "POST",
		url: "/cavasImgSave",
		data: {
			imgBase64:dataURL,
			fileNm : this.id
		},
		success : function(data) {
			var param = "roomname="+roomName+"&username="+userName+"&imgNm="+imgId+"&imgPath="+data.user_id;
			console.log(param);
			$('#whiteboard').attr('src', 'https://192.168.0.80:3001/login?'+param);
		},
		error : function(a, b, c){
//			console.log('ng:'+ a+'//'+b+'//'+c);
		},
//	}
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