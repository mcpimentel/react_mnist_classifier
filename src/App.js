import React from "react";
import Controller from "./components/Controller";
import { InferenceSession } from "onnxjs";
import "./App.css";

const INITIAL_STATE = {
  modelloading: 0,
  modelloaded: 0,
  model2loading: 0,
  model2loaded: 0,
  backendHint: 'webgl', // ['webgl', 'wasm', 'cpu']
}

// if on localhost >> uncomment next line
let MODEL_URL = "./models/onnx_lenet_standard.onnx";
let MODEL_URL_2 = "./models/onnx_lenet_manualdropout.onnx";
// if on localhost >> comment next line
//const MODEL_URL = "./models/onnx_model.onnx";

if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
  MODEL_URL = './react_mnist_classifier/models/onnx_lenet_standard.onnx';
  MODEL_URL_2 = './react_mnist_classifier/models/onnx_lenet_manualdropout.onnx';
  // console.log("It's a local server!");
} else {
  // console.log("It's NOT a local server!");
}

class App extends React.Component {
  componentDidMount() {
    this.loadModel();
    this.loadModel2();
  }

  state = { ...INITIAL_STATE };

  // create 2 sessions: one for each model
  session = new InferenceSession({ backendHint: this.state.backendHint });
  session2 = new InferenceSession({ backendHint: this.state.backendHint });

  loadModel = async () => {
    try {
      if (!this.state.modelloaded) {
        this.setState({
          modelLoading: 1,
        });
        await this.session.loadModel(MODEL_URL);
        this.setState({
          modelloaded: 1,
          modelLoading: 0,
        });
      }
    }
    catch(e) {
      console.warn(e);
    }
  }

  loadModel2 = async () => {
    try {
      if (!this.state.model2Loaded) {
        this.setState({
          model2Loading: 1,
        });
        await this.session2.loadModel(MODEL_URL_2);
        this.setState({
          model2loaded: 1,
          model2Loading: 0,
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
        <p> It has been tested with Google Chrome (both desktop and mobile devices)! Have not conducted extensive tests on other browsers! </p>
        <p> "U" corresponds to an estimation of uncertainty in the prediction!</p>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Controller status={this.state} session={this.session} session2={this.session2} />
        </div>
        
      </div>
    );
  }
}

// <Canvas status={this.state} session={this.session} />
export default App;
