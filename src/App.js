import React from 'react';
import './App.css';
import Autocomplete from '@material-ui/lab/Autocomplete';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, ButtonGroup, Alert, Container, Row, Col } from 'react-bootstrap';
import { Card, CardContent, Typography, TextField } from '@material-ui/core';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      alert: false,
      hasSelected: false,
      members: []
    }
  }


  onChange = e => {
    this.setState({
      hasSelected: true,
      congressionalbody: e.target.value,
      loading: true
    }, () => {
      let members = []
      const KEY = process.env.REACT_APP_API_KEY;
      const url = "https://api.propublica.org/congress/v1/116/" + this.state.congressionalbody + "/members.json";
      fetch(url, {
        method: "GET",
        headers: {
          "X-API-Key": KEY
        }
      })
        .then(res => res.json())
        .then((result) => {
          let list = result.results[0].members;
          list.forEach(member => {
            members.push({
              "name": member.first_name + " " + member.last_name,
              "id": member.id
            })
            this.setState({
              members: members,
              loading: false
            })
          })
        })
    });

    e.preventDefault();
  }

  onSubmit = e => {
    if (this.state.member == null) {
      this.setState({
        alert: true
      })
    }
    else {
      this.setState({
        alert: false
      })
      let roles = []
      const KEY = process.env.REACT_APP_API_KEY;
      const url = "https://api.propublica.org/congress/v1/members/" + this.state.member.id + ".json";
      fetch(url, {
        method: "GET",
        headers: {
          "X-API-Key": KEY
        }
      })
        .then(res => res.json())
        .then((result) => {
          console.log(result);
          let list = result.results[0].roles
          list.forEach(role => {
            roles.push({
              "congress": role.congress,
              "chamber": role.chamber,
              "votes": role.total_votes,
              "missed": role.missed_votes,
              "party_percent": role.votes_with_party_pct
            })
            this.setState({
              roles: roles
            })
          })
        })
    }
  }

  render() {
    let text = "please select a congressional body"
    if (this.state.hasSelected) {
      text = "Select a representative"
    }
    if (this.state.loading) {
      text = "loading..."
    }
    let mappedRoles = [];
    if (this.state.roles != null) {
      let roles = this.state.roles;
      mappedRoles = roles.map((role) =>
        <Card variant="outlined" style={
          {
            textAlign: "center",
            margin: "10px",
            display: "block",
          }
        }>
          <CardContent>
            <Typography variant="h4">
              Congress: {role.congress}
            </Typography>
            <hr></hr>
            <Typography variant="h5">
              Chamber: {role.chamber}
            </Typography>
            <hr></hr>
            <Typography>
              Total Votes: {role.votes}
            </Typography>
            <hr></hr>
            <Typography>
              Missed Votes: {role.missed}
            </Typography>
            <hr></hr>
            <Typography>
              Votes by Party Percent: {role.party_percent}
            </Typography>
          </CardContent>
        </Card>

      )
    }
    let memberName = "";
    if (this.state.member != null) {
      memberName = this.state.member.name
    }

    return (
      <div className="App" >
        <Container className="top">
          <Container fluid>
            <Row>
              <Col>
                <Alert variant="danger" onClose={() => { this.setState({ alert: false }) }} show={this.state.alert} dismissible>
                  <Alert.Heading>Sorry!</Alert.Heading>
                  <p>
                    You must select a valid representative before submitting.
                </p>
                </Alert>
              </Col>
            </Row>
          </Container>
          <Container className="d-flex justify-content-around">
            <Row>
              <Col xs={12} md={3}>
                <ButtonGroup>
                  <Button variant="outline-success" value="house" onClick={this.onChange}>House</Button>
                  <Button variant="outline-success" value="senate" onClick={this.onChange}>Senate</Button>
                </ButtonGroup>
              </Col>
              <Col xs={12} md={6}>
                <Autocomplete
                  disabled={!this.state.hasSelected || this.state.loading}
                  id="searchbar"
                  options={this.state.members}
                  getOptionLabel={(option) => option.name
                  }
                  style={{
                    width: 300,
                    backgroundColor: "white"
                  }}
                  renderInput={(params) => <TextField {...params}
                    label={text}
                    variant="outlined" />}
                  onChange={(event, value) => this.setState({
                    member: value
                  })}
                />
              </Col>
              <Col xs={12} md={3}>
                <Button variant="primary" onClick={this.onSubmit}>Submit</Button>
              </Col>
            </Row>
          </Container>
        </Container>
        <div className="name">
          <h4>
          {memberName}
          </h4>
        </div>
        <div>{mappedRoles}</div>
      </div >
    );
  }
}

export default App;
