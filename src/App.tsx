import { useState, useEffect, useRef } from 'react';
import { Users, Rocket, Sparkles, RotateCcw, Zap, Star, Trophy, Crown } from 'lucide-react';

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


function App() {
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

  // Enhanced WebSocket connection with retry logic
  useEffect(() => {
    let websocket: WebSocket | null = null;
    let retryTimeout: NodeJS.Timeout | null = null;

    const connectWebSocket = () => {
      if (websocket && websocket.readyState === WebSocket.OPEN) {
        return; // Already connected
      }

      // Detect protocol based on current page protocol
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = window.location.hostname;
      
      // For production deployments, use Railway backend
      // For local development, use port 3001
      const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      
      let wsUrl;
      if (isProduction) {
        // Use Railway WebSocket backend
        wsUrl = 'wss://launch-page-production.up.railway.app';
        console.log('Production mode: Connecting to Railway WebSocket backend');
      } else {
        wsUrl = `${wsProtocol}//${wsHost}:3001`;
      }
      
      console.log('🔌 Connecting to WebSocket:', wsUrl);
      console.log('🌐 Environment:', isProduction ? 'Production (Railway)' : 'Local Development');
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
            setShowCelebration(false);
            setPulseAnimation(false);
          }, 5000);
        }
      };
      
      websocket.onclose = () => {
        setIsConnected(false);
        console.log('❌ Disconnected from Railway WebSocket server');
        
        // Retry connection only if we haven't exceeded max attempts
        if (connectionAttemptsRef.current < 5) {
          console.log(`🔄 Retrying connection (attempt ${connectionAttemptsRef.current + 1}/5)...`);
          retryTimeout = setTimeout(() => {
            connectionAttemptsRef.current += 1;
            connectWebSocket();
          }, 2000);
        } else {
          console.log('❌ Max retry attempts reached. Please refresh the page.');
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
  }, []); // Empty dependency array - only run once on mount

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

  const progressPercentage = (launchState.clickCount / 10) * 100;
  const isNearLaunch = launchState.clickCount >= 7;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced animated background */}
      <div className="absolute inset-0">
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Additional floating orbs with different animations */}
        <div className="absolute top-1/6 right-1/3 w-32 h-32 bg-cyan-400/15 rounded-full blur-2xl animate-bounce delay-700"></div>
        <div className="absolute bottom-1/6 left-1/6 w-48 h-48 bg-emerald-400/15 rounded-full blur-2xl animate-ping delay-300"></div>
        
        {/* Floating stars with enhanced animations */}
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/40 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${1.5 + Math.random() * 2}s`
            }}
          />
        ))}
        
        {/* Shooting stars */}
        {[...Array(5)].map((_, i) => (
          <div
            key={`shooting-${i}`}
            className="absolute w-2 h-0.5 bg-white/60 rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: '2s',
              transform: 'rotate(45deg)'
            }}
          />
        ))}
        
        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'gridMove 20s linear infinite'
          }}></div>
        </div>
      </div>

      {/* Celebration particles */}
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
            size={8} 
            className="text-yellow-400 animate-spin" 
            fill="currentColor"
          />
        </div>
      ))}

      {/* Enhanced connection status */}
      <div className="absolute top-6 right-6 flex items-center gap-3 bg-black/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10 hover-lift animate-fadeInUp delay-100">
        <div className={`w-3 h-3 rounded-full transition-all duration-300 ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400 animate-pulse'}`}></div>
        <span className="text-sm text-white/80 font-medium animate-fadeIn delay-200">
          {isConnected ? 'Railway Connected' : connectionAttemptsRef.current > 0 ? 'Reconnecting...' : 'Connecting...'}
        </span>
        {isConnected && <Zap size={14} className="text-emerald-400 animate-bounce" />}
      </div>

      {/* Participant counter badge */}
      <div className="absolute top-6 left-6 flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10 hover-lift animate-fadeInUp delay-200">
        <Users size={16} className="text-blue-400 animate-float" />
        <span className="text-white font-bold animate-countUp">{launchState.clickCount}</span>
        <span className="text-white/60 text-sm animate-fadeIn delay-300">online</span>
      </div>

      {/* Main content */}
      <div className="max-w-3xl w-full text-center relative z-10">
        {/* Enhanced header with animations */}
        <div className="mb-16 animate-fadeInUp">
          <div className="flex items-center justify-center gap-4 mb-6">
          
            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 tracking-tight animate-pulse hover:animate-none transition-all duration-300 hover:scale-105">
              LOGO
            </h1>
           
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 animate-fadeInUp delay-300">
            LAUNCH EVENT
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed animate-fadeInUp delay-500">
            Join the exclusive launch! We need exactly <span className="font-bold text-yellow-400 animate-pulse">10 participants</span> to simultaneously reveal our revolutionary new logo.
          </p>
        </div>

        {/* Enhanced progress section with animations */}
        <div className="mb-16 animate-fadeInUp delay-700">
          <div className={`relative w-64 h-64 mx-auto mb-8 transition-all duration-500 ${pulseAnimation ? 'scale-110' : 'scale-100'} hover:scale-105`}>
            {/* Outer glow ring with enhanced animation */}
            <div className={`absolute inset-0 rounded-full transition-all duration-1000 ${isNearLaunch ? 'animate-pulse bg-gradient-to-r from-yellow-400/20 to-orange-400/20' : ''}`}></div>
            
            {/* Animated background rings */}
            <div className="absolute inset-2 rounded-full border-2 border-white/5 animate-spin" style={{ animationDuration: '20s' }}></div>
            <div className="absolute inset-4 rounded-full border border-white/10 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}></div>
            
            {/* Progress Ring with enhanced animations */}
            <svg className="w-full h-full transform -rotate-90 transition-all duration-1000" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-white/10"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="url(#gradient)"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - progressPercentage / 100)}`}
                className="transition-all duration-1000 ease-out animate-pulse"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={launchState.isLaunched ? '#10B981' : '#3B82F6'} />
                  <stop offset="50%" stopColor={launchState.isLaunched ? '#059669' : '#8B5CF6'} />
                  <stop offset="100%" stopColor={launchState.isLaunched ? '#047857' : '#EC4899'} />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Enhanced counter with animations */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-5xl font-black text-white mb-2 transition-all duration-500 ${pulseAnimation ? 'scale-125 animate-bounce' : 'scale-100'} hover:scale-110`}>
                  <span className="animate-countUp">{launchState.clickCount}</span>
                </div>
                <div className="text-lg text-white/60 font-medium animate-fadeIn delay-300">/ 10</div>
                {isNearLaunch && !launchState.isLaunched && (
                  <div className="text-yellow-400 text-sm font-bold animate-pulse mt-2 animate-bounce">
                    Almost there!
                  </div>
                )}
                {launchState.isLaunched && (
                  <div className="text-emerald-400 text-sm font-bold mt-2 animate-pulse">
                    🎉 LAUNCHED! 🎉
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced status indicators with animations */}
          <div className="space-y-4 animate-fadeInUp delay-1000">
            <div className="flex items-center justify-center gap-3 text-white/80 hover:scale-105 transition-transform duration-300">
              <Trophy size={24} className="text-yellow-400 animate-bounce delay-500" />
              <span className="text-lg font-semibold animate-fadeIn delay-700">
                <span className="animate-countUp">{launchState.clickCount}</span> Pioneers Ready
              </span>
            </div>
            
            {/* Dynamic progress bar with enhanced animations */}
            <div className="w-full max-w-lg mx-auto bg-white/10 rounded-full h-3 overflow-hidden relative">
              {/* Animated background shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
              
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${
                  launchState.isLaunched 
                    ? 'bg-gradient-to-r from-emerald-400 to-green-500' 
                    : isNearLaunch 
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 animate-pulse' 
                      : 'bg-gradient-to-r from-blue-400 to-purple-500'
                }`}
                style={{ width: `${progressPercentage}%` }}
              >
                {/* Progress bar shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              </div>
            </div>
            
            <div className="text-white/60 text-sm animate-fadeIn delay-1200">
              {10 - launchState.clickCount > 0 
                ? `${10 - launchState.clickCount} more needed to unlock the reveal`
                : "🎉 Launch sequence activated!"
              }
            </div>
          </div>
        </div>

        {/* Enhanced launch button or logo reveal */}
        {!launchState.isLaunched ? (
          <div className="mb-12 animate-fadeInUp delay-1500">
            <button
              onClick={handleLaunch}
              disabled={hasClicked || !isConnected}
              className={`
                relative px-16 py-8 rounded-3xl font-black text-xl transition-all duration-500 transform group
                ${hasClicked 
                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white cursor-default scale-95 shadow-2xl shadow-emerald-500/25 animate-bounce' 
                  : isConnected
                    ? 'bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 text-white hover:scale-110 active:scale-95 shadow-2xl hover:shadow-purple-500/50 hover:shadow-3xl'
                    : 'bg-gray-600 text-gray-300 cursor-not-allowed scale-95'
                }
                ${isNearLaunch && !hasClicked ? 'animate-pulse animate-bounce' : ''}
              `}
            >
              <div className="flex items-center gap-4 relative z-10">
                {hasClicked ? (
                  <>
                    <Sparkles className="animate-spin" size={28} />
                    <span className="animate-pulse">LOCKED IN!</span>
                    <Sparkles className="animate-spin" size={28} />
                  </>
                ) : (
                  <>
                    <Rocket size={28} className="group-hover:animate-bounce" />
                    <span className="group-hover:animate-pulse">JOIN LAUNCH</span>
                    <Rocket size={28} className="group-hover:animate-bounce" />
                  </>
                )}
              </div>
              
              {/* Enhanced button glow effects */}
              {!hasClicked && isConnected && (
                <>
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-600/20 to-pink-600/20 blur-xl -z-10 group-hover:blur-2xl transition-all duration-500"></div>
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-400/10 via-purple-500/10 to-pink-400/10 blur-2xl -z-20 animate-pulse"></div>
                </>
              )}
              
              {/* Ripple effect on click */}
              <div className="absolute inset-0 rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-white/20 scale-0 group-active:scale-100 transition-transform duration-300 rounded-3xl"></div>
              </div>
            </button>
            
            {hasClicked && (
              <div className="mt-6 p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 animate-fadeInUp hover-lift">
                <p className="text-emerald-400 font-semibold animate-pulse">
                  ✅ You're in! Waiting for <span className="animate-countUp">{10 - launchState.clickCount}</span> more pioneers to join the launch.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="mb-12 relative animate-fadeInUp delay-500">
            {/* Enhanced logo reveal */}
            <div className={`
              relative p-16 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20
              transition-all duration-1000 transform shadow-2xl hover-lift
              ${showCelebration ? 'scale-110 rotate-1 animate-glow' : 'scale-100'}
            `}>
              {/* Enhanced logo container */}
              <div className="relative z-10">
                <div className="w-48 h-48 mx-auto mb-8 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300 animate-float">
                  <div className="text-6xl font-black text-white animate-pulse">LOGO</div>
                </div>
                <h2 className="text-4xl font-black text-white mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent animate-bounce">
                  🎊 LOGO REVEALED! 🎊
                </h2>
                <p className="text-xl text-white/90 mb-6 max-w-md mx-auto animate-fadeIn delay-300">
                  Congratulations to all 10 pioneers who made this historic launch possible!
                </p>
                <div className="flex items-center justify-center gap-2 text-yellow-400 animate-fadeIn delay-500">
                  <Trophy size={24} className="animate-bounce" />
                  <span className="font-bold animate-pulse">Launch Complete</span>
                  <Trophy size={24} className="animate-bounce" />
                </div>
              </div>
              
              {/* Celebration sparkles */}
              {showCelebration && (
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 2}s`,
                        animationDuration: `${1 + Math.random() * 2}s`
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Enhanced reset button */}
            <button
              onClick={handleReset}
              className="mt-8 px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all duration-300 flex items-center gap-3 mx-auto border border-white/20 hover:border-white/40 font-semibold hover-lift btn-glow animate-fadeInUp delay-700"
            >
              <RotateCcw size={20} className="group-hover:animate-spin" />
              Start New Launch Event
            </button>
          </div>
        )}

        {/* Enhanced footer */}
        <div className="text-white/60 text-lg font-medium animate-fadeInUp delay-2000">
          {launchState.isLaunched 
            ? (
              <div className="animate-bounce">
                🚀 Mission accomplished! The future is here. 🚀
              </div>
            ) : (
              <div className="animate-pulse">
                ⚡ <span className="animate-countUp">{10 - launchState.clickCount}</span> spots remaining for this exclusive reveal
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
}

export default App;