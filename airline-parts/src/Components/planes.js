import React, { Component } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { flureeFetch } from '../flureeFetch';
import ReactTable from 'react-table';
import 'react-table/react-table.css';

class Planes extends Component {
    state = {
        planeHistory: null
    }

    getPlaneHistory(id){
        if(id !== "Select a plane") {
            let query = {
            "trips": {
                "select": ["?startDate", "?endDate", "?startAirport", "?endAirport"],
                "where": [
                    ["?plane", "plane/id", Number(id)],
                    ["?plane", "plane/trips", "?trip"],
                    
                    ["?trip", "trip/startLocation", "?startLocation"],
                    ["?trip", "trip/startDate", "?startDate"],
                    ["?startLocation", "airport/name", "?startAirport"],
                
                    ["?trip", "trip/endLocation", "?endLocation"],
                    ["?trip", "trip/endDate", "?endDate"],
                    ["?endLocation", "airport/name", "?endAirport"],
                    ]
            },
            "repairs": {
                "select": [ "?repairStartDate", "?repairEndDate", "?repairDesc", "?airport"],
                "where": [
                    ["?plane", "plane/id", Number(id)],         
                    ["?repair", "repair/plane", "?plane"],
                    ["?repair", "repair/description", "?repairDesc"],
                    ["?repair", "repair/startDate", "?repairStartDate"],
                    ["?repair", "repair/endDate", "?repairEndDate"],
                    ["?repair", "repair/location", "?location"],
                    ["?location", "airport/name", "?airport"]
                ]
            } 
        }

        flureeFetch("multi-query", query)
        .then(res => {
            let repairs = res.repairs;
            let trips = res.trips;
            let allActivity = []

            repairs.map(repair => {
                allActivity.push({
                    "type": "Repair",
                    "startDate": repair[0], 
                    "endDate": repair[1],
                    "description": repair[2],
                    "startLocation": repair[3],
                    "endLocation": repair[3]
                })})

            trips.map(trip => {
                allActivity.push({
                    "type": "Trip",
                    "startDate": trip[0],
                    "endDate": trip[1],
                    "startLocation": trip[2],
                    "endLocation": trip[3]
                })})

            this.setState({ planeHistory: allActivity })
        })
        }
    }
 
  render(){
      const columns = [{ Header: "Type", accessor: "type" },
      { Header: "Start Date", accessor: "startDate", Cell: props => <span>{String(new Date(props.value).toLocaleDateString("en-US"))} {String(new Date(props.value).toLocaleTimeString("en-US"))}</span> },
      { Header: "End Date", accessor: "endDate", Cell: props => <span>{String(new Date(props.value).toLocaleDateString("en-US"))} {String(new Date(props.value).toLocaleTimeString("en-US"))}</span>  },
      { Header: "From", accessor: "startLocation" },
      { Header: "To", accessor: "endLocation" },
      { Header: "Description", accessor: "description", style: { 'white-space': 'unset'} }]

    return(
      <Row>
          <Col xs={12}>
              <div style={{margin: "20px"}}>
                <Form inline>
                    <Form.Group>
                        <Form.Label style={{ padding: "10px", fontSize: "20px"}}>See the history of a particular plane</Form.Label>
                        <Form.Control as="select" onChange={(e) => this.getPlaneHistory(e.target.value)}>
                            <option>Select a plane</option>
                            {
                                Array.from({length: 100}, (x,i) =>  
                                    <option>{i + 1}</option>)
                            }
                            </Form.Control>
                    </Form.Group>
                </Form>
                </div>
          </Col>
          <Col xs={12}>
              { this.state.planeHistory && 
              <ReactTable 
              data={this.state.planeHistory} 
              columns={columns} 
              defaultPageSize={5}
              style={{overflow:'wrap'}}/>}
          </Col>
      </Row>
    )
  }
}

export default Planes;
