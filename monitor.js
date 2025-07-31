// System monitoring example
import { a11ops } from '@a11ops/sdk';
import os from 'os';

console.log('🔍 Starting system monitor...\n');
console.log('Monitoring CPU and memory usage every 10 seconds');
console.log('Press Ctrl+C to stop\n');

// Monitor system resources
async function checkSystem() {
  // Get CPU usage
  const cpus = os.cpus();
  const cpuUsage = cpus.reduce((acc, cpu) => {
    const total = Object.values(cpu.times).reduce((a, b) => a + b);
    const idle = cpu.times.idle;
    return acc + ((total - idle) / total) * 100;
  }, 0) / cpus.length;
  
  // Get memory usage
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const memoryUsage = ((totalMem - freeMem) / totalMem) * 100;
  
  console.log(`📊 CPU: ${cpuUsage.toFixed(1)}% | Memory: ${memoryUsage.toFixed(1)}%`);
  
  // Alert if CPU is high
  if (cpuUsage > 80) {
    await a11ops.critical({
      title: "High CPU Usage Detected",
      message: `CPU usage is at ${cpuUsage.toFixed(1)}%`,
      metadata: {
        cpuUsage: cpuUsage.toFixed(1),
        cores: cpus.length,
        platform: os.platform(),
        hostname: os.hostname()
      }
    });
    console.log('  🚨 Critical alert sent - High CPU!');
  }
  
  // Alert if memory is high
  if (memoryUsage > 85) {
    await a11ops.warning({
      title: "High Memory Usage",
      message: `Memory usage is at ${memoryUsage.toFixed(1)}%`,
      metadata: {
        totalMemory: `${(totalMem / 1024 / 1024 / 1024).toFixed(2)} GB`,
        freeMemory: `${(freeMem / 1024 / 1024 / 1024).toFixed(2)} GB`,
        usedMemory: `${((totalMem - freeMem) / 1024 / 1024 / 1024).toFixed(2)} GB`,
        percentage: memoryUsage.toFixed(1)
      }
    });
    console.log('  ⚠️  Warning alert sent - High memory!');
  }
}

// Initial notification
await a11ops.info({
  title: "System Monitor Started",
  message: "Monitoring CPU and memory usage",
  metadata: {
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    totalMemory: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
    cpuCores: os.cpus().length
  }
});

// Run check immediately
await checkSystem();

// Then check every 10 seconds
const interval = setInterval(checkSystem, 10000);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n👋 Shutting down monitor...');
  clearInterval(interval);
  
  await a11ops.info("System Monitor Stopped", "Monitor shut down gracefully");
  
  process.exit(0);
});