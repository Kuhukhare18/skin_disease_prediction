import React, { useState, useRef } from "react";

const SkinDiseasePredictor = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraOn, setIsCameraOn] = useState(false);

  // Handle file upload
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  // Start camera
  const startCamera = async () => {
    setIsCameraOn(true);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
  };

  // Capture image from webcam
  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      const file = new File([blob], "captured-image.jpg", { type: "image/jpeg" });
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }, "image/jpeg");
  };

  // Stop camera
  const stopCamera = () => {
    setIsCameraOn(false);
    let stream = videoRef.current.srcObject;
    let tracks = stream.getTracks();
    tracks.forEach((track) => track.stop());
    videoRef.current.srcObject = null;
  };

  // Send image for prediction
  const handlePredict = async () => {
    if (!image) {
      alert("Please select or capture an image first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", image);

    try {
      const response = await fetch("http://127.0.0.1:8000/predict/", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok || data.error) {
        console.error("Error from server:", data.error);
        alert("Prediction request failed.");
        return;
      }
      
      setPrediction(data);
      

      
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to get prediction. Try again.");
    }
  };

  return (
    <div className="predictor-container">
      <h2>Skin Disease Predictor</h2>

      {/* File Upload */}
      <input type="file" accept="image/*" onChange={handleFileChange} />

      {/* Camera Section */}
      {isCameraOn ? (
        <>
          <video ref={videoRef} autoPlay />
          <button onClick={captureImage}>Capture Image</button>
          <button onClick={stopCamera}>Stop Camera</button>
        </>
      ) : (
        <button onClick={startCamera}>Use Camera</button>
      )}

      {/* Canvas (hidden) for capturing image */}
      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>

      {/* Preview */}
      {preview && <img src={preview} alt="Selected" className="preview-image" />}

      {/* Predict Button */}
      <button onClick={handlePredict}>Predict</button>

      {/* Prediction Results */}
      {prediction && (
        <div className="prediction-results">
          <h3>Prediction:</h3>
          <p>Disease: {prediction.disease} ({prediction.confidence}%)</p>
          <p>Alternative: {prediction.alternative_disease} ({prediction.alternative_confidence}%)</p>
          <h4>Recommended Doctors:</h4>
          <ul>
            {prediction.recommended_doctors.map((doctor, index) => (
              <li key={index}>{doctor}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SkinDiseasePredictor;
