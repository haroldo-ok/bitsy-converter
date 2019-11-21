import React, { Component } from 'react';
import './App.css';

import { Grid, TextField } from '@material-ui/core';

import {parseWorld} from 'bitsy-parser';
import stringify from 'json-stringify-pretty-compact';

class App extends Component {
  
  constructor(props) {
    super(props);
    
    this.state = {
      original: 'This is another test',
      converted: ''
    };
    
    this.handleChange = this.handleChange.bind(this);
  }
  
  handleChange(event) {
    this.setState({
      original: event.target.value,
      converted: stringify(parseWorld(event.target.value), {maxLength: 160})
    });
  }
  
  render() {
    return (
      <div className="App">
        <Grid container spacing={3}  style={{ margin: 0, width: '100%' }}>
          <Grid item xs={6}>
            <TextField value={this.state.original} onChange={this.handleChange} multiline
              helperText="Past your bitsy script here" />
          </Grid>
          <Grid item xs={6}>
            <TextField value={this.state.converted} multiline readOnly
              helperText="The converted JSON will be placed here." />
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default App;
