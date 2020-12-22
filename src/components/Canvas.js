import React, { useEffect, useRef } from 'react';
import { getTensorFromCanvasContext } from '../onnx/utils';

import './Canvas.css';

let isMouseDown = false;
let hasIntroText = true;
let lastX;
let lastY;
const CANVAS_SIZE = 280;
const CANVAS_SCALE = 0.5;


// const IMAGE_SIZE = 28;
let ctx = null;

const Canvas = props => {
    const { session, status } = props; 

    // setup canvas
    const canvas = useRef();
    
    // initialize canvas
    useEffect(() => {
        const canvasEle = canvas.current;
        canvasEle.width = 280;
        canvasEle.height = 280;
        // get canvas context
        ctx = canvasEle.getContext("2d");
        ctx.lineWidth = 28;
        ctx.lineJoin = "round";
        ctx.font = "28px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#212121";
        ctx.strokeStyle = "#212121";
        //ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        ctx.fillText("Write a number here!", CANVAS_SIZE / 2, CANVAS_SIZE / 2);
        
    }, []);

    // add canvas 
    useEffect(() => {
        const canvasEle = canvas.current;
        // event listeners for mouse (browser + PCs)
        canvasEle.addEventListener("mousedown", canvasMouseDown);
        canvasEle.addEventListener("mousemove", canvasMouseMove);
        document.body.addEventListener("mouseup", bodyMouseUp);
        document.body.addEventListener("mouseout", bodyMouseOut);
        // event listeners for mobile devices
        canvasEle.addEventListener("touchstart", canvasTouchStart);
        canvasEle.addEventListener("touchmove", canvasTouchMove);
        document.body.addEventListener("touchend", bodyTouchEnd);
    });

    // draw a line
    const drawLine = (info) => {
        const { fromX, fromY, toX, toY } = info;
        //const { color = 'black', width = 20 } = style;
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        //ctx.strokeStyle = color;
        //ctx.lineWidth = width;
        ctx.closePath();
        ctx.stroke();
        updatePredictions();
    };
    
    // To draw a dot on the mouse down event, we set laxtX and lastY to be
    // slightly offset from x and y, and then we call `canvasMouseMove(event)`,
    // which draws a line from (laxtX, lastY) to (x, y) that shows up as a
    // dot because the difference between those points is so small. However,
    // if the points were the same, nothing would be drawn, which is why the
    // 0.001 offset is added.
    const canvasMouseDown = (event) => {
        //console.log("canvas mouse down");
        isMouseDown = true;
        if (hasIntroText) {
            clearCanvas();
            hasIntroText = false;
        }
        const x = event.offsetX / CANVAS_SCALE;
        const y = event.offsetY / CANVAS_SCALE;
        lastX = x + 0.001;
        lastY = y + 0.001;
        // console.log(event);
        canvasMouseMove(event);
    }
    const canvasTouchStart = (event) => {
        //console.log("touch start");
        isMouseDown = true;
        if (hasIntroText) {
            clearCanvas();
            hasIntroText = false;
        }
        const bcr = event.target.getBoundingClientRect();
        const x = (event.targetTouches[0].clientX - bcr.x) / CANVAS_SCALE;
        const y = (event.targetTouches[0].clientY - bcr.y) / CANVAS_SCALE;
        lastX = x + 0.001;
        lastY = y + 0.001;
        canvasTouchMove(event);
    }
    // To draw the path on the mouse move event
    const canvasMouseMove = (event) => {
        const toX = event.offsetX / CANVAS_SCALE;
        const toY = event.offsetY / CANVAS_SCALE;
        if (isMouseDown) {
            //console.log("canvas mouse move");
            //console.log({fromX: lastX, fromY: lastY, toX: toX, toY: toY });
            drawLine({fromX: lastX, fromY: lastY, toX: toX, toY: toY });
        }
        lastX = toX;
        lastY = toY;
    }
    // To draw the path on the mouse move event
    const canvasTouchMove = (event) => {
        const bcr = event.target.getBoundingClientRect();
        const toX = (event.targetTouches[0].clientX - bcr.x) / CANVAS_SCALE;
        const toY = (event.targetTouches[0].clientY - bcr.y) / CANVAS_SCALE;
        if (isMouseDown) {
            //console.log("canvas mouse move");
            //console.log({fromX: lastX, fromY: lastY, toX: toX, toY: toY });
            drawLine({fromX: lastX, fromY: lastY, toX: toX, toY: toY });
        }
        lastX = toX;
        lastY = toY;
    }
    // stop drawing when mouse is up
    const bodyMouseUp = () => {
        //console.log("body mouse up");
        isMouseDown = false;
        //console.log({ fromX: lastX, fromY: lastY });
    }
    // stop drawing when mouse is up
    const bodyTouchEnd = () => {
        // console.log("touch end");
        isMouseDown = false;
        //console.log({ fromX: lastX, fromY: lastY });
    }
    // We won't be able to detect a MouseUp event if the mouse has moved
    // ouside the window, so when the mouse leaves the window, we set
    // `isMouseDown` to false automatically. This prevents lines from
    // continuing to be drawn when the mouse returns to the canvas after
    // having been released outside the window.
    const bodyMouseOut = () => {
        //console.log("body mouse out");
        isMouseDown = false;
        //if (!event.relatedTarget || event.relatedTarget.nodeName === "HTML") {
        //    isMouseDown = false;
        //}
    }

    const clearCanvas = () => {
        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        for (let i = 0; i < 10; i++) {
            const element = document.getElementById(`prediction-${i}`);
            element.className = "prediction-col";
            element.children[1].children[0].style.width = "0";
            element.className = "prediction-col";
        }
    }

    const updatePredictions = async () => {
        if (status && status.modelLoaded) {
            // Get the predictions for the canvas data.
            const imgData = getTensorFromCanvasContext(ctx);
        
            const outputMap = await session.run([imgData]);
            const outputTensor = outputMap.values().next().value;
            const predictions = outputTensor.data;
            const maxPrediction = Math.max(...predictions);
            for (let i = 0; i < predictions.length; i++) {
                const element = document.getElementById(`prediction-${i}`);
                element.children[1].children[0].style.width = `${predictions[i] * 100}%`;
                element.className =
                  predictions[i] === maxPrediction
                    ? "prediction-col top-prediction"
                    : "prediction-col";
            }
        }
      }

    return (
        <div style={{ padding: 10 }}>
            <canvas className="canvas" ref={canvas} {...props}/>
            <div></div>
            <button className="button"
                onClick={() => {
                    clearCanvas();
                    //console.log("button clear clicked")
                }}>CLEAR
            </button>
            <div>
                <div className="predictions">
                    <div className="prediction-col" id="prediction-0">
                        <div className="prediction-number">0</div>
                        <div className="prediction-bar-container">
                            <div className="prediction-bar"></div>
                        </div>
                    </div>
                    <div className="prediction-col" id="prediction-1">
                        <div className="prediction-number">1</div>
                        <div className="prediction-bar-container">
                            <div className="prediction-bar"></div>
                        </div>
                    </div>
                    <div className="prediction-col" id="prediction-2">
                        <div className="prediction-number">2</div>
                        <div className="prediction-bar-container">
                            <div className="prediction-bar"></div>
                        </div>
                    </div>
                    <div className="prediction-col" id="prediction-3">
                        <div className="prediction-number">3</div>
                        <div className="prediction-bar-container">
                            <div className="prediction-bar"></div>
                        </div>
                    </div>
                    <div className="prediction-col" id="prediction-4">
                        <div className="prediction-number">4</div>
                        <div className="prediction-bar-container">
                            <div className="prediction-bar"></div>
                        </div>
                    </div>
                    <div className="prediction-col" id="prediction-5">
                        <div className="prediction-number">5</div>
                        <div className="prediction-bar-container">
                            <div className="prediction-bar"></div>
                        </div>
                    </div>
                    <div className="prediction-col" id="prediction-6">
                        <div className="prediction-number">6</div>
                        <div className="prediction-bar-container">
                            <div className="prediction-bar"></div>
                        </div>
                    </div>
                    <div className="prediction-col" id="prediction-7">
                        <div className="prediction-number">7</div>
                        <div className="prediction-bar-container">
                            <div className="prediction-bar"></div>
                        </div>
                    </div>
                    <div className="prediction-col" id="prediction-8">
                        <div className="prediction-number">8</div>
                        <div className="prediction-bar-container">
                            <div className="prediction-bar"></div>
                        </div>
                    </div>
                    <div className="prediction-col" id="prediction-9">
                        <div className="prediction-number">9</div>
                        <div className="prediction-bar-container">
                            <div className="prediction-bar"></div>
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
    );
}

export default Canvas;
