# Dual Page Launch System

This application now has two separate pages for different use cases:

## 🎯 User Page (`/`)
- **Purpose**: For participants to click the launch button
- **Features**:
  - Shows participant count (3/3)
  - Interactive launch button
  - Progress bar and animations
  - Connection status
  - Reset functionality
- **Use Case**: Share this URL with participants who will click the launch button

## 📺 Big Screen Page (`/bigscreen`)
- **Purpose**: Display-only page for presentations/events
- **Features**:
  - NO launch button (display only)
  - NO participant count shown
  - Shows progress bar and animations
  - Massive logo reveal when 3 participants click
  - Optimized for large displays
- **Use Case**: Display this on a big screen/projector during events

## 🔄 How It Works

1. **Setup**: Display the Big Screen page on your main display
2. **Share**: Share the User Page URL with participants
3. **Launch**: When 3 people click the launch button on the User Page, the logo automatically reveals on the Big Screen
4. **Sync**: Both pages are connected via WebSocket to the same Railway backend

## 🌐 URLs

- **User Page**: `https://your-domain.com/` or `http://localhost:5173/`
- **Big Screen**: `https://your-domain.com/bigscreen` or `http://localhost:5173/bigscreen`

## 🎮 Navigation

- Use the navigation bar at the top to switch between pages
- Or directly navigate to the URLs above
- Both pages stay in sync automatically

## 🚀 Deployment

Both pages work with the same Railway backend:
- **Backend**: `wss://launch-page-production.up.railway.app`
- **Frontend**: Deploy to Netlify or any static hosting

## 💡 Tips

- The Big Screen page is optimized for large displays with bigger text and animations
- The User Page shows the count to participants for engagement
- Both pages automatically reconnect if the WebSocket connection drops
- The logo reveal is more spectacular on the Big Screen page
