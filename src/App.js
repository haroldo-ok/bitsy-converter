import React, { Component } from 'react';
import './App.css';
import './prism.css';

import { Grid, AppBar, Toolbar, Typography, Paper, Tabs, Tab } from '@material-ui/core';

import InfoIcon from '@material-ui/icons/Info';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';

import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-json';

import {parseWorld} from 'bitsy-parser';
import stringify from 'json-stringify-pretty-compact';

import {convertArduboy} from './platform/arduboy'

import exampleSource from './example.bitsy';

import ReactGA from 'react-ga';

ReactGA.initialize('UA-130174335-4');
ReactGA.pageview(window.location.pathname + window.location.search)

const convertJSON = code => stringify(parseWorld(code, {parseScripts: true}), {maxLength: 160});

class App extends Component {
  
  constructor(props) {
    super(props);
    
    this.state = {
      original: 'Loading, please wait...',
      converted: '',
      format: 'json'
    };
    
    this.handleCodeChange = this.handleCodeChange.bind(this);
    this.handleFormatChange = this.handleFormatChange.bind(this);
    
    fetch(exampleSource).then(async (data) => {
      const code = await data.text();
      this.handleCodeChange({ code });
    });
  }
  
  updateState({code, format}) {
    code = code || this.state.original;
    format = format || this.state.format;

    const converted = format === 'arduboy' ? convertArduboy(code) : convertJSON(code);
    
    this.setState({
      original: code,
      converted: converted,
      format,
    });
  }
  
  handleCodeChange({ code }) {
    this.updateState({ code });
  }
  
  handleFormatChange({ format }) {
    this.updateState({ format });
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
            <Paper>
      
              <Grid container direction="row" alignItems="center">
                <Grid item>
                  <InfoIcon /> 
                </Grid>
                <Grid item>
                  Paste your bitsy code here.
                </Grid>
                <Grid item>
                  <ArrowDownwardIcon />
                </Grid>
              </Grid>
      
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

            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper>
            
              <Grid container direction="row" alignItems="center">
                <Grid item>
                  <InfoIcon /> 
                </Grid>
                <Grid item>
                  The converted code will be generated here.
                </Grid>
                <Grid item>
                  <ArrowDownwardIcon />
                </Grid>
              </Grid>

              <Tabs value={this.state.format} onChange={ (event, format) => this.handleFormatChange({ format }) }>
                <Tab value="json" label="JSON" />
                <Tab value="arduboy" label="Arduboy (Work in progress)" />
              </Tabs>

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
                
            </Paper>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default App;
