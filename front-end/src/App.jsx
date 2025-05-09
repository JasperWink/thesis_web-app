// import { useEffect, useRef, useState } from 'react'
// import * as tf from '@tensorflow/tfjs';
// import Webcam from 'react-webcam';
// import './App.css'
// import { diminishObj } from './Diminish';


// // https://www.youtube.com/watch?v=ZTSRZt04JkY
// function App() {
//   const webcamRef = useRef(null);
//   const canvasRef = useRef(null);

//   const runCoco = async () => {
//     const model = await tf.loadGraphModel('/object_detection_model/model.json');

//     setInterval(() => {
//       detect(model);
//     }, 10000);
//   }

//   const detect = async (model) => {
//     if (
//       typeof webcamRef.current !== "undefined" &&
//       webcamRef.current !== null &&
//       webcamRef.current.video.readyState == 4
//     ) {
//       const video = webcamRef.current.video;

//       const videoWidth = webcamRef.current.video.videoWidth;
//       const videoHeight = webcamRef.current.video.videoHeight;

//       webcamRef.current.video.width = videoWidth;
//       webcamRef.current.video.height = videoHeight;

//       // canvasRef.current.width = videoWidth;
//       // canvasRef.current.height = videoHeight;

//       const img = tf.browser.fromPixels(video)
//       const resized = tf.image.resizeBilinear(img, [640, 640])
//       // const normalized = resized.div(255.0).toFloat();
//       const casted = resized.cast('float32')
//       const expanded = casted.expandDims(0)

//       // console.log(img)
//       // console.log(resized)

//       console.log(expanded)
//       console.log(model.inputs[0].shape, model.inputs[0].dtype)

//       const obj = await model.executeAsync(expanded)

//       console.log(obj)

//       const ctx = canvasRef.current.getContext("2d");

//       // const obj = await model.detect(video);
//       // diminishObj(obj, ctx);

//       tf.dispose(img)
//       tf.dispose(resized)
//       tf.dispose(casted)
//       tf.dispose(expanded)
//       tf.dispose(obj)
//     }
//   }

//   useEffect(() => {runCoco()}, [])

//   return (
//       <header className="App-header">
//           <Webcam className="webcam-video" ref={webcamRef} muted={true}/>
//           <canvas className="webcam-canvas" ref={canvasRef}/>
//       </header>
//   )
// }

// export default App

// // Misschien is een Feature model iets?


// Import dependencies
import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import Webcam from "react-webcam";
import "./App.css";
import { nextFrame } from "@tensorflow/tfjs";
// 2. TODO - Import drawing utility here
// e.g. import { drawRect } from "./utilities";
// import {drawRect} from "./utilities"; 

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  // Main function
  const runCoco = async () => {
    // 3. TODO - Load network 
    // e.g. const net = await cocossd.load();
    // https://tensorflowjsrealtimemodel.s3.au-syd.cloud-object-storage.appdomain.cloud/model.json
    const net = await tf.loadGraphModel('/object_detection_model/model.json')
    
    //  Loop and detect hands
    setInterval(() => {
      detect(net);
    }, 10000);
  };

  const detect = async (net) => {
    // Check data is available
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas height and width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // 4. TODO - Make Detections
      const img = tf.browser.fromPixels(video)
      const resized = tf.image.resizeBilinear(img, [640,640])
      const casted = resized.cast('float32')
    
      const expanded = casted.expandDims(0)
      console.log(net.inputs[0])
      const obj = await net.executeAsync(expanded)
      console.log(obj)

      // const boxes = await obj[1].array()
      // const classes = await obj[2].array()
      // const scores = await obj[4].array()

      // Draw mesh
      const ctx = canvasRef.current.getContext("2d");

      // 5. TODO - Update drawing utility
      // drawSomething(obj, ctx)  
      // requestAnimationFrame(()=>{drawRect(boxes[0], classes[0], scores[0], 0.8, videoWidth, videoHeight, ctx)}); 

      tf.dispose(img)
      tf.dispose(resized)
      tf.dispose(casted)
      tf.dispose(expanded)
      tf.dispose(obj)

    }
  };

  useEffect(()=>{runCoco()},[]);

  return (
    <div className="App">
      <header className="App-header">
        <Webcam
          ref={webcamRef}
          muted={true} 
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 8,
            width: 640,
            height: 480,
          }}
        />
      </header>
    </div>
  );
}

export default App;