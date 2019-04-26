import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {


  onDiscover(){
    try {

    let tokenservice=null;

    navigator.bluetooth.requestDevice({
      acceptAllDevices:true
    }).then(device => device.gatt.connect())
    .then(server => server.getPrimaryService('heart_rate'))
    .then(service => {tokenservice = service;
      return Promise.all([
        service.getCharacteristic('body_sensor_location')
          .then(handleTokenCharacteristic)
      ]);
    });

    } catch (error) {
      alert(error);
    }
  }




render(){
  return (
    <div className="App">
        <div><h1>BlueTooth Device</h1></div>
        <div>
          <input type='button' value='Discover Device' onClick={this.onDiscover}></input>
        </div>
    </div>
  );
}}


function handleTokenCharacteristic(characteristic){
  if (characteristic === null) {
    console.log("Unknown sensor location.");
    return Promise.resolve();
  }

  console.log(characteristic);
  return Promise.resolve();
}

export default App;
