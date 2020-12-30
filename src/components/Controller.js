import React from 'react';
import Canvas from "./Canvas";
import CanvasUncertainty from "./CanvasUncertainty";

import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab'


class Controller extends React.Component {
    constructor(props, context) {
		super(props, context);
		this.state = {
			key: 'home',
		};
    }
    
    render() {
        const { session, session2 } = this.props;
        const { modelloaded, model2loaded, modelloading, model2loading } = this.props.status;
        if (modelloading===1 | model2loading===1) {
            return (
                <div>
                    Loading models...
                </div>
            )
        }
        if (modelloading===0 & model2loading===0 & modelloaded===0 & model2loaded===0) {
            return (
                <div>
                    Found a problem loading the models...
                </div>
            )
        }
        return (
            <div>
                <Tabs activeKey={this.state.key} id="tab_controller" onSelect={key => this.setState({ key })}>
                    <Tab eventKey="home" title="Standard">
                        <Canvas modelloaded={modelloaded} session={session} />
                    </Tab>
                    <Tab eventKey="uncertain" title="With Uncertainty">
                        <CanvasUncertainty modelloaded={model2loaded} session={session2} />
                    </Tab>
                </Tabs>
            </div>
        );
    }
}

export default Controller;