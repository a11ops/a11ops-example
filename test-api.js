// Direct API test without SDK
import axios from 'axios';

const API_KEY = '6615babe53d7ba48f4ba6a84af1de014';
const API_URL = 'https://api.a11ops.com';

console.log('🔍 Testing direct API connection...\n');

async function testHealth() {
  try {
    console.log('1. Testing health endpoint...');
    const response = await axios.get(`${API_URL}/health`);
    console.log('✅ Health check:', response.data);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    if (error.code === 'ENOTFOUND') {
      console.error('   DNS lookup failed - api.a11ops.com cannot be resolved');
    }
  }
}

async function testAlert() {
  try {
    console.log('\n2. Testing alert endpoint...');
    const response = await axios.post(
      `${API_URL}/alerts/${API_KEY}`,
      {
        title: "Direct API Test",
        message: "Testing without SDK",
        severity: "info",
        timestamp: new Date().toISOString()
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'a11ops-test'
        }
      }
    );
    console.log('✅ Alert sent:', response.data);
  } catch (error) {
    console.error('❌ Alert failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

async function checkDNS() {
  console.log('\n3. Checking DNS resolution...');
  try {
    const dns = await import('dns').then(m => m.promises);
    const addresses = await dns.resolve4('api.a11ops.com');
    console.log('✅ DNS resolved to:', addresses);
  } catch (error) {
    console.error('❌ DNS resolution failed:', error.message);
  }
}

// Run all tests
await checkDNS();
await testHealth();
await testAlert();