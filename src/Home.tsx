// src/Home.tsx
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-800 text-center p-6 relative overflow-hidden font-sans">

      {/* Elegant Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating orange orbs */}
        <div className="absolute top-20 left-10 w-80 h-80 bg-orange-50 rounded-full blur-3xl opacity-70"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gray-100 rounded-full blur-2xl opacity-30"></div>

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-3xl mx-auto">

        {/* Title — Elegant Orange Gradient */}
        <h1 className="text-5xl md:text-6xl font-light mb-6 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-700 bg-clip-text text-transparent">
          Welcome to the Launch Event
        </h1>

        {/* Description — Clean & Professional */}
        <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
          Be part of something exciting. Join the event and witness the reveal with just{" "}
          <span className="font-light text-orange-600">3 participants</span>.
        </p>

        {/* CTA Button — Vibrant Orange Popper Style */}
        <Link
          to="/launch"
          className="px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:to-orange-800 text-white font-light text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          Go to Launch Page
        </Link>

      </div>
    </div>
  );
}

export default Home;