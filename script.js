const video = document.getElementById('video')

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
]).then(startVideo)

function startVideo() {
  const videoElement = document.getElementById('videoElement');

  // 定義約束條件
  const constraints = { video: {} };

  // 首先嘗試使用新的 `navigator.mediaDevices.getUserMedia`
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(function (stream) {
        videoElement.setAttribute("autoplay", "");
        videoElement.setAttribute("muted", "");
        videoElement.setAttribute("playsinline", "");
        videoElement.srcObject = stream;
      })
      .catch(function (error) {
        console.error("Error accessing media devices:", error);
      });
  } else if (navigator.getUserMedia) {
    // 如果不支援 `mediaDevices`，回退到 `navigator.getUserMedia`
    navigator.getUserMedia(
      { video: {} },
      stream => {
        videoElement.srcObject = stream;
      },
      err => console.error("Error using getUserMedia:", err)
    );
  } else {
    // 不支援的瀏覽器
    alert("您的瀏覽器不支援視訊串流。請更新瀏覽器或使用其他瀏覽器。");
  }
}

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks()//.withFaceExpressions()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
   // faceapi.draw.drawDetections(canvas, resizedDetections)
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
  }, 100)
})
