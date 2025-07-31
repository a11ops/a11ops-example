# a11ops SDK Example

This is a simple example project showing how to use the @a11ops/sdk package.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run the example:
```bash
npm start
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

## What it does

### `index.js` - Basic Alert Example
- Sends a test alert
- Demonstrates different severity levels (info, warning, error, critical)
- Shows the simple 2-line API

### `monitor.js` - System Monitoring Example
- Monitors CPU and memory usage
- Sends alerts when thresholds are exceeded
- Demonstrates real-world monitoring use case

## First Run

On the first run, if you haven't set up your API key, the SDK will prompt you:

```
🚀 Welcome to a11ops! Let's get you set up.

You'll need your API key from your workspace.
Get it at: https://a11ops.com/dashboard

Enter your API key: [paste your key here]
Enter your default workspace key (optional): development

✅ Configuration saved! You're all set.
```

After this initial setup, the SDK will remember your configuration.

## Production Use

In production, set the environment variable:

```bash
export A11OPS_API_KEY=your-api-key-here
npm start
```

### Reset Configuration
To reset your local configuration and set up a new API key:
```bash
rm -rf ~/.a11ops
npm start  # Will prompt for new credentials
```