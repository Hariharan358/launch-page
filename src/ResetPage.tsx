import { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import casa from "./logo/casa.png";

function ResetPage() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // WebSocket connection
  useEffect(() => {
    let websocket: WebSocket | null = null;
    let retryTimeout: NodeJS.Timeout | null = null;

    const connectWebSocket = () => {
      if (websocket && websocket.readyState === WebSocket.OPEN) return;

      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = window.location.hostname;
      const isProduction = wsHost !== 'localhost' && wsHost !== '127.0.0.1';
      const wsUrl = isProduction ? 'wss://launch-page-k7rh.onrender.com' : `${wsProtocol}//${wsHost}:3001`;

      console.log('🔌 Reset page connecting to WebSocket:', wsUrl);
      websocket = new WebSocket(wsUrl);

      websocket.onopen = () => {
        setIsConnected(true);
        console.log('✅ Reset page connected to WebSocket server');
      };

      websocket.onclose = () => {
        setIsConnected(false);
        console.log('❌ Reset page disconnected from WebSocket server');

        // Retry connection
        retryTimeout = setTimeout(() => {
          connectWebSocket();
        }, 2000);
      };

      websocket.onerror = (error) => {
        console.error('❌ Reset page WebSocket error:', error);
        setIsConnected(false);
      };

      setWs(websocket);
    };

    connectWebSocket();

    return () => {
      if (retryTimeout) clearTimeout(retryTimeout);
      if (websocket) websocket.close();
    };
  }, []);

  const handleReset = async () => {
    if (!ws || !isConnected) return;

    setIsResetting(true);
    
    try {
      ws.send(JSON.stringify({ type: 'reset' }));
      
      // Show success feedback
      setTimeout(() => {
        setIsResetting(false);
        // Redirect back to user page after reset
        window.history.pushState({}, '', '/');
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('Reset failed:', error);
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-80 h-80 bg-red-50 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-20"></div>
      </div>

      <div className="text-center relative z-10 max-w-lg mx-auto">

        {/* Logo */}
        <div className="mb-12">
          <div className="flex justify-center mb-6">
            <img
              src={casa}
              alt="Casa Logo"
              className="h-20 md:h-24 w-auto drop-shadow-lg"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-light text-gray-800 mb-4">
            Reset Launch
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed font-light max-w-md mx-auto">
            This will reset the entire launch sequence and clear all participant data.
          </p>
        </div>

        {/* Reset Status */}
        <div className="mb-8">
          {!isConnected ? (
            <div className="text-orange-600 text-sm animate-pulse font-light mb-4">
              Connecting to server...
            </div>
          ) : isResetting ? (
            <div className="text-blue-600 text-sm font-light mb-4 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              Resetting launch sequence...
            </div>
          ) : (
            <div className="text-green-600 text-sm font-light mb-4">
              Ready to reset
            </div>
          )}
        </div>

        {/* Reset Button */}
        <div className="mb-8">
          <button
            onClick={handleReset}
            disabled={!isConnected || isResetting}
            className={`
              relative px-12 py-6 rounded-xl font-light text-lg transition-all duration-300 transform
              ${!isConnected || isResetting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:scale-105 hover:shadow-lg hover:shadow-red-300 active:scale-95'
              }
            `}
          >
            <div className="flex items-center gap-3 justify-center">
              <RotateCcw 
                size={24} 
                className={isResetting ? 'animate-spin' : ''} 
              />
              <span>{isResetting ? 'RESETTING...' : 'RESET LAUNCH'}</span>
            </div>
          </button>
        </div>

        {/* Navigation */}
        <div className="space-y-3">
          <button
            onClick={() => {window.history.pushState({}, '', '/'); window.location.reload();}}
            className="text-orange-600 hover:text-orange-700 font-light text-sm transition-colors duration-300 underline decoration-1 underline-offset-4"
          >
            ← Back to Launch Page
          </button>
          <br />
          <button
            onClick={() => {window.history.pushState({}, '', '/bigscreen'); window.location.reload();}}
            className="text-orange-600 hover:text-orange-700 font-light text-sm transition-colors duration-300 underline decoration-1 underline-offset-4"
          >
            View Big Screen
          </button>
        </div>

        {/* Warning */}
        <div className="mt-12 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm font-light">
            <strong>Warning:</strong> This action cannot be undone. All launch progress will be lost.
          </p>
        </div>

      </div>
    </div>
  );
}

export default ResetPage;