const video = document.getElementById('video')

// 加载 Face API 模型
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
]).then(startVideo)

function startVideo() {
  const videoElement = document.getElementById('video');
  
  // 限制解析度，並預設使用前鏡頭
  const constraints = {
    video: {
      facingMode: 'user', // 默認使用前鏡頭
      width: { ideal: 640 },  // 限制寬度
      height: { ideal: 480 }, // 限制高度
    }
  };

  // 確保支援 `getUserMedia`
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(function (stream) {
        videoElement.setAttribute('autoplay', 'true');
        videoElement.setAttribute('muted', 'true'); // 行動裝置需要設為靜音才能自動播放
        videoElement.setAttribute('playsinline', 'true'); // 防止 iOS 進行全螢幕播放
        videoElement.srcObject = stream;
      })
      .catch(function (error) {
        console.error('Error accessing media devices:', error);
        alert('無法存取相機，請檢查權限設置或瀏覽器兼容性');
      });
  } else {
    alert('您的瀏覽器不支援視訊串流，請更新或更換瀏覽器');
  }
}

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);

  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks(); //.withFaceExpressions()

    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    // 清空畫布
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    
    // 繪製人臉特徵
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
  }, 100);
});
