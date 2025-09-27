import { useState, useEffect, useRef } from 'react';
import { Star } from 'lucide-react';
import launch from "./logo/launch.png";

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
  const [isCountdown, setIsCountdown] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [isVideo, setIsVideo] = useState(false);
  const [sequenceStarted, setSequenceStarted] = useState(false);
  const countdownAudioRef = useRef<HTMLAudioElement | null>(null);
  const waitingAudioRef = useRef<HTMLAudioElement | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const connectionAttemptsRef = useRef(0);
  // Waiting audio fallback logic
  const [waitingAudioBlocked, setWaitingAudioBlocked] = useState(false);
  const [waitingAudioPlaying, setWaitingAudioPlaying] = useState(false);

  useEffect(() => {
    const audio = waitingAudioRef.current;
    if (!audio) return;
    if (!launchState.isLaunched && !isCountdown && !isVideo && !showCelebration) {
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise
          .then(() => {
            setWaitingAudioBlocked(false);
            setWaitingAudioPlaying(true);
          })
          .catch(() => {
            setWaitingAudioBlocked(true);
            setWaitingAudioPlaying(false);
          });
      } else {
        setWaitingAudioPlaying(true);
        setWaitingAudioBlocked(false);
      }
    } else {
      try {
        audio.pause();
        audio.currentTime = 0;
        setWaitingAudioPlaying(false);
      } catch {}
    }
  }, [launchState.isLaunched, isCountdown, isVideo, showCelebration]);

  // Manual play handler for blocked autoplay
  const handlePlayWaitingAudio = () => {
    const audio = waitingAudioRef.current;
    if (audio) {
      audio.play()
        .then(() => {
          setWaitingAudioBlocked(false);
          setWaitingAudioPlaying(true);
        })
        .catch(() => {
          setWaitingAudioBlocked(true);
          setWaitingAudioPlaying(false);
        });
    }
  };

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

  // Lock page scroll while celebration overlay is visible
  useEffect(() => {
    if (showCelebration) {
      const prevHtmlOverflow = document.documentElement.style.overflow;
      const prevBodyOverflow = document.body.style.overflow;
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      return () => {
        document.documentElement.style.overflow = prevHtmlOverflow;
        document.body.style.overflow = prevBodyOverflow;
      };
    }
  }, [showCelebration]);

  // Handle countdown background music
  useEffect(() => {
    const audio = countdownAudioRef.current;
    if (!audio) return;
    if (isCountdown) {
      // Try to play; some browsers may block without user gesture
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.catch(() => {
          // Autoplay blocked; ignore silently
        });
      }
    } else {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {}
    }
  }, [isCountdown]);

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
        ;(window as any).__globalLaunchWS = websocket;
      };

      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setLaunchState(data);

        // If launch is already complete and page is reloaded, play video sequence
        if (data.isLaunched && !sequenceStarted) {
          setSequenceStarted(true);
          // If page is loaded and launch is already done, play video
          if (!isCountdown && !isVideo && !showCelebration) {
            setIsCountdown(true);
            setCountdown(10);
            let remaining = 10;
            const timer = setInterval(() => {
              remaining -= 1;
              setCountdown(remaining);
              if (remaining <= 0) {
                clearInterval(timer);
                setIsCountdown(false);
                setIsVideo(true);
              }
            }, 1000);
          }
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
  }, [isCountdown, isVideo, showCelebration, sequenceStarted]);

  const progressPercentage = (launchState.clickCount / 20) * 100;
  const isNearLaunch = launchState.clickCount >= 18;

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans relative overflow-hidden">

      {/* Waiting background music (looped) */}
      <audio
        ref={waitingAudioRef}
        src="/waiting-audio.mp3"
        loop
        preload="auto"
        style={{ display: 'none' }}
      />
      {/* Fallback play button is now below status message in main content */}

      {/* Main Content */}
      <div className="max-w-3xl mx-auto text-center relative z-10 pt-16 pb-10 px-4">

        {/* Logo Placeholder */}
        <div className="mb-8">
          <img src="/casa.png" alt="Logo" className="h-16 mx-auto mb-2" />
          <h2
            className={`text-3xl md:text-4xl font-bold mb-2 transition-colors duration-200 ${!isCountdown && !isVideo && !showCelebration && waitingAudioBlocked ? 'text-gray-500 cursor-pointer' : waitingAudioPlaying ? 'text-orange-600' : 'text-gray-800'}`}
            onClick={() => {
              if (!isCountdown && !isVideo && !showCelebration && waitingAudioBlocked) {
                handlePlayWaitingAudio();
              }
            }}
            title={waitingAudioBlocked ? 'Click to play waiting music' : undefined}
          >
            LAUNCH EVENT
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-lg mx-auto leading-relaxed font-light">
            Watch as we reveal our new mission when <span className="font-light text-orange-600">20 participants</span> join the launch.
          </p>
        </div>

        {/* Progress Circle - Elegant Orange Theme */}
        <div className="mb-8">
            <div className="mb-8 flex flex-col items-center justify-center">
              <div className="relative w-64 h-64 flex items-center justify-center mb-4">
                <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 100 100">
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
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {!launchState.isLaunched ? (
                    <>
                      <div className={`text-xl font-light transition-all duration-500 ${isNearLaunch ? 'text-orange-600 scale-110 animate-pulse' : 'text-gray-700'}`}> 
                        {isNearLaunch ? "READY TO REVEAL" : "WAITING"}
                      </div>
                      <div className="text-sm text-gray-500 mt-2 font-light">
                        {launchState.clickCount} of 20 participants
                      </div>
                    </>
                  ) : (
                    <img
                      src={launch}
                      alt="Revealed Product"
                      className="h-40 md:h-48 mb-1 drop-shadow-sm rounded-lg transition-all duration-500 animate-fadeIn"
                    />
                  )}
                </div>
              </div>
            </div>
          {/* Progress Bar */}
          {/* <div className="w-full max-w-md mx-auto bg-gray-100 rounded-full h-2 overflow-hidden relative">
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
          </div> */}

          {/* Status Message + Waiting Music Button */}
          <div className="mt-3 text-gray-600 text-base font-light flex flex-col items-center">
            {!launchState.isLaunched ? (
              <>
                {launchState.clickCount >= 19 ? (
                  <span className="font-light text-orange-600">Launch sequence activated — one more to go</span>
                ) : launchState.clickCount >= 15 ? (
                  <span className="font-light text-orange-600">Almost there! Only {20 - launchState.clickCount} left</span>
                ) : (
                  <span>Waiting for participants to join the launch</span>
                )}
                {/* Play music option is now in the heading above */}
              </>
            ) : (
              <span className="font-light text-green-600">Mission accomplished</span>
            )}
          </div>
        </div>

        {/* 👇 Large Product Reveal Below Progress Circle */}
        {/* {launchState.isLaunched && (
          <div className="mb-8 flex flex-col items-center justify-center animate-fadeIn px-4">
            <img
              src={launch}
              alt="Revealed Product"
              className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-lg xl:max-w-lg h-auto mb-4 drop-shadow-xl rounded-xl transition-all duration-700 hover:scale-105 border border-gray-100"
            />
            <p className="text-gray-600 font-light text-sm max-w-sm text-center">
              The product has been successfully revealed to the world.
            </p>
          </div>
        )} */}


        {/* Waiting Message — only shown before launch */}
        {!launchState.isLaunched && (
          <div className="mt-12">
            {/* <div className="text-2xl font-light text-gray-700 mb-2">
              Waiting for participants
            </div> */}
            <h4 className="text-gray-500 font-light">
              The mission will be revealed when 20 people click the launch button
            </h4>
          </div>
        )}
      </div>

      {/* Countdown Overlay */}
      {isCountdown && (
        <div className="fixed inset-0 bg-gradient-to-t from-orange-200/95 via-orange-00 to-white/100 backdrop-blur-sm flex items-center justify-center z-50">
          {/* Background music during countdown */}
          <audio ref={countdownAudioRef} src="/music.mp3" loop preload="auto" />
          <div className="text-center px-6">
            <div className="text-5xl md:text-7xl font-light text-gray-900 mb-3">Launching in</div>
            <div className="text-7xl md:text-9xl font-light text-orange-600 animate-fadeIn">{countdown}</div>
          </div>
        </div>
      )}

      {/* Intro Video Overlay */}
      {isVideo && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="w-full max-w-5xl px-4 text-center">
            <video
              className="w-full h-auto max-h-[80vh] rounded-xl shadow-2xl object-contain mx-auto"
              autoPlay
              
              playsInline
              preload="auto"
              controls={false}
              onEnded={() => {
                setIsVideo(false);
                setShowCelebration(true);
                // notify server that reveal is complete so users can also show logo
                try {
                  const ws = (window as any).__globalLaunchWS as WebSocket | undefined;
                  ws?.readyState === 1 && ws.send(JSON.stringify({ type: 'reveal_now' }));
                } catch {}
              }}
              onError={() => {
                setIsVideo(false);
                setShowCelebration(true);
                try {
                  const ws = (window as any).__globalLaunchWS as WebSocket | undefined;
                  ws?.readyState === 1 && ws.send(JSON.stringify({ type: 'reveal_now' }));
                } catch {}
              }}
            >
              {/* Cloudinary video source */}
              <source src="/intro.mp4" type="video/mp4" />
              {/* Fallback sources */}
              <source src="/intro.mp4" type="video/mp4" />
            </video>

            {/* Skip button in case autoplay is blocked or file missing */}
            <button
              className="mt-4 px-4 py-2 text-sm bg-white/10 hover:bg-white/20 text-white rounded-3xl transition"
              onClick={() => { setIsVideo(false); setShowCelebration(true); }}
            >
              X
            </button>
          </div>
        </div>
      )}

      {/* Celebration Overlay — Elegant & Vibrant */}
{showCelebration && (
  <div className="fixed inset-0 bg-gradient-to-t from-orange-200/95 via-orange-00 to-white backdrop-blur-sm flex items-center justify-center z-50">

    {/* Confetti Poppers */}
    {[...Array(50)].map((_, i) => (
      <div
        key={i}
        className="absolute w-3 h-3 animate-confetti pointer-events-none"
        style={{
          left: `${Math.random() * 100}%`,
          top: '-10px',
          backgroundColor: ['#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#10b981', '#f97316'][Math.floor(Math.random() * 6)],
          animationDelay: `${Math.random() * 2}s`,
          animationDuration: `${2 + Math.random() * 2}s`
        }}
      />
    ))}

    {/* Celebration Content */}
    <div className="text-center relative z-10 px-4 max-w-3xl w-full max-h-[90vh] overflow-hidden">
      

      {/* ✅ FIXED: Added `block` to make mx-auto work */}
      <div className="flex justify-center mb-5">
        <img
          src={launch}
          alt="Revealed Product"
          className="w-72 sm:w-80 md:w-[22rem] lg:w-[26rem] xl:w-[30rem] h-auto drop-shadow-lg rounded-lg transition-all duration-500 animate-fadeIn"
        />
      </div>

    

      <button
        onClick={() => setShowCelebration(false)}
        className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl transition-all duration-300 font-light hover:scale-105 shadow-lg text-base"
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
      `}</style>
    </div>
  );
}

export default BigScreen;