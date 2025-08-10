# a11ops SDK Example

This is a comprehensive example project demonstrating how to use the @a11ops/sdk package, including alerting and log monitoring features.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Run the examples:

```bash
npm start              # Basic alerting example
npm run monitor        # System monitoring example
npm run log-monitoring # Comprehensive log monitoring example
npm run debug         # Run with debug output
```

## Authentication

The SDK handles authentication automatically with zero configuration:

### First Run (Development)

On your first run, the SDK will prompt you interactively:

```
🚀 Welcome to a11ops! Let's get you set up.

You'll need your API key from your workspace.
Get it at: https://a11ops.com/dashboard

Enter your API key: [paste your key here]

✅ Configuration saved! You're all set.
```

After this initial setup, your configuration is saved to `~/.a11ops/config.json` and you won't be prompted again.

### Production/CI Environment

Set the environment variable before running:

```bash
export A11OPS_API_KEY=your-api-key-here
npm start
```

### Getting Your API Key

1. Log in to [a11ops Dashboard](https://a11ops.com/dashboard)
2. Navigate to your workspace settings
3. Copy your API key from the "API Keys" section

## Available Examples

### `index.js` - Basic Alert Example

- Sends test alerts
- Demonstrates different severity levels (info, warning, error, critical)
- Shows the simple 2-line API

### `monitor.js` - System Monitoring Example

- Monitors CPU and memory usage
- Sends alerts when thresholds are exceeded
- Demonstrates real-world monitoring use case

### `log-monitoring.js` - Comprehensive Log Monitoring

- **E-commerce Application Simulation**

  - User authentication tracking
  - Shopping cart operations
  - Payment processing with error handling
  - Breadcrumb trails for debugging

- **System Health Monitoring**

  - CPU, memory, and disk usage tracking
  - Automatic alerts on resource thresholds
  - Continuous metrics collection

- **Error Scenario Testing**
  - Null reference errors
  - API timeouts
  - Stack overflow detection
  - Various error severity levels

The example will continue running to demonstrate continuous monitoring. Press `Ctrl+C` to stop.

## Production Use

In production, set the environment variable:

```bash
export A11OPS_API_KEY=your-api-key-here
npm start
```

## Environment Variables

- `A11OPS_API_KEY` - Your a11ops API key (required in production)
- `A11OPS_API_URL` - API endpoint (optional, defaults to https://api.a11ops.com)
- `NODE_ENV` - Environment name (development/staging/production)

## Dashboard

After running the examples, check your [a11ops dashboard](https://a11ops.com/dashboard) to see:

- All captured alerts and logs
- Error grouping and stack traces
- Breadcrumb trails for each error
- User context and metadata
- System metrics and trends

## Reset Configuration

To reset your local configuration and set up a new API key:

```bash
rm -rf ~/.a11ops
npm start  # Will prompt for new credentials
```

## Support

For more information, visit the [a11ops documentation](https://a11ops.com/docs) or contact ali@a11ops.com.
