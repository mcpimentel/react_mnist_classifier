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

const MODEL_URL = "./react_mnist_classifier/models/onnx_model.onnx";

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
          A simple demo of a classification model running on the browser! WORK IN PROGRESS!
          <p>
            Tested on a couple of browsers only.
          </p>
        </header>
        <Canvas status={this.state} session={this.session} />
      </div>
    );
  }
}

export default App;
