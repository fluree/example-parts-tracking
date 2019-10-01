import React, { Component } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { flureeFetch } from '../flureeFetch';
import ReactTable from 'react-table';
import 'react-table/react-table.css'


class Airports extends Component {
    state = {
        airports: [],
        airportHistory: null
    }

    componentDidMount(){
        flureeFetch("query", {"select": "?name", "where": [["?airport", "airport/name", "?name"]]})
        .then(res => this.setState({ airports: res}))
    }

    getAirportHistory(airport){
        if(airport !== "Select an airport") {
            let query = {
                "departures": {
                    "select": ["?startDate", "?endDate", "?endAirport", "?plane"],
                    "where": [
                        ["?trip", "trip/startLocation", "?airport"],
                        ["?airport", "airport/name", airport],
                        ["?plane_id", "plane/trips", "?trip"],
                        ["?plane_id", "plane/id", "?plane"],
                        ["?trip", "trip/startDate", "?startDate"],
                        ["?trip", "trip/endDate", "?endDate"],
                        ["?trip", "trip/endLocation", "?endLocation"],
                        ["?endLocation", "airport/name", "?endAirport"] 
                    ]
                },
                "arrivals":  {
                    "select": ["?startDate", "?endDate", "?startAirport", "?plane"],
                    "where": [
                        ["?trip", "trip/endLocation", "?airport"],
                        ["?airport", "airport/name", airport],
                        ["?plane_id", "plane/trips", "?trip"],
                        ["?plane_id", "plane/id", "?plane"],
                        ["?trip", "trip/startDate", "?startDate"],
                        ["?trip", "trip/endDate", "?endDate"],
                        ["?trip", "trip/startLocation", "?startLocation"],
                        ["?startLocation", "airport/name", "?startAirport"] 
                    ]
                },
                "repairs": {
                    "select": ["?startDate", "?endDate", "?description", "?plane"],
                    "where": [
                        ["?repair", "repair/location", "?airport"],
                        ["?repair", "repair/endDate", "?endDate"],
                        ["?repair", "repair/startDate", "?startDate"],
                        ["?repair", "repair/description", "?description"],
                        ["?airport", "airport/name", airport],
                        ["?repair", "repair/plane", "?plane_id"],
                        ["?plane_id", "plane/id","?plane"]
                    ]
                }
            }

            flureeFetch("multi-query", query)
            .then(res => {
                let repairs = res.repairs;
                let departures = res.departures;
                let arrivals = res.arrivals;
                let allActivity = []
        
                    repairs.map(repair => {
                        allActivity.push({
                            "type": "Repair",
                            "startDate": repair[0], 
                            "endDate": repair[1],
                            "description": repair[2],
                            "startLocation": airport,
                            "endLocation": airport,
                            "plane": repair[3]
                        })})
        
                    arrivals.map(trip => {
                        allActivity.push({
                            "type": "Arrival",
                            "startDate": trip[0],
                            "endDate": trip[1],
                            "startLocation": trip[2],
                            "endLocation": airport,
                            "plane": trip[3]
                        })})

                    departures.map(trip => {
                            allActivity.push({
                                "type": "Departures",
                                "startDate": trip[0],
                                "endDate": trip[1],
                                "startLocation": airport,
                                "endLocation": trip[2],
                                "plane": trip[3]
                    })})
        
                    this.setState({ airportHistory: allActivity })
            })
        }
    }



  render(){
    const columns = [{ Header: "Type", accessor: "type" },
    { Header: "Plane", accessor: "plane" },
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
                        <Form.Label style={{ padding: "10px", fontSize: "20px"}}>See the history of a particular airport</Form.Label>
                        <Form.Control as="select" onChange={(e) => this.getAirportHistory(e.target.value)}>
                            <option>Select an airport</option>
                            {
                                this.state.airports.map(airport => <option>{airport}</option>)
                            }
                            </Form.Control>
                    </Form.Group>
                </Form>
                </div>
          </Col>
          <Col xs={12}>
              <ol>
              { this.state.airportHistory && 
              <ReactTable 
              data={this.state.airportHistory} 
              columns={columns} 
              defaultPageSize={5}
              style={{overflow:'wrap'}}/>}
              </ol>
          </Col>
      </Row>
    )
  }
}

export default Airports;
