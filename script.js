// 全局變量
let videoElement, canvas, faceApiCanvas, imageContainer;
let currentFacingMode = "user";

function switchCamera() {
  currentFacingMode = currentFacingMode === "user" ? "environment" : "user";
  if (videoElement.srcObject) {
    let videoTracks = videoElement.srcObject.getVideoTracks();
    videoTracks.forEach(track => track.stop());
  }
  startCam();
}

function startCam() {
  const constraints = { video: { facingMode: currentFacingMode } };
  
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia(constraints)
      .then(function (stream) {
        videoElement.srcObject = stream;
        videoElement.setAttribute("autoplay", "");
        videoElement.setAttribute("muted", "");
        videoElement.setAttribute("playsinline", "");
        
        // 等待視頻元素準備就緒
        videoElement.onloadedmetadata = function() {
          videoElement.play();
          // 設置面部檢測
          setupFaceDetection();
          // 設置圖像捕獲
          setupImageCapture();
        };
      })
      .catch(function (error) {
        console.error("無法取得視訊串流:", error);
        alert("重新開啟頁面！");
      });
  } else {
    alert("您使用的瀏覽器不支援視訊串流");
  }
}

function setupFaceDetection() {
  faceApiCanvas.width = videoElement.videoWidth;
  faceApiCanvas.height = videoElement.videoHeight;
  const displaySize = { width: videoElement.videoWidth, height: videoElement.videoHeight };
  faceapi.matchDimensions(faceApiCanvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(videoElement, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    faceApiCanvas.getContext('2d').clearRect(0, 0, faceApiCanvas.width, faceApiCanvas.height);
    faceapi.draw.drawFaceLandmarks(faceApiCanvas, resizedDetections);
  }, 100);
}

function setupImageCapture() {
  setInterval(function () {
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    canvas.getContext("2d").drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    let scaleFactor = 2;
    let offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = canvas.width * scaleFactor;
    offscreenCanvas.height = canvas.height * scaleFactor;
    let offscreenCtx = offscreenCanvas.getContext("2d");
    offscreenCtx.drawImage(canvas, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
    
    let imageElement = document.createElement("img");
    imageElement.setAttribute("style", "width:100%");
    imageContainer.innerHTML = "";
    imageContainer.appendChild(imageElement);
    imageElement.src = offscreenCanvas.toDataURL("image/jpeg", 1);
  }, 1000);
}

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
  videoElement = document.getElementById('video');
  canvas = document.getElementById('captureCanvas');
  faceApiCanvas = document.getElementById('faceApiCanvas');
  imageContainer = document.getElementById('imageContainer');
  
  // 設置容器樣式
  const container = document.createElement('div');
  container.style.position = 'relative';
  container.style.width = 'fit-content';
  container.style.margin = 'auto';
  
  // 設置視頻元素樣式
  videoElement.style.display = 'block';
  
  // 設置 faceApiCanvas 樣式
  faceApiCanvas.style.position = 'absolute';
  faceApiCanvas.style.top = '0';
  faceApiCanvas.style.left = '0';
  
  // 將元素添加到容器中
  container.appendChild(videoElement);
  container.appendChild(faceApiCanvas);
  
  // 將容器添加到 body
  document.body.insertBefore(container, document.body.firstChild);
  
  // 加載 face-api 模型
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models')
  ]);

  // 模型加載完成後啟動攝像頭
  startCam();
});
