const videoElement = document.getElementById('video');
const canvasElement = document.createElement('canvas');
document.body.appendChild(canvasElement);
const canvasCtx = canvasElement.getContext('2d');

const faceMesh = new FaceMesh({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
  }
});//486

faceMesh.setOptions({
  maxNumFaces: 1, // 偵測一張臉
  refineLandmarks: true, 
  minDetectionConfidence: 0.8,
  minTrackingConfidence: 0.8
});

faceMesh.onResults(onResults);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await faceMesh.send({ image: videoElement });
  },
  width: 1280,
  height: 960
});
camera.start();

// 當偵測到臉部時的處理邏輯
function onResults(results) {
  canvasElement.width = videoElement.videoWidth;
  canvasElement.height = videoElement.videoHeight;

  // 清空畫布
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(
    results.image, 0, 0, canvasElement.width, canvasElement.height);

  // 繪製臉部特徵點
  if (results.multiFaceLandmarks) {
    for (const landmarks of results.multiFaceLandmarks) {
      drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION,
                     { color: '#C0C0C070', lineWidth: 2 });
     
    }
  }

  canvasCtx.restore();
}
