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

## Production Deployment (Netlify + Railway)

The app automatically detects when it's running in production and connects to your Railway WebSocket backend for real-time functionality.

### Features in Production:
- ✅ **HTTPS Compatible** - Uses secure WebSocket (wss://)
- ✅ **Real-time Updates** - Connected to Railway WebSocket backend
- ✅ **Persistent State** - Server maintains state across sessions
- ✅ **Multi-user Support** - Real-time collaboration
- ✅ **All Animations** - Full UI animations work perfectly

### Backend: Railway WebSocket Server
- **URL**: `wss://launch-page-production.up.railway.app`
- **Protocol**: Secure WebSocket (WSS)
- **Features**: Real-time launch state management

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
- Full real-time functionality with local server

### Production:
- Uses Railway WebSocket backend at `wss://launch-page-production.up.railway.app`
- Real-time collaboration between users
- Server maintains state across sessions
- Multi-user launch events

## Testing the Connection

1. **Test Railway WebSocket:**
   - Open `test-railway-connection.html` in your browser
   - Click "Test Connection" to verify Railway backend
   - Send test messages to verify functionality

2. **Check Console Logs:**
   - Open browser dev tools
   - Look for connection status messages
   - Verify "✅ Connected to Railway WebSocket server"

## Troubleshooting

### If Railway connection fails:
1. **Check Railway deployment** - Ensure server is running
2. **Verify URL** - Confirm `wss://launch-page-production.up.railway.app` is accessible
3. **Check CORS** - Ensure Railway allows WebSocket connections
4. **Test with test page** - Use `test-railway-connection.html` to debug

### If local development fails:
1. **Start local server** - Run `npm run start-ws-server`
2. **Check port 3001** - Ensure no other service is using it
3. **Verify localhost** - Try `ws://127.0.0.1:3001` if localhost fails
