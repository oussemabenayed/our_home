#!/usr/bin/env node

import { spawn, exec } from 'child_process';
import { networkInterfaces } from 'os';
import { writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __dirname = dirname(fileURLToPath(import.meta.url));

class DevServer {
  constructor() {
    this.processes = [];
    this.isRunning = false;
    this.localIP = this.getLocalIP();
    
    // Setup readline interface
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  getLocalIP() {
    const nets = networkInterfaces();
    const candidates = [];
    
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          // Prioritize common WiFi/LAN ranges
          if (net.address.startsWith('192.168.') || 
              net.address.startsWith('10.') || 
              net.address.startsWith('172.')) {
            candidates.push({ name, address: net.address, priority: 1 });
          } else {
            candidates.push({ name, address: net.address, priority: 2 });
          }
        }
      }
    }
    
    // Sort by priority (WiFi/LAN first)
    candidates.sort((a, b) => a.priority - b.priority);
    
    if (candidates.length > 0) {
      console.log('\n🔍 Available network interfaces:');
      candidates.forEach((c, i) => {
        const marker = i === 0 ? '✅' : '  ';
        console.log(`${marker} ${c.name}: ${c.address}`);
      });
      console.log('');
      return candidates[0].address;
    }
    
    return 'localhost';
  }

  createEnvFile() {
    const envContent = `VITE_API_BASE_URL=http://${this.localIP}:4000`;
    const envPath = join(__dirname, 'frontend', '.env.local');
    writeFileSync(envPath, envContent);
    console.log(`✅ Created .env.local with IP: ${this.localIP}`);
  }

  showBanner() {
    console.clear();
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    🏠 BuildEstate Dev Server                 ║
║                      Command Center                          ║
╚══════════════════════════════════════════════════════════════╝

📱 Selected IP: ${this.localIP}
🌐 Frontend URL: http://${this.localIP}:5173
🔧 Backend URL:  http://${this.localIP}:4000
📱 Admin Panel:  http://${this.localIP}:5174

Status: ${this.isRunning ? '🟢 RUNNING' : '🔴 STOPPED'}
`);
  }

  showMenu() {
    console.log(`
┌─────────────────────────────────────────────────────────────┐
│                        OPTIONS                              │
├─────────────────────────────────────────────────────────────┤
│  1. 🚀 Start All Servers                                    │
│  2. 🛑 Stop All Servers                                     │
│  3. 📱 Show Mobile URLs                                     │
│  4. 🔄 Restart Servers                                      │
│  5. 📊 Show Server Status                                   │
│  6. 🌐 Update IP Address                                    │
│  7. 🌍 Create Public Tunnel (ngrok)                        │
│  8. ❌ Exit                                                 │
└─────────────────────────────────────────────────────────────┘
`);
  }

  async killPortProcesses() {
    const ports = [4000, 5173, 5174];
    console.log('🔍 Checking for existing processes...');
    
    for (const port of ports) {
      try {
        await new Promise((resolve, reject) => {
          exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
            if (stdout) {
              const lines = stdout.split('\n');
              lines.forEach(line => {
                const match = line.match(/\s+(\d+)\s*$/);
                if (match) {
                  const pid = match[1];
                  exec(`taskkill /F /PID ${pid}`, () => {
                    console.log(`✅ Killed process on port ${port} (PID: ${pid})`);
                  });
                }
              });
            }
            resolve();
          });
        });
      } catch (error) {
        // Ignore errors, port might not be in use
      }
    }
    
    // Wait a moment for processes to be killed
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  async startServers() {
    if (this.isRunning) {
      console.log('⚠️  Servers are already running!');
      return;
    }

    console.log('🚀 Starting servers...\n');
    
    // Kill existing processes on ports
    await this.killPortProcesses();
    
    // Update environment file
    this.createEnvFile();

    // Start Backend
    console.log('📡 Starting Backend Server...');
    const backend = spawn('npm', ['run', 'dev'], {
      cwd: join(__dirname, 'backend'),
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true
    });

    // Start Frontend
    console.log('🎨 Starting Frontend Server...');
    const frontend = spawn('npm', ['run', 'dev'], {
      cwd: join(__dirname, 'frontend'),
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true
    });

    // Start Admin Panel
    console.log('👩‍💼 Starting Admin Panel...');
    const admin = spawn('npm', ['run', 'dev'], {
      cwd: join(__dirname, 'admin'),
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true
    });

    this.processes = [
      { name: 'Backend', process: backend, port: 4000 },
      { name: 'Frontend', process: frontend, port: 5173 },
      { name: 'Admin', process: admin, port: 5174 }
    ];

    // Handle process outputs
    this.processes.forEach(({ name, process }) => {
      process.stdout.on('data', (data) => {
        console.log(`[${name}] ${data.toString().trim()}`);
      });
      
      process.stderr.on('data', (data) => {
        console.log(`[${name} ERROR] ${data.toString().trim()}`);
      });
    });

    this.isRunning = true;
    
    setTimeout(() => {
      console.log('\n✅ All servers started successfully!');
      this.showMobileURLs();
    }, 3000);
  }

  stopServers() {
    if (!this.isRunning) {
      console.log('⚠️  No servers are running!');
      return;
    }

    console.log('🛑 Stopping all servers...');
    
    this.processes.forEach(({ name, process }) => {
      try {
        process.kill('SIGTERM');
        console.log(`✅ Stopped ${name}`);
      } catch (error) {
        console.log(`❌ Error stopping ${name}: ${error.message}`);
      }
    });

    this.processes = [];
    this.isRunning = false;
    console.log('✅ All servers stopped!');
  }

  showMobileURLs() {
    console.log(`
┌─────────────────────────────────────────────────────────────┐
│                    📱 MOBILE ACCESS URLS                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🌐 Website:     http://${this.localIP}:5173                │
│  👩‍💼 Admin:       http://${this.localIP}:5174                │
│  🔧 API:         http://${this.localIP}:4000                │
│                                                             │
│  📱 Scan QR codes in terminal or type URLs in phone        │
│  🔗 Make sure phone is on same WiFi network                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
`);
  }

  showStatus() {
    console.log(`
┌─────────────────────────────────────────────────────────────┐
│                      SERVER STATUS                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Overall Status: ${this.isRunning ? '🟢 RUNNING' : '🔴 STOPPED'}                           │
│  Local IP: ${this.localIP}                                  │
│  Active Processes: ${this.processes.length}                                │
│                                                             │
${this.processes.map(p => `│  • ${p.name}: Port ${p.port}                                    │`).join('\n')}
│                                                             │
└─────────────────────────────────────────────────────────────┘
`);
  }

  updateIP() {
    this.localIP = this.getLocalIP();
    if (this.isRunning) {
      this.createEnvFile();
      console.log('🔄 IP updated! Restart servers to apply changes.');
    } else {
      console.log(`✅ IP updated to: ${this.localIP}`);
    }
  }

  createTunnel() {
    console.log('🌍 Creating public tunnel with ngrok...');
    console.log('📱 This will give you a public URL for mobile testing');
    
    const tunnel = spawn('node', ['tunnel-server.js'], {
      cwd: __dirname,
      stdio: 'inherit'
    });
    
    console.log('ℹ️ Press Ctrl+C to stop the tunnel');
  }

  async restartServers() {
    console.log('🔄 Restarting servers...');
    this.stopServers();
    await this.killPortProcesses();
    setTimeout(() => {
      this.startServers();
    }, 2000);
  }

  async promptUser() {
    return new Promise((resolve) => {
      this.rl.question('Choose an option (1-8): ', (answer) => {
        resolve(answer.trim());
      });
    });
  }

  async run() {
    while (true) {
      this.showBanner();
      this.showMenu();
      
      const choice = await this.promptUser();
      
      switch (choice) {
        case '1':
          await this.startServers();
          break;
        case '2':
          this.stopServers();
          break;
        case '3':
          this.showMobileURLs();
          break;
        case '4':
          await this.restartServers();
          break;
        case '5':
          this.showStatus();
          break;
        case '6':
          this.updateIP();
          break;
        case '7':
          this.createTunnel();
          break;
        case '8':
          this.stopServers();
          console.log('👋 Goodbye!');
          this.rl.close();
          process.exit(0);
          break;
        default:
          console.log('❌ Invalid option. Please choose 1-8.');
      }
      
      // Wait for user to press enter before showing menu again
      await new Promise(resolve => {
        this.rl.question('\nPress Enter to continue...', resolve);
      });
    }
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  process.exit(0);
});

// Start the dev server
const devServer = new DevServer();
devServer.run().catch(console.error);