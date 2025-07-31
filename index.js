// Simple example - Send a test alert
import { a11ops } from '@a11ops/sdk';

console.log('📢 Sending a test alert to a11ops...\n');

try {
  // This is all you need - 2 lines of code!
  await a11ops.alert({
    title: "Test Alert from Example Project",
    message: "This is a test alert to verify the SDK is working correctly",
    priority: "info",
    workspace: "development"
  });
  
  console.log('✅ Alert sent successfully!\n');
  
  // Try different severity levels
  console.log('📊 Sending alerts with different priorities...\n');
  
  await a11ops.info("Application started", "Example app is running");
  console.log('  ✓ Info alert sent');
  
  await a11ops.warning("High memory usage", "Memory usage at 75%");
  console.log('  ✓ Warning alert sent');
  
  await a11ops.error("Failed to connect to database", "Connection timeout after 30s");
  console.log('  ✓ Error alert sent');
  
  await a11ops.critical("System is down!", "Complete service failure detected");
  console.log('  ✓ Critical alert sent');
  
  console.log('\n🎉 All alerts sent successfully!');
  
} catch (error) {
  console.error('❌ Failed to send alert:', error.message);
  process.exit(1);
}