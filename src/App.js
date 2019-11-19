import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

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
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <textarea value={this.state.original} onChange={this.handleChange} />
        <textarea value={this.state.converted} readOnly />
      </div>
    );
  }
}

export default App;
