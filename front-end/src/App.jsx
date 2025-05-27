import React, { useRef, useEffect, useState, useCallback } from "react";
import { GoGear } from "react-icons/go";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";
import Webcam from "react-webcam";
import Settings from "./Settings";
import { diminishObject } from './DiminishObject';
// import { get_API_address } from './API_addresses';
import "./App.css";


function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [screenDimentions, setScreenDimentions] = useState({
    width: undefined, 
    height: undefined
  });

  // Settings values
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [useOutline, setUseOutline] = useState(0); // 0 = Off, 1 = Healthy, 2 = All
  const [diminishMethod, setDiminishMethod] = useState(0);   // 0 = Threshold, 1 = Dynamic
  const [diminishType, setDiminishType] = useState(0);   // 0 = overlay, 1 = Blur, 2 = Desaturate
  const [nutriScoreBaseline, setNutriScoreBaseline] = useState(0);

  // const API_URL = get_API_address(2);
  const API_URL = '/api/detect';

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


  // Toggle fullscreen function (simplified)
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(err => console.error('Fullscreen error:', err));
    } else {
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

  // Initialize canvas when video loads
  // const resizeHandler = () => {
  //   const video = webcamRef.current.video;
  //   const canvas = canvasRef.current;
  //   if (video && canvas) {
  //     canvas.width = screenDimentions.width;
  //     canvas.height = screenDimentions.height;

  //     video.width = screenDimentions.width;
  //     video.height = screenDimentions.height;
  //   }
  // };

  // // Handle a change in windowsize.
  // useEffect(() => {
  //   const resizeHandler = () => setScreenDimentions([window.innerWidth, window.innerHeight]);
  //   document.addEventListener('resize', resizeHandler);
  //   return () => document.removeEventListener('resize', resizeHandler);
  // }, []);

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
  },  [diminishMethod, diminishType, useOutline, nutriScoreBaseline]);


  return (
    <div className="container" ref={containerRef}>
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

        <GoGear
          className="gear-icon"
          onClick={() => setSettingsOpen(!settingsOpen)}
        />
        {isFullscreen ? (
          <MdFullscreenExit className="control-icon" onClick={toggleFullscreen} />
        ) : (
          <MdFullscreen className="control-icon" onClick={toggleFullscreen} />
        )}

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
