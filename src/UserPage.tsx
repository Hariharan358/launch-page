import { useState, useEffect, useRef } from 'react';
import { Rocket, RotateCcw, Star, Trophy } from 'lucide-react';
import launchLogo from "./logo/launch.png";
import casa from "./logo/casa.png";

interface LaunchState {
  clickCount: number;
  isLaunched: boolean;
  participants: string[];
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

function UserPage() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [launchState, setLaunchState] = useState<LaunchState>({
    clickCount: 0,
    isLaunched: false,
    participants: []
  });
  const [hasClicked, setHasClicked] = useState(false);
  const [userId] = useState(() => `user_${Math.random().toString(36).substr(2, 9)}`);
  const [isConnected, setIsConnected] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [pulseAnimation, setPulseAnimation] = useState(false);
  const connectionAttemptsRef = useRef(0);

  // Particle system
  useEffect(() => {
    if (!showCelebration) return;

    const newParticles: Particle[] = [];
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 100,
        maxLife: 100
      });
    }
    setParticles(newParticles);

    const interval = setInterval(() => {
      setParticles(prev => prev
        .map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, life: p.life - 1 }))
        .filter(p => p.life > 0)
      );
    }, 50);

    return () => clearInterval(interval);
  }, [showCelebration]);

  // WebSocket connection with retry
  useEffect(() => {
    let websocket: WebSocket | null = null;
    let retryTimeout: NodeJS.Timeout | null = null;

    const connectWebSocket = () => {
      if (websocket && websocket.readyState === WebSocket.OPEN) return;

      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = window.location.hostname;
      const isProduction = wsHost !== 'localhost' && wsHost !== '127.0.0.1';
      const wsUrl = isProduction ? 'wss://launch-page-k7rh.onrender.com' : `${wsProtocol}//${wsHost}:3001`;

      console.log('🔌 Connecting to WebSocket:', wsUrl);
      websocket = new WebSocket(wsUrl);

      websocket.onopen = () => {
        setIsConnected(true);
        connectionAttemptsRef.current = 0;
        console.log('✅ Connected to WebSocket server');
        ;(window as any).__globalLaunchWS = websocket;
      };

      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setLaunchState(data);

        // If big screen signaled reveal complete, ensure users see launched logo
        if (data.revealComplete && data.isLaunched) {
          setHasClicked(true);
        }

        if (data.isLaunched && !showCelebration) {
          setShowCelebration(true);
          setPulseAnimation(true);

          setTimeout(() => {
            document.body.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => document.body.style.animation = '', 500);
          }, 100);

          setTimeout(() => {
            setShowCelebration(false);
            setPulseAnimation(false);
          }, 8000);
        }
      };

      websocket.onclose = () => {
        setIsConnected(false);
        console.log('❌ Disconnected from WebSocket server');

        if (connectionAttemptsRef.current < 5) {
          retryTimeout = setTimeout(() => {
            connectionAttemptsRef.current += 1;
            connectWebSocket();
          }, 2000);
        }
      };

      websocket.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
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

  const handleLaunch = () => {
    if (!ws || hasClicked || launchState.isLaunched) return;

    setHasClicked(true);
    setPulseAnimation(true);
    setTimeout(() => setPulseAnimation(false), 1000);

    ws.send(JSON.stringify({ type: 'launch_click', userId }));
  };

  const handleReset = () => {
    if (!ws) return;
    setHasClicked(false);
    setShowCelebration(false);
    setPulseAnimation(false);
    setParticles([]);
    ws.send(JSON.stringify({ type: 'reset' }));
  };

  const progressPercentage = (launchState.clickCount / 3) * 100;
  const isNearLaunch = launchState.clickCount >= 2;

  return (
    <div className="min-h-screen bg-white text-gray-800 flex items-center justify-center p-4 sm:p-6 md:p-6 relative overflow-hidden font-sans">

      <div className="w-full max-w-full sm:max-w-xl md:max-w-3xl text-center relative z-10 px-4 sm:px-6 md:px-0">

        {/* Logo */}
        <div className="mb-8 sm:mb-12">
          <div className="flex justify-center mb-2 sm:mb-4">
            <img
              src={casa}
              alt="Casa Logo"
              className="h-16 sm:h-20 md:h-24 w-auto drop-shadow-lg"
            />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-800 mb-2 sm:mb-4">
            LAUNCH EVENT
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-xl mx-auto leading-relaxed font-light">
            Join the exclusive launch. We need exactly <span className="font-light text-orange-600">3 participants</span> to simultaneously reveal our new product.
          </p>
        </div>

        {/* Progress Circle */}
        <div className="mb-8 sm:mb-12">
          <div className={`relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 mx-auto mb-6 transition-all duration-500 ${pulseAnimation ? 'scale-105' : 'scale-100'} hover:scale-105`}>
            <div className="absolute inset-0 rounded-full border-2 border-gray-200"></div>
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" stroke="#f3f4f6" strokeWidth="3" fill="none" />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke={launchState.isLaunched ? "#10B981" : isNearLaunch ? "#F7941A" : "#D36B00"}
                strokeWidth="5"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - progressPercentage / 100)}`}
                className="transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              {!launchState.isLaunched ? (
                <div className="text-center">
                  <div className={`text-2xl sm:text-3xl md:text-4xl font-light transition-all duration-500 ${pulseAnimation ? 'text-orange-600 scale-110 animate-pulse' : 'text-gray-800'}`}>
                    {launchState.clickCount}
                  </div>
                  <div className="text-xs sm:text-sm md:text-sm text-gray-500 mt-1 font-light">/ 3</div>
                  {isNearLaunch && (
                    <div className="text-orange-600 text-xs sm:text-sm md:text-sm font-light mt-2 animate-pulse">
                      Almost there
                    </div>
                  )}
                </div>
              ) : (
                <img
                  src={launchLogo}
                  alt="Launched Logo"
                  className="h-28 sm:h-36 md:h-44 lg:h-52 w-auto drop-shadow-lg rounded-lg animate-fadeIn"
                />
              )}
            </div>
          </div>

          <div className="w-full max-w-lg mx-auto bg-gray-100 rounded-full h-2.5 overflow-hidden relative">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out ${
                launchState.isLaunched ? 'bg-green-500' : isNearLaunch ? 'bg-orange-500' : 'bg-gray-400'
              }`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          <div className="mt-4 text-gray-600 text-sm font-light">
            {3 - launchState.clickCount > 0 
              ? `${3 - launchState.clickCount} more needed to unlock`
              : "Launch sequence activated"
            }
          </div>
        </div>

        {/* Launch Button */}
        {!launchState.isLaunched ? (
          <div className="mb-8">
            <button
              onClick={handleLaunch}
              disabled={hasClicked || !isConnected}
              className={`relative px-10 py-5 rounded-xl font-light text-lg transition-all duration-300 transform
                ${hasClicked 
                  ? 'bg-green-600 text-white cursor-default scale-100 shadow-lg' 
                  : isConnected
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:scale-105 hover:shadow-lg hover:shadow-orange-300 active:scale-95' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              <div className="flex items-center gap-3 justify-center">
                {hasClicked ? (
                  <>
                    <Trophy size={20} />
                    <span>LAUNCHED</span>
                  </>
                ) : (
                  <>
                    <Rocket size={20} />
                    <span>LAUNCH NOW</span>
                  </>
                )}
              </div>
            </button>
            {!isConnected && (
              <p className="text-orange-600 text-sm mt-3 animate-pulse font-light">
                Connecting to server...
              </p>
            )}
          </div>
        ) : (
          <div className="mb-8 flex flex-col items-center">
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-light text-green-600 mb-2">
              LAUNCH SUCCESSFUL
            </h3>
            {/* Show launched logo on user side after full sequence */}
          
            <p className="text-gray-600 font-light text-center max-w-md">
              The product has been revealed.
            </p>
          </div>
        )}

        {/* Reset */}
        <div>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-300 hover:scale-105 border border-gray-200 font-light"
          >
            <RotateCcw size={16} />
            <span>Reset Launch</span>
          </button>
        </div>
      </div>

      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center relative z-10 px-6">
            <div className="text-6xl sm:text-7xl md:text-8xl font-light text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 mb-6 animate-fadeIn drop-shadow-lg">
              LOGO
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-gray-900 mb-4">
              LAUNCHED
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto font-light">
              The product has been revealed on the big screen.
            </p>
            <button
              onClick={() => setShowCelebration(false)}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-all duration-300 font-light hover:scale-105 shadow-md"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Particles */}
      {particles.map(p => (
        <div key={p.id} className="absolute w-2 h-2 pointer-events-none" style={{ left: p.x, top: p.y, opacity: p.life / p.maxLife }}>
          <Star size={10} className="text-orange-500" fill="currentColor" />
        </div>
      ))}

      <style jsx>{`
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti { animation: confetti 3s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}

export default UserPage;
