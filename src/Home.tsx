// src/Home.tsx
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white text-center p-6">
      <h1 className="text-6xl font-extrabold mb-6 bg-gradient-to-r from-yellow-400 via-pink-500 to-red-500 bg-clip-text text-transparent animate-pulse">
        🚀 Welcome to the Launch Event
      </h1>
      <p className="text-xl text-white/80 mb-12 max-w-2xl">
        Be part of something exciting! Join the event and witness the reveal with just{" "}
        <span className="font-bold text-yellow-400">3 participants</span>.
      </p>

      <Link
        to="/launch"
        className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 hover:scale-110 active:scale-95 transition-all duration-300 shadow-lg font-bold text-lg"
      >
        Go to Launch Page 🚀
      </Link>
    </div>
  );
}

export default Home;
