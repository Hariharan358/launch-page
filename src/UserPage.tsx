import { useState, useEffect, useRef } from 'react';
import { Rocket, Sparkles, RotateCcw, Zap, Star, Trophy } from 'lucide-react';

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

  // Enhanced particle system
  useEffect(() => {
    if (!showCelebration) return;

    const createParticles = () => {
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
    };

    createParticles();

    const animateParticles = () => {
      setParticles(prev => 
        prev.map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          life: particle.life - 1
        })).filter(particle => particle.life > 0)
      );
    };

    const interval = setInterval(animateParticles, 50);
    return () => clearInterval(interval);
  }, [showCelebration]);

  // WebSocket connection with retry logic
  useEffect(() => {
    let websocket: WebSocket | null = null;
    let retryTimeout: NodeJS.Timeout | null = null;

    const connectWebSocket = () => {
      if (websocket && websocket.readyState === WebSocket.OPEN) {
        return;
      }

      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = window.location.hostname;
      
      const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      
      let wsUrl;
      if (isProduction) {
        wsUrl = 'wss://launch-page-production.up.railway.app';
        console.log('Production mode: Connecting to Railway WebSocket backend');
      } else {
        wsUrl = `${wsProtocol}//${wsHost}:3001`;
      }
      
      console.log('🔌 Connecting to WebSocket:', wsUrl);
      websocket = new WebSocket(wsUrl);
      
      websocket.onopen = () => {
        setIsConnected(true);
        connectionAttemptsRef.current = 0;
        console.log('✅ Connected to Railway WebSocket server');
      };
      
      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setLaunchState(data);
        
        if (data.isLaunched && !showCelebration) {
          setShowCelebration(true);
          setPulseAnimation(true);
          
          setTimeout(() => {
            document.body.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => {
              document.body.style.animation = '';
            }, 500);
          }, 100);
          
          setTimeout(() => {
            setShowCelebration(false);
            setPulseAnimation(false);
          }, 8000);
        }
      };
      
      websocket.onclose = () => {
        setIsConnected(false);
        console.log('❌ Disconnected from Railway WebSocket server');
        
        if (connectionAttemptsRef.current < 5) {
          console.log(`🔄 Retrying connection (attempt ${connectionAttemptsRef.current + 1}/5)...`);
          retryTimeout = setTimeout(() => {
            connectionAttemptsRef.current += 1;
            connectWebSocket();
          }, 2000);
        }
      };
      
      websocket.onerror = (error) => {
        console.error('❌ Railway WebSocket error:', error);
        setIsConnected(false);
      };
      
      setWs(websocket);
    };

    connectWebSocket();

    return () => {
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
      if (websocket) {
        websocket.close();
      }
    };
  }, []);

  const handleLaunch = () => {
    if (!ws || hasClicked || launchState.isLaunched) return;
    
    setHasClicked(true);
    setPulseAnimation(true);
    setTimeout(() => setPulseAnimation(false), 1000);
    
    ws.send(JSON.stringify({ 
      type: 'launch_click',
      userId 
    }));
  };

  const handleReset = () => {
    if (!ws) return;
    
    setHasClicked(false);
    setShowCelebration(false);
    setPulseAnimation(false);
    setParticles([]);
    ws.send(JSON.stringify({ 
      type: 'reset' 
    }));
  };

  const progressPercentage = (launchState.clickCount / 3) * 100;
  const isNearLaunch = launchState.clickCount >= 2;

  return (
    <div className="min-h-screen bg-white text-gray-800 flex items-center justify-center p-6 relative overflow-hidden">

      {/* Elegant Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating orange orbs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-70"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-orange-50 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-gray-100 rounded-full blur-2xl opacity-40"></div>

        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      {/* Connection Status — Clean & Professional */}
      <div
        className="
          absolute right-6 
          top-0 sm:top-5   // ✅ closer to top on small screens
          flex items-center gap-3 
          bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 
          border border-gray-200 shadow-md 
          transition-all duration-300
        "
      >
        <div
          className={`w-3 h-3 rounded-full transition-all duration-300 ${
            isConnected ? 'bg-orange-500 animate-pulse' : 'bg-gray-400'
          }`}
        ></div>
        <span className="text-sm font-medium text-gray-700">
          {isConnected ? 'Connected' : 'Connecting...'}
        </span>
        {isConnected && <Zap size={14} className="text-orange-500 animate-bounce" />}
      </div>


      {/* Participant Counter — Minimal & Elegant */}
      <div className="absolute top-6 left-6 flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200 shadow-md">
        <span className="text-xl font-bold text-gray-800">{launchState.clickCount}</span>
        <span className="text-gray-500 text-sm">/ 3</span>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl w-full text-center relative z-10">

        {/* Logo Placeholder */}
        <div className="mb-12">
          <h1 className="text-6xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-4">
            LOGO
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            LAUNCH EVENT
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Join the exclusive launch! We need exactly <span className="font-semibold text-orange-600">3 participants</span> to simultaneously reveal our revolutionary new logo.
          </p>
        </div>

        {/* Progress Circle — Orange Theme */}
        <div className="mb-12">
          <div className={`relative w-64 h-64 mx-auto mb-8 transition-all duration-500 ${pulseAnimation ? 'scale-105' : 'scale-100'} hover:scale-105`}>

            {/* Outer subtle ring */}
            <div className="absolute inset-0 rounded-full border-2 border-gray-200"></div>

            {/* Progress Ring */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="#f3f4f6"
                strokeWidth="3"
                fill="none"
              />
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

            {/* Center Status */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-4xl font-bold transition-all duration-500 ${pulseAnimation ? 'text-orange-600 scale-110 animate-pulse' : 'text-gray-800'}`}>
                  {launchState.clickCount}
                </div>
                <div className="text-sm text-gray-500 mt-1">/ 3</div>
                {isNearLaunch && !launchState.isLaunched && (
                  <div className="text-orange-600 text-xs font-medium mt-2 animate-pulse">
                    Almost there!
                  </div>
                )}
                {launchState.isLaunched && (
                  <div className="text-green-600 text-xs font-medium mt-2 animate-pulse">
                    🎉 LAUNCHED!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-lg mx-auto bg-gray-100 rounded-full h-2.5 overflow-hidden relative">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out ${
                launchState.isLaunched 
                  ? 'bg-green-500' 
                  : isNearLaunch 
                    ? 'bg-orange-500' 
                    : 'bg-gray-400'
              }`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          <div className="mt-4 text-gray-600 text-sm">
            {3 - launchState.clickCount > 0 
              ? `${3 - launchState.clickCount} more needed to unlock the reveal`
              : "🎉 Launch sequence activated!"
            }
          </div>
        </div>

        {/* Launch Button or Status */}
        {!launchState.isLaunched ? (
          <div className="mb-8">
            <button
              onClick={handleLaunch}
              disabled={hasClicked || !isConnected}
              className={`
                relative px-10 py-5 rounded-xl font-bold text-lg transition-all duration-300 transform
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
                    <span>LAUNCHED!</span>
                  </>
                ) : (
                  <>
                    <Rocket size={20} />
                    <span>LAUNCH NOW</span>
                    <Sparkles size={16} />
                  </>
                )}
              </div>
            </button>

            {!isConnected && (
              <p className="text-orange-600 text-sm mt-3 animate-pulse">
                Connecting to server...
              </p>
            )}
          </div>
        ) : (
          <div className="mb-8">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-3xl font-bold text-green-600 mb-2">
              LAUNCH SUCCESSFUL!
            </h3>
            <p className="text-gray-600">
              The logo has been revealed! Check the big screen for the full experience.
            </p>
          </div>
        )}

        {/* Reset Button */}
        <div>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-300 hover:scale-105 border border-gray-200"
          >
            <RotateCcw size={16} />
            <span>Reset Launch</span>
          </button>
        </div>
      </div>

      {/* Celebration Overlay — Elegant & Vibrant */}
      {showCelebration && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-50">

          <div className="text-center relative z-10 px-6">
            <div className="text-7xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 mb-6 animate-fadeIn">
              LOGO
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              🎉 LAUNCHED! 🎉
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
              The logo has been revealed to the world!
            </p>
            
            <button
              onClick={() => setShowCelebration(false)}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-all duration-300 font-medium hover:scale-105 shadow-md"
            >
              Close
            </button>
          </div>

          {/* Orange Confetti */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(60)].map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  backgroundColor: ['#F7941A', '#D36B00', '#FFB74D', '#F57C00'][Math.floor(Math.random() * 4)],
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 2}s`,
                  borderRadius: '50%'
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Celebration Particles (Stars) — Optional, fits theme */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 pointer-events-none"
          style={{
            left: particle.x,
            top: particle.y,
            opacity: particle.life / particle.maxLife
          }}
        >
          <Star 
            size={10} 
            className="text-orange-500" 
            fill="currentColor"
          />
        </div>
      ))}

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation: confetti 3s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
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