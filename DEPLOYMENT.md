# Deployment Guide

## Local Development

1. **Start the WebSocket server:**
   ```bash
   npm run start-ws-server
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:5173`

## Production Deployment (Netlify)

The app automatically detects when it's running in production and uses a localStorage-based simulation instead of WebSocket connections. This ensures it works on HTTPS without requiring a WebSocket server.

### Features in Production:
- ✅ **HTTPS Compatible** - No WebSocket connection issues
- ✅ **Persistent State** - Uses localStorage to maintain state
- ✅ **Multi-tab Support** - State syncs across browser tabs
- ✅ **All Animations** - Full UI animations work perfectly

### Deploy to Netlify:

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify:**
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Deploy!

3. **Your app will be available at:**
   `https://your-app-name.netlify.app`

## How It Works

### Local Development:
- Uses real WebSocket connection to `ws://localhost:3001`
- Full real-time functionality with server

### Production:
- Uses localStorage-based simulation
- No server required
- State persists across browser sessions
- Multi-tab synchronization

## Customization

To add real WebSocket support in production, you can:

1. **Use a WebSocket service** like Pusher, Socket.io, or Ably
2. **Deploy a WebSocket server** to a service like Railway, Render, or Heroku
3. **Use serverless functions** with WebSocket support

The current implementation provides a great user experience without requiring any backend infrastructure!
