const video = document.getElementById('video')

    // Load models from local directory or remote
      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
        faceapi.nets.faceExpressionNet.loadFromUri('./models')
      ]).then(startVideo).catch(err => console.error("Model loading failed:", err));

      function startVideo() {
        navigator.mediaDevices.getUserMedia(
          { video: { facingMode: 'user' } } // 'user' 使用前置鏡頭, 'environment' 使用後置鏡頭
        ).then(stream => {
          video.srcObject = stream;
          video.onloadedmetadata = () => {
            video.play();
            runFaceDetection();
          };
        }).catch(err => console.error("Error accessing the camera: " + err));
      }

       function runFaceDetection() {
        video.addEventListener('play', () => {
          const canvas = faceapi.createCanvasFromMedia(video);
          document.body.append(canvas);
          const displaySize = { width: video.videoWidth, height: video.videoHeight };
          faceapi.matchDimensions(canvas, displaySize);
          
          setInterval(async () => {
            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
            if (detections.length === 0) {
              console.warn("No faces detected");
            }
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            faceapi.draw.drawDetections(canvas, resizedDetections);
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
            faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
          }, 100);
        });
      }
