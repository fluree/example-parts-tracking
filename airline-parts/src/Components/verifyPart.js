import React, { Component } from 'react';
import { Button, ButtonGroup, Row, Col, Form } from 'react-bootstrap';
import { flureeFetch } from '../flureeFetch';
import Autosuggest from 'react-autosuggest';
import sampleData from '../sampleData';

function convertArrayOfObjectsToCSV(args) {  
    var result, ctr, keys, columnDelimiter, lineDelimiter, data;
  
    data = args.data || null;
    if (data == null || !data.length) {
        return null;
    }
  
    columnDelimiter = args.columnDelimiter || ',';
    lineDelimiter = args.lineDelimiter || '\n';
  
    keys = Object.keys(data[0]);
  
    result = '';
    result += keys.join(columnDelimiter);
    result += lineDelimiter;
  
    data.forEach(function(item) {
        ctr = 0;
        keys.forEach(function(key) {
            if (ctr > 0) result += columnDelimiter;
  
            result += item[key];
            ctr++;
        });
        result += lineDelimiter;
    });
  
    return result;
}

const getSuggestions = (value, serialNums) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength < 2 ? [] : serialNums.filter(sn =>
        sn.toLowerCase().slice(0, inputLength) === inputValue
    );
};

const renderSuggestion = suggestion => (<span>{suggestion}</span>);
const getSuggestionValue = suggestion => suggestion;

class VerifyPart extends Component {
    state = {
        serialNums: null,
        serialNum: '',
        serialNumSuggestions: []
    }

    componentDidMount(){
        let query = {
            "select": "?serialNum",
            "where": [["?part", "part/serialNumber", "?serialNum"]]
        }

        flureeFetch("query", query)
            .then(res => this.setState({ serialNums: res }))
    }

    downloadSample(){
        let csv = convertArrayOfObjectsToCSV({ data: sampleData})
        if(csv === null) return;
    
        var hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + csv;
        hiddenElement.target = '_blank';
        hiddenElement.download = 'sample_data.csv'
        hiddenElement.click()
    }

    onChange = (event, { newValue }) => { this.setState({ serialNum: newValue }) };

    onSuggestionsFetchRequested = ({ value }) => {
        this.setState({ serialNumSuggestions: getSuggestions(value, this.state.serialNums) });
    };

    onSuggestionsClearRequested = () => {
        this.setState({ serialNumSuggestions: [] })
    };

    verifyPart() {
        let verify = sampleData.filter(data => data.signature === this.state.signature);
        if(verify.length !== 1 ){
            this.setState({ verified: true, valid: false })
        } else {
            if(verify[0]["serial-number"] === this.state.serialNum && 
            verify[0]["manufactureDate"] === Number(this.state.manufactureDate)){
                this.setState({  verified: true, valid: true })
            } else {
                this.setState({ verified: true, valid: false })
            }
        }

    }

    render() {
        const { serialNum, serialNumSuggestions } = this.state;

        const inputProps = {
            placeholder: 'Type a serial number',
            value: serialNum,
            onChange: this.onChange
        };

        return (
            <Row>
                <Col xs={12}>
                        <h2>Verify a Part by Signature</h2>
                        <div style={{padding: "40px"}}>
                            <Button onClick={() => this.downloadSample()}>Download sample valid part signatures.</Button>
                        </div>
                </Col>
                <Col md={4}>
                        <p className="text-left" style={{ paddingLeft: "20px" }}>Serial Number</p>
                        <Autosuggest
                            suggestions={serialNumSuggestions}
                            onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                            onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                            getSuggestionValue={getSuggestionValue}
                            renderSuggestion={renderSuggestion}
                            inputProps={inputProps}
                        />
                </Col>
                <Col md={4}>
                    <Form.Group controlId="ManufactureDate">
                        <Form.Label>Manufacture Date (in epoch milliseconds)</Form.Label>
                        <Form.Control type="text" placeholder="Enter manufacture date"
                            onChange={(e) => this.setState({ manufactureDate: e.target.value })} />
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group controlId="Signature">
                        <Form.Label>Signature</Form.Label>
                        <Form.Control type="text" placeholder="Enter part signature"
                            onChange={(e) => this.setState({ signature: e.target.value })} />
                    </Form.Group>
                </Col>
                <Col xs={12}>
                    <div className="text-center">
                        <Button variant="success" onClick={() => this.verifyPart()}>Verify</Button>
                    </div>
                </Col>
                <Col xs={12}>
                    { this.state.verified  &&
                        <div className="text-center" 
                        style={{paddingTop: "20px"}}>
                            <h4>Verification</h4>
                            <p>Valid: {JSON.stringify(this.state.valid)}</p>
                            <p>Manufacturer: {this.state.valid ? "Boeing" : ""} </p>
                        </div>
                    }
                </Col>
            </Row>
        )
    }
}

export default VerifyPart;
