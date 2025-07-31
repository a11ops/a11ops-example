// Debug script to test API connectivity
import { a11ops } from '@a11ops/sdk';

console.log('🔍 Debugging a11ops SDK connection...\n');

// The SDK will use the saved configuration from ~/.a11ops/config.json
console.log('Testing basic alert...');

try {
  const result = await a11ops.alert({
    title: "Debug Test Alert",
    message: "Testing API connectivity",
    priority: "info",
    workspace: "development"
  });
  
  console.log('✅ Success! Alert sent:', result);
} catch (error) {
  console.error('❌ Error details:');
  console.error('Message:', error.message);
  console.error('Code:', error.code);
  
  if (error.response) {
    console.error('Response status:', error.response.status);
    console.error('Response data:', error.response.data);
  } else if (error.request) {
    console.error('No response received - possible causes:');
    console.error('- API server is not running at https://api.a11ops.com');
    console.error('- Network/firewall blocking the connection');
    console.error('- DNS resolution issues');
  }
  
  // Check if we should use a local API instead
  console.log('\n💡 Tip: If you\'re running a local API server, set the environment variable:');
  console.log('export A11OPS_API_URL=http://localhost:8787');
  console.log('or');
  console.log('export A11OPS_API_URL=https://your-api-endpoint.com');
}