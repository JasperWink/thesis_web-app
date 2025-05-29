import React, { useRef, useEffect, useState, useCallback } from "react";
import { GoGear } from "react-icons/go";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";
import Webcam from "react-webcam";
import Settings from "./Settings";
import { diminishObject } from './DiminishObject';
import { io } from 'socket.io-client';
import "./App.css";


function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const socketRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rtt, setRtt] = useState(0);
  const pendingRequests = useRef(new Map());

  const rttArray = useRef([]);
  const MAX_RTT_RECORDS = 1000; 


  // Settings values
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [diminishMethod, setDiminishMethod] = useState(0);   // 0 = Threshold, 1 = Dynamic
  const [diminishEffect, setDiminishEffect] = useState(0);   // 0 = overlay, 1 = Blur, 2 = Desaturate
  const [nutriScoreBaseline, setNutriScoreBaseline] = useState(0);
  const [useOutline, setUseOutline] = useState(0); // 0 = Off, 1 = Healthy, 2 = All
  const [outlineColor, setOutlineColor] = useState('gray');

  const settingsRef = useRef({
    diminishMethod,
    diminishEffect,
    nutriScoreBaseline,
    useOutline,
    outlineColor
  });

  const detect = useCallback(async () => {
    if (!webcamRef.current || !socketRef.current?.connected) return;

    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) return;

      // Generate unique request ID and record start time
      const requestId = Date.now() + Math.random();
      const startTime = performance.now();
      pendingRequests.current.set(requestId, startTime);

      // Send the base64 image data through WebSocket
      socketRef.current.emit('detect_frame', {
        image: imageSrc,
        requestId: requestId
      });

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

  // Initialize WebSocket connection
  useEffect(() => {
    // Connect to the WebSocket server through the proxy
    socketRef.current = io('/', {
      path: '/socket.io',
      transports: ['websocket', 'polling']
    });

    socketRef.current.on('status', (data) => {
      console.log('Server status:', data.msg);
    });

    socketRef.current.on('detection_result', (data) => {
      const endTime = performance.now();
      const requestId = data.requestId;

      // Calculate RTT if we have the start time
      if (requestId && pendingRequests.current.has(requestId)) {
        const startTime = pendingRequests.current.get(requestId);
        const currentRtt = endTime - startTime;
        setRtt(currentRtt);
        console.log(`RTT: ${currentRtt.toFixed(2)}ms`);
        pendingRequests.current.delete(requestId);

        // -------------- DIT IS OM DE RTT TE METEN -----------
        // if (rttArray.current.length < MAX_RTT_RECORDS) {
        //   console.log("push")
        //   rttArray.current.push(currentRtt);
        // }
        // else {
        //   console.log(rttArray);
        // }
      }

      // Process the detection results
      if (canvasRef.current && webcamRef.current?.video) {
        diminishObject(
          canvasRef.current,
          webcamRef.current.video,
          data.detections,
          settingsRef.current.diminishMethod,
          settingsRef.current.diminishEffect,
          settingsRef.current.nutriScoreBaseline,
          settingsRef.current.useOutline,
          settingsRef.current.outlineColor
        );
      }
    });

    socketRef.current.on('detection_error', (error) => {
      console.error('Detection error:', error);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

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
