import React, { useRef, useEffect, useState, useCallback } from "react";
import { GoGear } from "react-icons/go";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";
import Webcam from "react-webcam";
import Settings from "./Settings";
import { diminishObject } from './DiminishObject';
import "./App.css";


function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Settings values
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [diminishMethod, setDiminishMethod] = useState(0);   // 0 = Threshold, 1 = Dynamic
  const [diminishEffect, setDiminishEffect] = useState(0);   // 0 = overlay, 1 = Blur, 2 = Desaturate
  const [nutriScoreBaseline, setNutriScoreBaseline] = useState(0);
  const [useOutline, setUseOutline] = useState(0); // 0 = Off, 1 = Healthy, 2 = All
  const [outlineColor, setOutlineColor] = useState('gray');

  const API_URL = '/api/detect';

  const settingsRef = useRef({
    diminishMethod,
    diminishEffect,
    nutriScoreBaseline,
    useOutline,
    outlineColor
  });

  const detect = useCallback(async () => {
    if (!webcamRef.current) return;

    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) return;

      // Create the blob from the screenshot.
      const blob = await fetch(imageSrc).then(res => res.blob());
      const formData = new FormData();
      formData.append('image', blob, 'frame.jpg');

      // Send the screenshot to the server.
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData
      });

      // Receive the response and diminish.
      const detections = await response.json();
      diminishObject(
        canvasRef.current,
        webcamRef.current.video,
        detections,
        settingsRef.current.diminishMethod,
        settingsRef.current.diminishEffect,
        settingsRef.current.nutriScoreBaseline,
        settingsRef.current.useOutline,
        settingsRef.current.outlineColor
      );

    } catch (error) {
      console.error('Detection error:', error);
    }
  }, []);


  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    // If not in fullscreen, enter Fullscreen.
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(err => console.error('Fullscreen error:', err));
    } 
    // Exit fullscreen if already in it.
    else {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false));
    }
  }, []);


  // Initialize canvas when video loads
  const handleVideoLoad = () => {
    const video = webcamRef.current.video;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }
  };

  // Handle fullscreen.
  useEffect(() => {
    const fullscreenHandler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', fullscreenHandler);
    return () => document.removeEventListener('fullscreenchange', fullscreenHandler);
  }, []);

  // Detect the objects on the screen every interval.
  useEffect(() => {
    const interval = setInterval(detect, 200);
    return () => clearInterval(interval);
  }, []);

  // Update the ref when settings change.
  useEffect(() => {
    settingsRef.current = {
      diminishMethod,
      diminishEffect,
      nutriScoreBaseline,
      useOutline,
      outlineColor
    };
  }, [diminishMethod, diminishEffect, nutriScoreBaseline, useOutline, outlineColor]);

  return (
    <div className="container" ref={containerRef}>
      <div className="header">
        <GoGear className="gear-icon" onClick={() => setSettingsOpen(!settingsOpen)}/>
        {isFullscreen ? (
          <MdFullscreenExit className="control-icon" onClick={toggleFullscreen} />
        ) : (
          <MdFullscreen className="control-icon" onClick={toggleFullscreen} />
        )}
      </div>

      <Webcam
        className="webcam-component"
        ref={webcamRef}
        // width={screenDimentions.width}
        // height={screenDimentions.height}
        onLoadedMetadata={handleVideoLoad}
        screenshotFormat="image/jpeg"
        videoConstraints={{
          facingMode: "environment",
        }}
      />
      <canvas className="canvas-overlay" ref={canvasRef}/>

      <Settings
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        diminishMethod={diminishMethod}
        setDiminishMethod={setDiminishMethod}
        diminishEffect={diminishEffect}
        setDiminishEffect={setDiminishEffect}
        nutriScoreBaseline={nutriScoreBaseline}
        setNutriScoreBaseline={setNutriScoreBaseline}
        useOutline={useOutline}
        setUseOutline={setUseOutline}
        outlineColor={outlineColor}
        setOutlineColor={setOutlineColor}
      />
    </div>
  );
}

export default App;
