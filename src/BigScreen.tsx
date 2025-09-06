import { useState, useEffect, useRef } from 'react';
import { Star, Zap } from 'lucide-react';

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

function BigScreen() {
  const [, setWs] = useState<WebSocket | null>(null);
  const [launchState, setLaunchState] = useState<LaunchState>({
    clickCount: 0,
    isLaunched: false,
    participants: []
  });
  const [isConnected, setIsConnected] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const connectionAttemptsRef = useRef(0);

  // Enhanced particle system for big screen
  useEffect(() => {
    if (!showCelebration) return;

    const createParticles = () => {
      const newParticles: Particle[] = [];
      for (let i = 0; i < 100; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          life: 150,
          maxLife: 150
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

    const interval = setInterval(animateParticles, 30);
    return () => clearInterval(interval);
  }, [showCelebration]);

  // WebSocket connection for big screen
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
        console.log('Big Screen: Connecting to Railway WebSocket backend');
      } else {
        wsUrl = `${wsProtocol}//${wsHost}:3001`;
      }
      
      console.log('🔌 Big Screen connecting to:', wsUrl);
      websocket = new WebSocket(wsUrl);
      
      websocket.onopen = () => {
        setIsConnected(true);
        connectionAttemptsRef.current = 0;
        console.log('✅ Big Screen connected to WebSocket server');
      };
      
      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setLaunchState(data);
        
        if (data.isLaunched && !showCelebration) {
          setShowCelebration(true);
          
          // Trigger screen shake effect
          setTimeout(() => {
            document.body.style.animation = 'shake 0.8s ease-in-out';
            setTimeout(() => {
              document.body.style.animation = '';
            }, 800);
          }, 200);
          
          // No auto-close - celebration stays open until manually closed
        }
      };
      
      websocket.onclose = () => {
        setIsConnected(false);
        console.log('❌ Big Screen disconnected from WebSocket server');
        
        if (connectionAttemptsRef.current < 5) {
          console.log(`🔄 Big Screen retrying connection (attempt ${connectionAttemptsRef.current + 1}/5)...`);
          retryTimeout = setTimeout(() => {
            connectionAttemptsRef.current += 1;
            connectWebSocket();
          }, 2000);
        }
      };
      
      websocket.onerror = (error) => {
        console.error('❌ Big Screen WebSocket error:', error);
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

  const progressPercentage = (launchState.clickCount / 3) * 100;
  const isNearLaunch = launchState.clickCount >= 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced animated background for big screen */}
      <div className="absolute inset-0">
        {/* Larger animated gradient orbs for big screen */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* More floating orbs */}
        <div className="absolute top-1/6 right-1/3 w-48 h-48 bg-cyan-400/15 rounded-full blur-2xl animate-bounce delay-700"></div>
        <div className="absolute bottom-1/6 left-1/6 w-64 h-64 bg-emerald-400/15 rounded-full blur-2xl animate-ping delay-300"></div>
        
        {/* More floating stars */}
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/40 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${1.5 + Math.random() * 2}s`
            }}
          />
        ))}
        
        {/* More shooting stars */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`shooting-${i}`}
            className="absolute w-3 h-1 bg-white/60 rounded-full animate-ping"
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
            backgroundSize: '80px 80px',
            animation: 'gridMove 20s linear infinite'
          }}></div>
        </div>
      </div>

      {/* Celebration particles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute w-3 h-3 pointer-events-none"
          style={{
            left: particle.x,
            top: particle.y,
            opacity: particle.life / particle.maxLife
          }}
        >
          <Star 
            size={12} 
            className="text-yellow-400 animate-spin" 
            fill="currentColor"
          />
        </div>
      ))}

      {/* Connection status for big screen */}
      <div className="absolute top-8 right-8 flex items-center gap-3 bg-black/20 backdrop-blur-sm rounded-full px-6 py-3 border border-white/10 animate-fadeInUp">
        <div className={`w-4 h-4 rounded-full transition-all duration-300 ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400 animate-pulse'}`}></div>
        <span className="text-lg text-white/80 font-medium">
          {isConnected ? 'Big Screen Connected' : 'Connecting...'}
        </span>
        {isConnected && <Zap size={18} className="text-emerald-400 animate-bounce" />}
      </div>

      {/* Main content for big screen */}
      <div className="max-w-6xl w-full text-center relative z-10">
        {/* Enhanced header for big screen */}
        <div className="mb-20 animate-fadeInUp">
          <div className="flex items-center justify-center gap-6 mb-8">
            <h1 className="text-8xl md:text-[10rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 tracking-tight animate-pulse">
              LOGO
            </h1>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-fadeInUp delay-300">
            LAUNCH EVENT
          </h2>
          <p className="text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed animate-fadeInUp delay-500">
            Watch as we reveal our revolutionary new logo when <span className="font-bold text-yellow-400 animate-pulse">3 participants</span> join the launch!
          </p>
        </div>

        {/* Enhanced progress section for big screen */}
        <div className="mb-20 animate-fadeInUp delay-700">
          <div className={`relative w-96 h-96 mx-auto mb-12 transition-all duration-500 ${isNearLaunch ? 'scale-110' : 'scale-100'}`}>
            {/* Outer glow ring */}
            <div className={`absolute inset-0 rounded-full transition-all duration-1000 ${isNearLaunch ? 'animate-pulse bg-gradient-to-r from-yellow-400/20 to-orange-400/20' : ''}`}></div>
            
            {/* Animated background rings */}
            <div className="absolute inset-4 rounded-full border-4 border-white/5 animate-spin" style={{ animationDuration: '25s' }}></div>
            <div className="absolute inset-8 rounded-full border-2 border-white/10 animate-spin" style={{ animationDuration: '20s', animationDirection: 'reverse' }}></div>
            
            {/* Progress Ring */}
            <svg className="w-full h-full transform -rotate-90 transition-all duration-1000" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                className="text-white/10"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="url(#gradient)"
                strokeWidth="6"
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
            
            {/* Status display - no count shown */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                {!launchState.isLaunched ? (
                  <div className={`text-4xl font-black text-white mb-4 transition-all duration-500 ${isNearLaunch ? 'scale-125 animate-bounce' : 'scale-100'}`}>
                    {isNearLaunch ? (
                      <div className="text-yellow-400 animate-pulse">
                        READY TO REVEAL
                      </div>
                    ) : (
                      <div className="text-blue-400 animate-pulse">
                        WAITING FOR LAUNCH
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-emerald-400 text-4xl font-bold animate-pulse">
                    🎉 LAUNCHED! 🎉
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status indicators */}
          <div className="space-y-6 animate-fadeInUp delay-1000">
            <div className="text-3xl text-white/80 font-semibold animate-fadeIn delay-700">
              {!launchState.isLaunched ? (
                isNearLaunch ? (
                  <span className="text-yellow-400 animate-pulse">Ready to Reveal</span>
                ) : (
                  <span className="text-blue-400 animate-pulse">Waiting for Launch</span>
                )
              ) : (
                <span className="text-emerald-400 animate-pulse">Launch Complete</span>
              )}
            </div>
            
            {/* Progress bar */}
            <div className="w-full max-w-2xl mx-auto bg-white/10 rounded-full h-4 overflow-hidden relative">
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
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              </div>
            </div>
            
            <div className="text-white/60 text-lg animate-fadeIn delay-1200">
              {!launchState.isLaunched ? (
                isNearLaunch ? (
                  "🎉 Launch sequence activated!"
                ) : (
                  "Waiting for participants to join the launch"
                )
              ) : (
                "🎉 Mission accomplished! The future is here. 🎉"
              )}
            </div>
          </div>
        </div>

        {/* Waiting message */}
        {!launchState.isLaunched && (
          <div className="animate-fadeInUp delay-1500">
            <div className="text-4xl text-white/60 font-semibold mb-4">
              Waiting for participants...
            </div>
            <p className="text-xl text-white/40">
              The logo will be revealed when 3 people click the launch button
            </p>
          </div>
        )}
      </div>

      {/* Celebration overlay for big screen */}
      {showCelebration && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="text-center animate-revealLogo">
            {/* Massive logo reveal for big screen */}
            <div className="text-[15rem] md:text-[20rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 mb-12 animate-scaleIn">
              LOGO
            </div>
            
            {/* Celebration text */}
            <h2 className="text-6xl md:text-8xl font-bold text-white mb-8 animate-bounce">
              🎉 LAUNCHED! 🎉
            </h2>
            <p className="text-3xl text-white/80 mb-12 animate-fadeIn delay-500">
              The logo has been revealed to the world!
            </p>
            
            {/* Close button */}
            <button
              onClick={() => setShowCelebration(false)}
              className="mt-8 px-12 py-6 bg-white/20 hover:bg-white/30 text-white rounded-2xl transition-all duration-300 flex items-center gap-4 mx-auto border border-white/30 hover:border-white/50 font-semibold hover:scale-105 animate-fadeInUp delay-1000 text-2xl"
            >
              <span>✕</span>
              <span>Close Celebration</span>
            </button>
            
            {/* Enhanced confetti effect for big screen */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(100)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 animate-confetti"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'][Math.floor(Math.random() * 7)],
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${3 + Math.random() * 2}s`
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

export default BigScreen;
