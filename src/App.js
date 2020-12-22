import React from "react";
import Canvas from "./components/Canvas";
import { InferenceSession } from "onnxjs";
import "./App.css";

const INITIAL_STATE = {
  sessionRunning: false,
  inferenceTime: 0,
  error: false,
  output: [],
  modelLoading: false,
  modelLoaded: false,
  backendHint: 'webgl', // ['webgl', 'wasm', 'cpu']
  selectedImage: null,
}

// if on localhost >> uncomment next line
let MODEL_URL = "./models/onnx_model.onnx";
// if on localhost >> comment next line
//const MODEL_URL = "./models/onnx_model.onnx";

if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
  MODEL_URL = './react_mnist_classifier/models/onnx_model.onnx';
  // console.log("It's a local server!");
} else {
  // console.log("It's NOT a local server!");
}

class App extends React.Component {
  componentDidMount() {
    this.runModel();
  }

  state = { ...INITIAL_STATE };

  session = new InferenceSession({ backendHint: this.state.backendHint });
  
  runModel = async () => {
    try {
      if (!this.state.modelLoaded) {
        this.setState({
          modelLoading: true,
        });
        await this.session.loadModel(MODEL_URL);
        this.setState({
          modelLoaded: true,
          modelLoading: false,
        });
      }
    }
    catch(e) {
      console.warn(e);
    }
    
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          Handwritten digits classification.
          <p> A simple demo of a classification model running on the browser </p>
        </header>
        <p> The app is implemented using <a href='https://reactjs.org/'>ReactJS</a> and <a href='https://github.com/microsoft/onnxjs'>ONNXJS</a>. See <a href='https://github.com/mcpimentel/react_mnist_classifier'>here</a> for code and other details. </p> 
        <p> This app has been tested with Google Chrome (both desktop and mobile devices)! </p>
        <Canvas status={this.state} session={this.session} />
      </div>
    );
  }
}

export default App;
