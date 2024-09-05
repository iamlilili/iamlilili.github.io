const video = document.getElementById('video')

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
  faceapi.nets.faceExpressionNet.loadFromUri('./models')
]).then(startVideo)

function startVideo() {
   navigator.mediaDevices.getUserMedia()(  //請求訪問鏡頭的 Web API
      { video: {} }, // 將影片顯示在html裡的video
      stream => video.srcObject = stream, //成功
      err => console.error(err) //失敗
    )
  }

video.addEventListener('play', () => {   //當開始啟用攝像頭
  const canvas = faceapi.createCanvasFromMedia(video)    //創建畫布。用來畫臉上的點點
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks()   //使用 TinyFaceDetector 模型檢測視頻中的所有人臉，並添加面部特徵點。
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height) //清除上一幀繪製內容。
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
  }, 100)   
})
