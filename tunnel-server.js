#!/usr/bin/env node

import { spawn } from 'child_process';
import { networkInterfaces } from 'os';

class TunnelServer {
  constructor() {
    this.localIP = this.getLocalIP();
  }

  getLocalIP() {
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          return net.address;
        }
      }
    }
    return 'localhost';
  }

  async startTunnel() {
    console.log('🌐 Starting tunnel setup...');
    
    console.log('\n📋 Manual Setup Instructions:');
    console.log('1. Download ngrok: https://ngrok.com/download');
    console.log('2. Extract ngrok.exe to your project folder');
    console.log('3. Run: ngrok.exe http 5173');
    console.log('4. Copy the https URL shown');
    console.log('5. Use that URL on your phone\n');
    
    console.log('🔄 Alternative - Try Windows Firewall Fix:');
    console.log('Run as Administrator:');
    console.log('netsh advfirewall firewall add rule name="NodeJS" dir=in action=allow protocol=TCP localport=4000,5173,5174');
    
    console.log('\n📱 Or use Mobile Hotspot method:');
    console.log('1. Enable mobile hotspot on phone');
    console.log('2. Connect computer to phone hotspot');
    console.log('3. Restart dev server');
    console.log(`4. Access: http://${this.localIP}:5173`);
  }


}

const tunnel = new TunnelServer();
tunnel.startTunnel();