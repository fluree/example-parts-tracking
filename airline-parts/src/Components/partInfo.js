import React, { Component } from 'react';
import { Button, ButtonGroup, Row, Col, Form } from 'react-bootstrap';
import { flureeFetch } from '../flureeFetch';
import Autosuggest from 'react-autosuggest';
import ReactTable from 'react-table';
import 'react-table/react-table.css';

const getSuggestions = (value, serialNums) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;
  
    return inputLength < 2 ? [] : serialNums.filter(sn =>
      sn.toLowerCase().slice(0, inputLength) === inputValue
    );
  };

const renderSuggestion = suggestion => (<span>{suggestion}</span> );
const getSuggestionValue = suggestion => suggestion;

class PartInfo extends Component {
    state = {
        serialNums: null,
        serialNum: '',
        serialNumSuggestions: [],
        partHistory: null
    }

    componentDidMount(){
        let query = {
            "select": "?serialNum",
            "where": [ ["?part", "part/serialNumber", "?serialNum"]] }

        flureeFetch("query", query)
        .then(res => this.setState({ serialNums: res}))
    }

    getPartInfo(){
        let serial = this.state.serialNum;

        let query =  { "trips": {
            "select": ["?startDate", "?endDate", "?startAirport", "?endAirport", 
            "?plane_id"],
            "where": [
                ["?part", "part/serialNumber", serial],
                ["?plane", "plane/sections", "?section"],
                ["?section", "section/parts", "?part"],
                ["?plane", "plane/id", "?plane_id"],
                ["?plane", "plane/trips", "?trip"],
                ["?trip", "trip/startLocation", "?startLocation"],
                ["?trip", "trip/startDate", "?startDate"],
                ["?startLocation", "airport/name", "?startAirport"],
                ["?trip", "trip/endLocation", "?endLocation"],
                ["?trip", "trip/endDate", "?endDate"],
                ["?endLocation", "airport/name", "?endAirport"]
            ]},
            "repairs": {
                    "select":  [ "?repairStartDate", "?repairEndDate", "?repairDesc", 
                    "?airport", "?plane_id"],
                    "where": [
                        ["?part", "part/serialNumber", serial],
                        ["?repair", "repair/part", "?part"],
                        ["?repair", "repair/plane", "?plane"],
                        ["?plane", "plane/id", "?plane_id"],
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
                    "endLocation": repair[3],
                    "plane": repair[4]
                })})

            trips.map(trip => {
                allActivity.push({
                    "type": "Trip",
                    "startDate": trip[0],
                    "endDate": trip[1],
                    "startLocation": trip[2],
                    "endLocation": trip[3],
                    "plane": trip[4]
                })})

            this.setState({ partHistory: allActivity })
        })
    }

    onChange = (event, { newValue }) => { this.setState({ serialNum: newValue }, () => this.getPartInfo());};
    
    onSuggestionsFetchRequested = ({ value }) => {
        this.setState({ serialNumSuggestions: getSuggestions(value, this.state.serialNums)});
      };

      onSuggestionsClearRequested = () => {
        this.setState({ serialNumSuggestions: [] }) };
 
  render(){
    const { serialNum, serialNumSuggestions } = this.state;

    const inputProps = {
        placeholder: 'Type a serial number',
        value: serialNum,
        onChange: this.onChange
      };

      const columns = [{ Header: "Type", accessor: "type" },
      { Header: "Start Date", accessor: "startDate", Cell: props => <span>{String(new Date(props.value).toLocaleDateString("en-US"))} {String(new Date(props.value).toLocaleTimeString("en-US"))}</span> },
      { Header: "End Date", accessor: "endDate", Cell: props => <span>{String(new Date(props.value).toLocaleDateString("en-US"))} {String(new Date(props.value).toLocaleTimeString("en-US"))}</span>  },
      { Header: "From", accessor: "startLocation" },
      { Header: "To", accessor: "endLocation" },
      { Header: "Plane", accessor: "plane" },
      { Header: "Description", accessor: "description", style: { 'white-space': 'unset'} }]

    return(
      <Row>
        <Col xs={12}>
            <div>
                <p style={{padding: "10px", fontSize: "20px" }}>Select a serial number. i.e. Type `a1` and select the first serial number. </p>
                <Autosuggest
                    suggestions={serialNumSuggestions}
                    onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                    onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                    getSuggestionValue={getSuggestionValue}
                    renderSuggestion={renderSuggestion}
                    inputProps={inputProps} 
                    />
            </div>
        </Col>
        <Col xs={12}>
        { this.state.partHistory && 
              <ReactTable 
              data={this.state.partHistory} 
              columns={columns} 
              defaultPageSize={5}
              style={{overflow:'wrap'}}/>}
        </Col>
      </Row>
    )
  }
}

export default PartInfo;
