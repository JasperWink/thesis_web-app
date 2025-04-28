import { useEffect, useRef, useState } from 'react'
import * as tf from '@tensorflow/tfjs';
import * as cocossd from '@tensorflow-models/coco-ssd';
import Webcam from 'react-webcam';
import './App.css'
import { diminishObj } from './Diminish';


// https://github.com/nicknochnack/ReactComputerVisionTemplate
function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const runCoco = async () => {
    const net = await cocossd.load();

    setInterval(() => {
      detect(net);
    }, 100);
  }

  const detect = async (net) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState == 4
    ) {
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      const obj = await net.detect(video);
      console.log(obj);

      const ctx = canvasRef.current.getContext("2d");
      diminishObj(obj, ctx);
    }
  }

  useEffect(() => {runCoco()}, [])

  return (
      <header className="App-header">
          <Webcam className="webcam-video" ref={webcamRef} muted={true}/>
          <canvas className="webcam-canvas" ref={canvasRef}/>
      </header>
  )
}

export default App
