import React from 'react';
import './App.css';

let service =undefined;
let characteristicToken=undefined;
let device=undefined;
let server=undefined;

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      deviceName: undefined,
      connected:false,
      token:undefined,
      error:'',
      processing:false
    };

    this.OnFindToken = this.OnFindToken.bind(this);
    this.onDiscover = this.onDiscover.bind(this);
    this.OnDisconnect = this.OnDisconnect.bind(this);
  }


async OnDisconnect(){

  if(!device)
    return;

    device.gatt.disconnect()
}

async OnFindToken(){
  try {
    console.log('----------------- starting ------------------')

    this.setState({error:'',processing:true});

    if(!device) {
      console.log('discovering device...')
      device = await navigator.bluetooth.requestDevice({
        filters: [ 
            { name: 'E_TOKEN_15' } 
        ],
        optionalServices: [ 0xfff0 ]
      });

      if(device)
        console.log('found device with name: ' + device.name)

      device.addEventListener('gattserverdisconnected',event => {
        let d = event.target;
        this.setState({connected: false });

        console.log('Device ' + d.name + ' is disconnected.');

        service=undefined;
        characteristicToken=undefined;
        server=undefined;
        device=undefined;
      });
    }

    if(!device.gatt.connected){
      console.log('connecting to device ...')
      server = await device.gatt.connect();
    }
    
    if(device.gatt.connected)
      console.log('Connection Status: Connected')
    else
      console.log('Connection Status: Not-Connected')

    this.setState({connected: device.gatt.connected });

    if(!service) {
      console.log('getting service ...')
      if(!device.gatt.connected){
        console.log('connecting to device ...')
        server = await device.gatt.connect();
      }
      service = await server.getPrimaryService(0xfff0);
    }

    if(!characteristicToken) {
      console.log('getting service Characteristic ...')
      characteristicToken = await service.getCharacteristic(0xfff1);

        // characteristicToken.addEventListener('characteristicvaluechanged', e => {
        //     try {
        //         console.log('notified value:')
        //         console.log(e.target.value)
        //         let decoder = new TextDecoder('utf-8');
        //         let token=decoder.decode(e.target.value.buffer);
        //         console.log(token);

        //         this.setState({
        //           token: token
        //         });
        //       } 
        //       catch (error) {
        //         alert("err:"+ error);
        //       }
        //   });
    }

    console.log('reading Characteristic value ...')
    const value = await characteristicToken.readValue();
    console.log(value)

    const decoder = new TextDecoder('utf-8');
    const token=decoder.decode(value.buffer);

    console.log('decoded token value')
    console.log(token);
    this.setState({token: token,processing:false});

    //await characteristicToken.startNotifications();

    console.log('----------------- end ------------------')
  } 
  catch (error) {
    this.setState({error:'Error: '+ error,processing:false});
    console.log('some error: '+error)
  }
}



onDiscover(){
    console.log('Requesting any Bluetooth Device...');
    navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['0000fff0-0000-1000-8000-00805f9b34fb']})
    .then(device => {
      console.log('Connecting to GATT Server...');
      return device.gatt.connect();
    })
    .then(server => {
      console.log('Getting Services...');
      return server.getPrimaryServices();
    })
    .then(services => {
      console.log('Getting Characteristics...');
      let queue = Promise.resolve();
      services.forEach(service => {
        queue = queue.then(_ => service.getCharacteristics().then(characteristics => {
          console.log('> Service: ' + service.uuid);
          characteristics.forEach(characteristic => {
            console.log('>> Characteristic: ' + characteristic.uuid + ' ' +
                getSupportedProperties(characteristic));
          });
        }));
      });
      return queue;
    })
    .catch(error => {
      console.log('Error! ' + error);
    });
  }




render(){
  let status= this.state.connected? 'Connected':'Not Connected'

  return (
    <div className="App">
        <div><h1>BlueTooth Device Demo</h1></div>
        <div>
          {/* <input style={{margin:10}} type='button' value='Discover Device' onClick={this.onDiscover}></input> */}
          <input className='button-css' style={{margin:10}} type='button' value='Get Token' onClick={this.OnFindToken}></input>
          
        </div>
        <div>
          <div className='status-div'><b>Device Status:</b>
            <span style={{margin:10}} className={applyStyle(this.state.connected)}>{status}</span>
            <input  className={hideShowStyle('',this.state.connected)} style={{margin:10}} type='button' value='Disconnect' onClick={this.OnDisconnect}></input>
          </div>
          <br/>
          <br/>
          <div className='wrapper'>
            <div className={hideShowStyle('loader',this.state.processing)}></div>
              <h2 className={hideShowStyle('',!this.state.processing)}>
                <span style={{margin:10}}>  {this.state.token? this.state.token:''}</span>
              </h2>
          </div>
          <br/>
          <br/>
          <div className='error'>{this.state.error}</div>
        </div>
    </div>
  );
}}


function getSupportedProperties(characteristic) {
  let supportedProperties = [];
  for (const p in characteristic.properties) {
    if (characteristic.properties[p] === true) {
      supportedProperties.push(p.toUpperCase());
    }
  }
  return '[' + supportedProperties.join(', ') + ']';
}

const applyStyle=(connected)=>{
  return connected? 'connected': 'not-connected'
}

const hideShowStyle=(defaultStyle, show)=>{
  return show? defaultStyle+' show': defaultStyle+' hide'
}

export default App;
