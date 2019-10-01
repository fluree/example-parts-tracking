import React, { Component } from 'react';
import './App.css';
import { Button, ButtonGroup, Row, Col } from 'react-bootstrap';
import { flureeFetch } from './flureeFetch';
import Airports from './Components/airports';
import Planes from './Components/planes';
import PartByType from './Components/partByType';
import PartInfo from './Components/partInfo';
import VerifyPart from './Components/verifyPart';


class Main extends Component {
  state = {
    view: "planes"
  }

  componentDidMount(){
    let query = {
      "trips": { "select": "(count ?trip)", "where": [["?plane", "plane/trips", "?trip"]] },
      "planes": { "select": "(count ?plane)", "where": [["?plane", "plane/id", "?id"]] },
      "repairs": { "select": "(count ?repair)", "where": [["?repair", "repair/description", "?description"]] }
    }

    flureeFetch("multi-query", query)
    .then(res => this.setState({ numTrips: res.trips[0], numPlanes: res.planes[0], numRepairs: res.repairs[0] }))
  }

  render(){
    return(
      <div>
        <Row>
          <Col xs={12}>
            <h2>Airplane Parts Demo</h2>
          </Col>
        </Row>
        <Row>
          <Col xs={{ span: 6, offset: 3}}>
            <div style={{border: "1px solid black", padding: "10px", marginBottom: "20px"}}>
              <div>Total Planes: {this.state.numPlanes} </div>
              <div>Total Trips: {this.state.numTrips} </div>
              <div>Total Repairs: {this.state.numRepairs}</div>
            </div>
          </Col>
        </Row>
        <Row>
          <Col xs={12} className="text-left" style={{margin: "10px"}}> 
            <h3 style={{display: "inline"}}>Explore: </h3>
            <ButtonGroup>
              <Button variant="secondary" onClick={() => this.setState({ view: "planes"})}
              disabled={this.state.view === "planes"}>Planes</Button>
              <Button variant="secondary" onClick={() => this.setState({ view: "airports"})}
              disabled={this.state.view === "airports"}>Airports</Button>
              <Button variant="secondary" onClick={() => this.setState({ view: "verifyPart"})}
              disabled={this.state.view === "verifyPart"}>Verify Part</Button>
              <Button variant="secondary" onClick={() => this.setState({ view: "partByType"})}
              disabled={this.state.view === "partByType"}>Part by Type</Button>
              <Button variant="secondary" onClick={() => this.setState({ view: "partInfo"})}
              disabled={this.state.view === "partInfo"}>Part by Serial Number</Button>
            </ButtonGroup>
          </Col>
        </Row>
          {
            this.state.view === "planes" && <Planes />
          }
          {
            this.state.view === "airports" && <Airports />
          }
          {
            this.state.view === "verifyPart" && <VerifyPart />
          }
          {
            this.state.view === "partByType" && <PartByType />
          }
          {
            this.state.view === "partInfo" && <PartInfo />
          }
      </div>
    )
  }
}


function App() {
  return (
    <div className="App">
      <Main/>
    </div>
  );
}

export default App;
