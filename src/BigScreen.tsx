import { useState, useEffect, useRef } from 'react';
import { Star } from 'lucide-react';
import launch from "./logo/launch.jpg";

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
        wsUrl = 'wss://launch-page-k7rh.onrender.com';
        console.log('Big Screen: Connecting to Render WebSocket backend');
      } else {
        wsUrl = `${wsProtocol}//${wsHost}:3001`;
      }

      console.log('🔌 Big Screen connecting to:', wsUrl);
      websocket = new WebSocket(wsUrl);

      websocket.onopen = () => {
        connectionAttemptsRef.current = 0;
        console.log('✅ Big Screen connected to Render WebSocket server');
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
        }
      };

      websocket.onclose = () => {
        console.log('❌ Big Screen disconnected from Render WebSocket server');

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
    <div className="min-h-screen bg-white text-gray-800 font-sans relative overflow-hidden">

      {/* Main Content */}
      <div className="max-w-4xl mx-auto text-center relative z-10 pt-32 pb-20 px-6">

        {/* Logo Placeholder */}
        <div className="mb-16">
          <h1 className="text-7xl md:text-8xl font-light text-gray-900 tracking-tight mb-6 drop-shadow-lg">
            LOGO
          </h1>
          <h2 className="text-4xl md:text-5xl font-light text-gray-800 mb-4">
            LAUNCH EVENT
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-light">
            Watch as we reveal our new product when <span className="font-light text-orange-600">3 participants</span> join the launch.
          </p>
        </div>

        {/* Progress Circle - Elegant Orange Theme */}
        <div className="mb-16">
          <div className={`relative w-80 h-80 mx-auto mb-12 transition-all duration-500 ${isNearLaunch ? 'scale-105' : 'scale-100'}`}>

            {/* Outer subtle ring */}
            <div className="absolute inset-0 rounded-full border-2 border-gray-200"></div>

            {/* Progress Ring */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="#f3f4f6"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke={launchState.isLaunched ? "#10B981" : isNearLaunch ? "#F7941A" : "#D36B00"}
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - progressPercentage / 100)}`}
                className="transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>

            {/* Center Status Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {!launchState.isLaunched ? (
                <>
                  <div className={`text-3xl font-light transition-all duration-500 ${isNearLaunch ? 'text-orange-600 scale-110 animate-pulse' : 'text-gray-700'}`}>
                    {isNearLaunch ? "READY TO REVEAL" : "WAITING"}
                  </div>
                  <div className="text-sm text-gray-500 mt-2 font-light">
                    {launchState.clickCount} of 3 participants
                  </div>
                </>
              ) : (
                <>
                  <div className="text-green-600 text-3xl font-light animate-pulse mb-4">
                    LAUNCHED
                  </div>

                  {/* 👇 Revealed Product Image inside circle */}
                  <img
                    src={launch}
                    alt="Revealed Product"
                    className="h-20 md:h-24 mb-3 drop-shadow-sm rounded-lg transition-all duration-500 animate-fadeIn"
                  />

                  <div className="text-xs text-gray-500 font-light">
                    Product revealed!
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-xl mx-auto bg-gray-100 rounded-full h-3 overflow-hidden relative">
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

          {/* Status Message */}
          <div className="mt-6 text-gray-600 text-lg font-light">
            {!launchState.isLaunched ? (
              isNearLaunch ? (
                <span className="font-light text-orange-600">Launch sequence activated — one more to go</span>
              ) : (
                <span>Waiting for participants to join the launch</span>
              )
            ) : (
              <span className="font-light text-green-600">Mission accomplished</span>
            )}
          </div>
        </div>

        {/* 👇 Large Product Reveal Below Progress Circle */}
        {launchState.isLaunched && (
          <div className="mb-12 flex flex-col items-center justify-center animate-fadeIn px-4">
            <img
              src={launch}
              alt="Revealed Product"
              className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg h-auto mb-6 drop-shadow-xl rounded-xl transition-all duration-700 hover:scale-105 border border-gray-100"
            />
            <p className="text-gray-600 font-light text-lg max-w-lg text-center">
              The product has been successfully revealed to the world.
            </p>
          </div>
        )}


        {/* Waiting Message — only shown before launch */}
        {!launchState.isLaunched && (
          <div className="mt-12">
            <div className="text-2xl font-light text-gray-700 mb-2">
              Waiting for participants
            </div>
            <p className="text-gray-500 font-light">
              The product will be revealed when 3 people click the launch button
            </p>
          </div>
        )}
      </div>

      {/* Celebration Overlay — Elegant & Vibrant */}
      {showCelebration && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-50">

          {/* Celebration Content */}
          <div className="text-center relative z-10 px-6">
            <div className="text-8xl md:text-9xl font-light text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 mb-8 animate-fadeIn drop-shadow-lg">
              LOGO
            </div>

            <h2 className="text-5xl md:text-6xl font-light text-gray-900 mb-6">
              LAUNCHED
            </h2>

            {/* 👇 Product image in popup */}
            <img
              src={launch}
              alt="Revealed Product"
              className="w-32 sm:w-40 md:w-48 lg:w-56 h-auto mb-6 drop-shadow-lg rounded-lg transition-all duration-500 animate-fadeIn"
            />

            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto font-light">
              The product has been revealed.
            </p>

            <button
              onClick={() => setShowCelebration(false)}
              className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl transition-all duration-300 font-light hover:scale-105 shadow-lg text-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Celebration Particles (Stars) — Optional, fits theme */}
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
            size={14}
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
          animation: fadeIn 0.8s ease-out forwards;
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

export default BigScreen;