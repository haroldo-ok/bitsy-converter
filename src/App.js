import React, { Component } from 'react';
import './App.css';
import './prism.css';

import { Grid, AppBar, Toolbar, Typography } from '@material-ui/core';

import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-json';

import {parseWorld} from 'bitsy-parser';
import stringify from 'json-stringify-pretty-compact';

import ReactGA from 'react-ga';

ReactGA.initialize('UA-130174335-4');
ReactGA.pageview(window.location.pathname + window.location.search)

class App extends Component {
  
  constructor(props) {
    super(props);
    
    this.state = {
      original: 'This is another test',
      converted: ''
    };
    
    this.handleCodeChange = this.handleCodeChange.bind(this);
  }
  
  handleCodeChange({ code }) {
    this.setState({
      original: code,
      converted: stringify(parseWorld(code), {maxLength: 160})
    });
  }
  
  render() {
    return (
      <div className="App">
      
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">
            Bitsy Converter
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Grid container spacing={3}  style={{ margin: 0, width: '100%' }}>
          <Grid item xs={6}>
      
            <Editor
              value={this.state.original}
              onValueChange={code => this.handleCodeChange({ code })}
              highlight={code => highlight(code, languages.clike)}
              padding={10}
              style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 12,
              }}
            />

          </Grid>
          <Grid item xs={6}>
            
            <Editor
              value={this.state.converted}
              onValueChange={code => this.handleCodeChange({ code })}
              highlight={code => highlight(code, languages.json)}
              padding={10}
              style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 12,
              }}
            />
                
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default App;
