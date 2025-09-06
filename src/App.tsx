import React, { useState, useEffect } from 'react';
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
  const [connectionAttempts, setConnectionAttempts] = useState(0);

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
    const connectWebSocket = () => {
      const wsProtocol = 'ws:';
      const wsHost = window.location.hostname.replace(/--\d+--/, '--3001--');
      const websocket = new WebSocket(`${wsProtocol}//${wsHost}`);
      
      websocket.onopen = () => {
        setIsConnected(true);
        setConnectionAttempts(0);
        console.log('Connected to server');
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
        console.log('Disconnected from server');
        
        // Retry connection
        if (connectionAttempts < 5) {
          setTimeout(() => {
            setConnectionAttempts(prev => prev + 1);
            connectWebSocket();
          }, 2000);
        }
      };
      
      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      setWs(websocket);
      
      return () => {
        websocket.close();
      };
    };

    const cleanup = connectWebSocket();
    return cleanup;
  }, [connectionAttempts, showCelebration]);

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
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Floating stars */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
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
      <div className="absolute top-6 right-6 flex items-center gap-3 bg-black/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></div>
        <span className="text-sm text-white/80 font-medium">
          {isConnected ? 'Live' : connectionAttempts > 0 ? 'Reconnecting...' : 'Connecting...'}
        </span>
        {isConnected && <Zap size={14} className="text-emerald-400" />}
      </div>

      {/* Participant counter badge */}
      <div className="absolute top-6 left-6 flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
        <Users size={16} className="text-blue-400" />
        <span className="text-white font-bold">{launchState.clickCount}</span>
        <span className="text-white/60 text-sm">online</span>
      </div>

      {/* Main content */}
      <div className="max-w-3xl w-full text-center relative z-10">
        {/* Enhanced header */}
        <div className="mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Crown size={48} className="text-yellow-400" />
            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 tracking-tight">
              LOGO
            </h1>
            <Crown size={48} className="text-yellow-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            LAUNCH EVENT
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            Join the exclusive launch! We need exactly <span className="font-bold text-yellow-400">10 participants</span> to simultaneously reveal our revolutionary new logo.
          </p>
        </div>

        {/* Enhanced progress section */}
        <div className="mb-16">
          <div className={`relative w-64 h-64 mx-auto mb-8 transition-all duration-500 ${pulseAnimation ? 'scale-110' : 'scale-100'}`}>
            {/* Outer glow ring */}
            <div className={`absolute inset-0 rounded-full ${isNearLaunch ? 'animate-pulse bg-gradient-to-r from-yellow-400/20 to-orange-400/20' : ''}`}></div>
            
            {/* Progress Ring */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
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
                className="transition-all duration-700 ease-out"
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
            
            {/* Enhanced counter */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-5xl font-black text-white mb-2 transition-all duration-300 ${pulseAnimation ? 'scale-125' : 'scale-100'}`}>
                  {launchState.clickCount}
                </div>
                <div className="text-lg text-white/60 font-medium">/ 10</div>
                {isNearLaunch && !launchState.isLaunched && (
                  <div className="text-yellow-400 text-sm font-bold animate-pulse mt-2">
                    Almost there!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced status indicators */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 text-white/80">
              <Trophy size={24} className="text-yellow-400" />
              <span className="text-lg font-semibold">
                {launchState.clickCount} Pioneers Ready
              </span>
            </div>
            
            {/* Dynamic progress bar */}
            <div className="w-full max-w-lg mx-auto bg-white/10 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  launchState.isLaunched 
                    ? 'bg-gradient-to-r from-emerald-400 to-green-500' 
                    : isNearLaunch 
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 animate-pulse' 
                      : 'bg-gradient-to-r from-blue-400 to-purple-500'
                }`}
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            
            <div className="text-white/60 text-sm">
              {10 - launchState.clickCount > 0 
                ? `${10 - launchState.clickCount} more needed to unlock the reveal`
                : "🎉 Launch sequence activated!"
              }
            </div>
          </div>
        </div>

        {/* Enhanced launch button or logo reveal */}
        {!launchState.isLaunched ? (
          <div className="mb-12">
            <button
              onClick={handleLaunch}
              disabled={hasClicked || !isConnected}
              className={`
                relative px-16 py-8 rounded-3xl font-black text-xl transition-all duration-500 transform
                ${hasClicked 
                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white cursor-default scale-95 shadow-2xl shadow-emerald-500/25' 
                  : isConnected
                    ? 'bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 text-white hover:scale-110 active:scale-95 shadow-2xl hover:shadow-purple-500/50'
                    : 'bg-gray-600 text-gray-300 cursor-not-allowed scale-95'
                }
                ${isNearLaunch && !hasClicked ? 'animate-pulse' : ''}
              `}
            >
              <div className="flex items-center gap-4">
                {hasClicked ? (
                  <>
                    <Sparkles className="animate-spin" size={28} />
                    <span>LOCKED IN!</span>
                    <Sparkles className="animate-spin" size={28} />
                  </>
                ) : (
                  <>
                    <Rocket size={28} />
                    <span>JOIN LAUNCH</span>
                    <Rocket size={28} />
                  </>
                )}
              </div>
              
              {/* Button glow effect */}
              {!hasClicked && isConnected && (
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-600/20 to-pink-600/20 blur-xl -z-10"></div>
              )}
            </button>
            
            {hasClicked && (
              <div className="mt-6 p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                <p className="text-emerald-400 font-semibold">
                  ✅ You're in! Waiting for {10 - launchState.clickCount} more pioneers to join the launch.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="mb-12 relative">
            {/* Enhanced logo reveal */}
            <div className={`
              relative p-16 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20
              transition-all duration-1000 transform shadow-2xl
              ${showCelebration ? 'scale-110 rotate-1' : 'scale-100'}
            `}>
              {/* Enhanced logo container */}
              <div className="relative z-10">
                <div className="w-48 h-48 mx-auto mb-8 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <div className="text-6xl font-black text-white">LOGO</div>
                </div>
                <h2 className="text-4xl font-black text-white mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  🎊 LOGO REVEALED! 🎊
                </h2>
                <p className="text-xl text-white/90 mb-6 max-w-md mx-auto">
                  Congratulations to all 10 pioneers who made this historic launch possible!
                </p>
                <div className="flex items-center justify-center gap-2 text-yellow-400">
                  <Trophy size={24} />
                  <span className="font-bold">Launch Complete</span>
                  <Trophy size={24} />
                </div>
              </div>
            </div>

            {/* Enhanced reset button */}
            <button
              onClick={handleReset}
              className="mt-8 px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all duration-300 flex items-center gap-3 mx-auto border border-white/20 hover:border-white/40 font-semibold"
            >
              <RotateCcw size={20} />
              Start New Launch Event
            </button>
          </div>
        )}

        {/* Enhanced footer */}
        <div className="text-white/60 text-lg font-medium">
          {launchState.isLaunched 
            ? "🚀 Mission accomplished! The future is here." 
            : `⚡ ${10 - launchState.clickCount} spots remaining for this exclusive reveal`
          }
        </div>
      </div>
    </div>
  );
}

export default App;