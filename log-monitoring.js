/**
 * Log Monitoring Example for a11ops
 * 
 * This example demonstrates comprehensive log monitoring capabilities
 * including error tracking, breadcrumbs, user context, and automatic capture.
 */

import { a11ops } from '@a11ops/sdk';
import A11ops from '@a11ops/sdk';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import os from 'os';
import readline from 'readline';

// Function to get API key (check env, config file, or prompt)
async function getApiKey() {
  // Check environment variable first
  if (process.env.A11OPS_API_KEY) {
    return process.env.A11OPS_API_KEY;
  }
  
  // Check config file
  const configPath = path.join(os.homedir(), '.a11ops', 'config.json');
  try {
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      if (config.apiKey) {
        return config.apiKey;
      }
    }
  } catch (error) {
    // Config not found or invalid
  }
  
  // Prompt for API key
  console.log('\n🚀 Welcome to a11ops! Let\'s get you set up.\n');
  console.log('You\'ll need your API key from your workspace.');
  console.log('Get it at: https://a11ops.com/dashboard\n');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve, reject) => {
    rl.question('Enter your API key: ', (apiKey) => {
      rl.close();
      
      if (!apiKey) {
        reject(new Error('API key is required'));
        return;
      }
      
      apiKey = apiKey.trim();
      
      // Save for future use
      const configDir = path.dirname(configPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      
      fs.writeFileSync(configPath, JSON.stringify({
        apiKey,
        createdAt: new Date().toISOString()
      }, null, 2));
      
      console.log('\n✅ Configuration saved! You\'re all set.\n');
      resolve(apiKey);
    });
  });
}

// Initialize logClient as null, will be set up in main function
let logClient = null;

// ============================================
// 1. Simulated E-commerce Application Example
// ============================================

class EcommerceApp {
  constructor() {
    // Set up user context
    this.currentUser = null;
    this.cart = [];
    this.sessionId = this.generateSessionId();
    
    // Configure log monitoring context
    logClient.logs.setContext('session', {
      id: this.sessionId,
      started: new Date().toISOString()
    });
  }

  generateSessionId() {
    return 'sess_' + Math.random().toString(36).substr(2, 9);
  }

  // User authentication
  async login(email, password) {
    try {
      logClient.logs.addBreadcrumb({
        type: 'user',
        category: 'auth',
        message: 'User login attempt',
        level: 'info',
        data: { email }
      });

      // Simulate API call
      const user = await this.mockApiCall('/api/auth/login', { email, password });
      
      this.currentUser = user;
      
      // Update user context for log monitoring
      logClient.logs.setUser({
        id: user.id,
        email: user.email,
        username: user.username,
        plan: user.subscription
      });

      // Log successful login
      await a11ops.info({
        title: 'User Login Success',
        message: `User ${user.email} logged in successfully`,
        userId: user.id
      });

      logClient.logs.addBreadcrumb({
        type: 'user',
        category: 'auth',
        message: 'Login successful',
        level: 'info'
      });

      return user;
    } catch (error) {
      // This will be captured automatically
      logClient.logs.captureError(error, {
        level: 'warning',
        extra: {
          email,
          loginAttempt: true
        }
      });
      throw error;
    }
  }

  // Add item to cart
  async addToCart(productId, quantity = 1) {
    try {
      logClient.logs.addBreadcrumb({
        type: 'user',
        category: 'cart',
        message: 'Adding item to cart',
        data: { productId, quantity }
      });

      // Simulate fetching product details
      const product = await this.mockApiCall(`/api/products/${productId}`);
      
      if (!product) {
        throw new Error(`Product ${productId} not found`);
      }

      if (product.stock < quantity) {
        // Log inventory issue
        logClient.logs.captureMessage('Insufficient stock for product', 'warning', {
          extra: {
            productId,
            requested: quantity,
            available: product.stock
          }
        });
        throw new Error('Insufficient stock');
      }

      this.cart.push({
        productId,
        name: product.name,
        price: product.price,
        quantity
      });

      logClient.logs.addBreadcrumb({
        type: 'user',
        category: 'cart',
        message: 'Item added to cart',
        data: {
          productId,
          cartSize: this.cart.length,
          cartValue: this.calculateCartTotal()
        }
      });

      return this.cart;
    } catch (error) {
      logClient.logs.captureError(error, {
        level: 'error',
        fingerprint: ['cart', 'add-item'],
        extra: {
          productId,
          quantity,
          userId: this.currentUser?.id
        }
      });
      throw error;
    }
  }

  // Process checkout
  async checkout(paymentInfo) {
    const orderId = 'ORD-' + Date.now();
    
    try {
      logClient.logs.addBreadcrumb({
        type: 'transaction',
        category: 'checkout',
        message: 'Starting checkout process',
        data: {
          orderId,
          items: this.cart.length,
          total: this.calculateCartTotal()
        }
      });

      // Validate cart
      if (this.cart.length === 0) {
        throw new Error('Cart is empty');
      }

      // Process payment
      logClient.logs.addBreadcrumb({
        type: 'transaction',
        category: 'payment',
        message: 'Processing payment',
        data: {
          orderId,
          method: paymentInfo.method,
          amount: this.calculateCartTotal()
        }
      });

      const payment = await this.processPayment(paymentInfo);

      // Create order
      const order = await this.createOrder(orderId, payment.transactionId);

      // Log successful order
      await a11ops.info({
        title: 'Order Completed',
        message: `Order ${orderId} successfully completed`,
        orderId,
        userId: this.currentUser?.id,
        amount: this.calculateCartTotal(),
        items: this.cart.length
      });

      // Clear cart
      this.cart = [];

      return order;
    } catch (error) {
      // Capture critical payment errors
      logClient.logs.captureError(error, {
        level: 'critical',
        fingerprint: ['checkout', 'payment-failed'],
        extra: {
          orderId,
          userId: this.currentUser?.id,
          cartValue: this.calculateCartTotal(),
          paymentMethod: paymentInfo.method,
          stage: error.stage || 'unknown'
        }
      });

      // Also send critical alert
      await a11ops.critical({
        title: 'Checkout Failed',
        message: `Order ${orderId} failed: ${error.message}`,
        orderId,
        userId: this.currentUser?.id,
        error: error.message
      });

      throw error;
    }
  }

  async processPayment(paymentInfo) {
    // Simulate payment processing
    if (Math.random() > 0.9) {
      const error = new Error('Payment gateway timeout');
      error.stage = 'payment_processing';
      throw error;
    }

    return {
      transactionId: 'TXN-' + Date.now(),
      status: 'completed'
    };
  }

  async createOrder(orderId, transactionId) {
    return {
      orderId,
      transactionId,
      items: this.cart,
      total: this.calculateCartTotal(),
      createdAt: new Date().toISOString()
    };
  }

  calculateCartTotal() {
    return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  async mockApiCall(endpoint, data = null) {
    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 100));

    // Mock responses
    if (endpoint === '/api/auth/login') {
      return {
        id: 'user-123',
        email: data.email,
        username: 'johndoe',
        subscription: 'premium'
      };
    }

    if (endpoint.startsWith('/api/products/')) {
      return {
        id: endpoint.split('/').pop(),
        name: 'Sample Product',
        price: 29.99,
        stock: 10
      };
    }

    throw new Error('Unknown endpoint');
  }
}

// ============================================
// 2. Monitoring System Health
// ============================================

class SystemMonitor {
  constructor() {
    this.metrics = {
      cpu: 0,
      memory: 0,
      diskSpace: 0,
      activeConnections: 0
    };
  }

  async startMonitoring() {
    console.log('📊 Starting system monitoring...\n');

    // Check system health every 30 seconds
    setInterval(() => this.checkHealth(), 30000);

    // Simulate metric collection every 5 seconds
    setInterval(() => this.collectMetrics(), 5000);
  }

  collectMetrics() {
    // Simulate metric collection
    this.metrics = {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      diskSpace: Math.random() * 100,
      activeConnections: Math.floor(Math.random() * 1000)
    };

    // Add metrics as breadcrumbs
    logClient.logs.addBreadcrumb({
      type: 'system',
      category: 'metrics',
      message: 'System metrics collected',
      data: this.metrics
    });
  }

  async checkHealth() {
    const issues = [];

    // Check CPU
    if (this.metrics.cpu > 90) {
      issues.push({ type: 'cpu', value: this.metrics.cpu });
      logClient.logs.captureMessage('High CPU usage detected', 'error', {
        extra: { cpu: this.metrics.cpu }
      });
    }

    // Check Memory
    if (this.metrics.memory > 85) {
      issues.push({ type: 'memory', value: this.metrics.memory });
      logClient.logs.captureMessage('High memory usage detected', 'warning', {
        extra: { memory: this.metrics.memory }
      });
    }

    // Check Disk Space
    if (this.metrics.diskSpace > 80) {
      issues.push({ type: 'disk', value: this.metrics.diskSpace });
      logClient.logs.captureMessage('Low disk space', 'warning', {
        extra: { diskUsage: this.metrics.diskSpace }
      });
    }

    // Send alert if critical issues
    if (issues.length > 0 && issues.some(i => i.value > 95)) {
      await a11ops.critical({
        title: 'System Resources Critical',
        message: 'Multiple system resources are at critical levels',
        issues,
        metrics: this.metrics
      });
    }
  }
}

// ============================================
// 3. Error Scenarios for Testing
// ============================================

async function demonstrateErrorScenarios() {
  console.log('🔴 Demonstrating various error scenarios...\n');

  // Scenario 1: Null reference error
  try {
    const data = null;
    console.log(data.property); // This will throw
  } catch (error) {
    logClient.logs.captureError(error, {
      level: 'error',
      extra: { scenario: 'null_reference' }
    });
    console.log('  ✓ Captured null reference error');
  }

  // Scenario 2: API timeout
  try {
    await axios.get('https://httpstat.us/524', { timeout: 1000 });
  } catch (error) {
    logClient.logs.captureError(error, {
      level: 'warning',
      extra: { 
        scenario: 'api_timeout',
        endpoint: 'httpstat.us'
      }
    });
    console.log('  ✓ Captured API timeout');
  }

  // Scenario 3: Division by zero
  try {
    const result = 10 / 0;
    if (!isFinite(result)) {
      throw new Error('Division by zero resulted in Infinity');
    }
  } catch (error) {
    logClient.logs.captureError(error, {
      level: 'warning',
      extra: { scenario: 'division_by_zero' }
    });
    console.log('  ✓ Captured division by zero');
  }

  // Scenario 4: Stack overflow simulation
  function recursiveFunction(depth = 0) {
    if (depth > 1000) {
      throw new Error('Stack depth exceeded safe limit');
    }
    return recursiveFunction(depth + 1);
  }

  try {
    recursiveFunction();
  } catch (error) {
    logClient.logs.captureError(error, {
      level: 'critical',
      extra: { scenario: 'stack_overflow' }
    });
    console.log('  ✓ Captured stack overflow');
  }

  console.log('\n');
}

// ============================================
// 4. Main Example Runner
// ============================================

async function runExamples() {
  // Initialize the log client with API key
  const apiKey = await getApiKey();
  logClient = new A11ops(apiKey, {
    baseUrl: process.env.A11OPS_API_URL || 'https://api.a11ops.com',
    logMonitoring: true,
    environment: process.env.NODE_ENV || 'development',
    release: process.env.npm_package_version || '1.0.0',
    autoCaptureErrors: true,
    autoBreadcrumbs: true
  });
  
  console.log('🚀 a11ops Log Monitoring Example\n');
  console.log('==================================\n');

  // 1. E-commerce simulation
  console.log('🛒 Simulating e-commerce application...\n');
  const app = new EcommerceApp();

  try {
    // User login
    console.log('  • User logging in...');
    await app.login('user@example.com', 'password123');

    // Add items to cart
    console.log('  • Adding items to cart...');
    await app.addToCart('PROD-001', 2);
    await app.addToCart('PROD-002', 1);

    // Attempt checkout
    console.log('  • Processing checkout...');
    await app.checkout({
      method: 'credit_card',
      cardNumber: '4111111111111111',
      cvv: '123'
    });

    console.log('  ✓ E-commerce flow completed\n');
  } catch (error) {
    console.log(`  ✗ E-commerce flow failed: ${error.message}\n`);
  }

  // 2. System monitoring
  const monitor = new SystemMonitor();
  await monitor.startMonitoring();

  // 3. Error scenarios
  await demonstrateErrorScenarios();

  // 4. Manual log entries
  console.log('📝 Sending manual log entries...\n');

  // Different severity levels
  await a11ops.info({
    title: 'Application Started',
    message: 'Log monitoring example application started successfully',
    version: '1.0.0'
  });

  logClient.logs.captureMessage('Configuration loaded successfully', 'debug', {
    extra: {
      configFile: 'config.json',
      environment: 'development'
    }
  });

  logClient.logs.captureMessage('Cache warming completed', 'info', {
    extra: {
      entries: 150,
      duration: 2340
    }
  });

  console.log('✅ All examples completed!\n');
  console.log('📊 Check your a11ops dashboard to see:');
  console.log('   • Captured errors and logs');
  console.log('   • Breadcrumb trails');
  console.log('   • User context');
  console.log('   • System metrics');
  console.log('\nThe monitoring will continue running...');
  console.log('Press Ctrl+C to stop.\n');
}

// Handle unhandled errors (these will be automatically captured)
process.on('unhandledRejection', (reason, promise) => {
  console.error('📛 Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('📛 Uncaught Exception:', error);
  process.exit(1);
});

// Run the examples
if (import.meta.url === `file://${process.argv[1]}`) {
  runExamples().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { EcommerceApp, SystemMonitor, logClient };