import React, { Component } from 'react';
import {  Row, Col, Form } from 'react-bootstrap';
import { flureeFetch } from '../flureeFetch';
import ReactTable from 'react-table';
import 'react-table/react-table.css';

class PartByType extends Component {
    state = {
        partTypes: [],
        partInfo: null
    }

    componentDidMount(){
        let query = {
            "select": "?tag",
            "where": [
                ["?part", "part/type", "?type"],
                ["?type", "_tag/id", "?tag"]
            ]
        } 

        flureeFetch("query", query)
        .then(res => {
            let types = []
            res.map(type => types.push(type.slice(10)))
            this.setState({ partTypes: types})
        })
    }

    getPartInfo(part){
        if(part !== "Select Part Type"){
            let partInfo = []
            let query =  {
                "select": ["?serialNum", "?planeId", "(count ?repair)"],
                "where": [
                    ["?part", "part/type", "?tag"],
                    ["?tag", "_tag/id", `part/type:${part}`],
                    ["?plane", "plane/id", "?planeId"],
                    ["?plane", "plane/sections", "?section"],
                    ["?section", "section/parts", "?part"],
                    ["?part", "part/serialNumber", "?serialNum"],
                    ["?repair", "repair/part", "?part"]
                ]
            }

            flureeFetch("query", query)
            .then(res => {
                res.map(part => partInfo.push({
                    "serialNumber": part[0],
                    "planeId": part[1],
                    "numRepairs": part[2]
                }))

                this.setState({ partInfo: partInfo })
            })
        }
    }

  render(){
    const columns = [{ Header: "Serial Number", accessor: "serialNumber" },
    { Header: "Plane Id", accessor: "planeId" },
    { Header: "Number of Repairs", accessor: "numRepairs" }]

    return(
      <Row>
         <Col xs={12}>
              <div style={{margin: "20px"}}>
                <Form inline>
                    <Form.Group>
                        <Form.Label style={{ padding: "10px", fontSize: "20px"}}>See information about a part type</Form.Label>
                        <Form.Control as="select" onChange={(e) => this.getPartInfo(e.target.value)}>
                            <option>Select Part Type</option>
                            {
                                this.state.partTypes.map(type => <option>{type}</option>)
                            }
                            </Form.Control>
                    </Form.Group>
                </Form>
                </div>
          </Col>
          <Col xs={12}>
              { this.state.partInfo && 
              <ReactTable 
              data={this.state.partInfo} 
              columns={columns} 
              defaultPageSize={5}
              style={{overflow:'wrap'}}/>}
          </Col>
      </Row>
    )
  }
}

export default PartByType;
