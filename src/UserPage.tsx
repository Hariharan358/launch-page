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
          
          // Trigger celebration effects
          setTimeout(() => {
            // Add screen shake effect
            document.body.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => {
              document.body.style.animation = '';
            }, 500);
          }, 100);
          
          // Auto-hide celebration after 8 seconds
          setTimeout(() => {
            setShowCelebration(false);
            setPulseAnimation(false);
          }, 8000);
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

  const progressPercentage = (launchState.clickCount / 3) * 100;
  const isNearLaunch = launchState.clickCount >= 2;

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
        <span className="text-white font-bold animate-countUp">{launchState.clickCount}</span>
        <span className="text-white/60 text-sm animate-fadeIn delay-300">/ 3</span>
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
            Join the exclusive launch! We need exactly <span className="font-bold text-yellow-400 animate-pulse">3 participants</span> to simultaneously reveal our revolutionary new logo.
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
                <div className="text-lg text-white/60 font-medium animate-fadeIn delay-300">/ 3</div>
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
            {/* Status indicator */}
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
              {3 - launchState.clickCount > 0 
                ? `${3 - launchState.clickCount} more needed to unlock the reveal`
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
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 animate-glow' 
                    : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                } shadow-lg hover:shadow-xl
              `}
            >
              {/* Button glow effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
              
              <div className="relative flex items-center gap-3">
                {hasClicked ? (
                  <>
                    <Trophy size={28} className="animate-bounce" />
                    <span>LAUNCHED!</span>
                  </>
                ) : (
                  <>
                    <Rocket size={28} className="group-hover:animate-bounce" />
                    <span>LAUNCH NOW</span>
                    <Sparkles size={20} className="group-hover:animate-spin" />
                  </>
                )}
              </div>
            </button>
            
            {!isConnected && (
              <p className="text-red-400 text-sm mt-4 animate-pulse">
                Connecting to server...
              </p>
            )}
          </div>
        ) : (
          <div className="mb-12 animate-fadeInUp delay-1500">
            <div className="text-6xl mb-8 animate-bounce">
              🎉
            </div>
            <h3 className="text-4xl font-bold text-emerald-400 mb-4 animate-pulse">
              LAUNCH SUCCESSFUL!
            </h3>
            <p className="text-xl text-white/80 mb-8 animate-fadeIn delay-500">
              The logo has been revealed! Check the big screen for the full experience.
            </p>
          </div>
        )}

        {/* Reset button */}
        <div className="animate-fadeInUp delay-2000">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-full transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/20"
          >
            <RotateCcw size={18} />
            <span>Reset Launch</span>
          </button>
        </div>
      </div>

      {/* Celebration overlay */}
      {showCelebration && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="text-center animate-revealLogo">
            {/* Massive logo reveal */}
            <div className="text-9xl md:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 mb-8 animate-scaleIn">
              LOGO
            </div>
            
            {/* Celebration text */}
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 animate-bounce">
              🎉 LAUNCHED! 🎉
            </h2>
            <p className="text-xl text-white/80 mb-8 animate-fadeIn delay-500">
              The logo has been revealed to the world!
            </p>
            
            {/* Confetti effect */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(50)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 animate-confetti"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'][Math.floor(Math.random() * 5)],
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${2 + Math.random() * 2}s`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserPage;
     