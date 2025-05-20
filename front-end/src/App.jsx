import React, { useRef, useEffect, useState, useCallback } from "react";
import { GoGear } from "react-icons/go";
import Webcam from "react-webcam";
import Settings from "./Settings";
import { diminishObject } from './DiminishObject';
import "./App.css";
import { get_API_address } from './API_addresses';

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  // Settings values
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [useOutline, setUseOutline] = useState(true);
  const [diminishMethod, setDiminishMethod] = useState(0);   // 0 = Threshold, 1 = Dynamic
  const [diminishType, setDiminishType] = useState(0);   // 0 = overlay, 1 = Blur, 2 = Desaturate
  const [nutriScoreBaseline, setNutriScoreBaseline] = useState(0);

  const API_URL = get_API_address(2);
  // const API_URL = '/api/detect';

  const detect = useCallback(async () => {
    if (!webcamRef.current) return;

    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) return;

      const blob = await fetch(imageSrc).then(res => res.blob());
      const formData = new FormData();
      formData.append('image', blob, 'frame.jpg');

      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData
      });

      const detections = await response.json();
      diminishObject(
        canvasRef.current,
        webcamRef.current.video,
        detections,
        diminishMethod,
        diminishType,
        useOutline,
        nutriScoreBaseline
      );
    } catch (error) {
      console.error('Detection error:', error);
    }
  }, [diminishMethod, diminishType, useOutline, nutriScoreBaseline]);


  // Initialize canvas when video loads
  const handleVideoLoad = () => {
    const video = webcamRef.current.video;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }
  };


  useEffect(() => {
    const interval = setInterval(detect, 1000);
    return () => clearInterval(interval);
  },  [diminishMethod, diminishType, useOutline, nutriScoreBaseline]);


  return (
    <div className="container">
      <Webcam
        className="webcam-component"
        ref={webcamRef}
        onLoadedMetadata={handleVideoLoad}
        audio={false}
        screenshotFormat="image/jpeg"
        videoConstraints={{
          facingMode: "environment",
        }}
      />
      <canvas className="canvas-overlay" ref={canvasRef}/>
      <GoGear
        className="gear-icon"
        onClick={() => setSettingsOpen(!settingsOpen)}
      />
      <Settings
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        diminishMethod={diminishMethod}
        setDiminishMethod={setDiminishMethod}
        diminishType={diminishType}
        setDiminishType={setDiminishType}
        useOutline={useOutline}
        setUseOutline={setUseOutline}
        nutriScoreBaseline={nutriScoreBaseline}
        setNutriScoreBaseline={setNutriScoreBaseline}
      />
    </div>
  );
}

export default App;
