// 全局變量
let videoElement, faceApiCanvas;
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
  const constraints = { 
    video: { 
      facingMode: currentFacingMode,
      width: { ideal: 720 },
      height: { ideal: 560 }
    } 
  };
  
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia(constraints)
      .then(function (stream) {
        videoElement.srcObject = stream;
        videoElement.play();
        // 設置面部檢測
        setupFaceDetection();
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
  faceApiCanvas = faceapi.createCanvasFromMedia(videoElement);
  document.body.append(faceApiCanvas);
  faceApiCanvas.style.position = 'absolute';
  const displaySize = { width: videoElement.width, height: videoElement.height };
  faceapi.matchDimensions(faceApiCanvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(videoElement, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    faceApiCanvas.getContext('2d').clearRect(0, 0, faceApiCanvas.width, faceApiCanvas.height);
    faceapi.draw.drawFaceLandmarks(faceApiCanvas, resizedDetections);
  }, 100);
}

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
  videoElement = document.getElementById('video');
  
  // 加載 face-api 模型
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models')
  ]);

  // 模型加載完成後啟動攝像頭
  startCam();

  // 添加切換攝像頭按鈕
  const switchButton = document.createElement('button');
  switchButton.textContent = '切換攝像頭';
  switchButton.style.position = 'fixed';
  switchButton.style.bottom = '20px';
  switchButton.style.left = '50%';
  switchButton.style.transform = 'translateX(-50%)';
  switchButton.style.zIndex = '1000';
  switchButton.addEventListener('click', switchCamera);
  document.body.appendChild(switchButton);
});
