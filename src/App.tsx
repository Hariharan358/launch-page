import { useState, useEffect } from 'react';
import UserPage from './UserPage';
import BigScreen from './BigScreen';

function App() {
  const [currentPage, setCurrentPage] = useState<'user' | 'bigscreen'>('user');
  const [transitionKey, setTransitionKey] = useState(0);

  // Simple URL-based routing
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/bigscreen' || path === '/bigscreen/') {
      setCurrentPage('bigscreen');
    } else {
      setCurrentPage('user');
    }
  }, []);

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/bigscreen' || path === '/bigscreen/') {
        setCurrentPage('bigscreen');
      } else {
        setCurrentPage('user');
      }
      setTransitionKey(prev => prev + 1); // trigger animation
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Navigation functions
  const navigateToUserPage = () => {
    setCurrentPage('user');
    setTransitionKey(prev => prev + 1);
    window.history.pushState({}, '', '/');
  };

  const navigateToBigScreen = () => {
    setCurrentPage('bigscreen');
    setTransitionKey(prev => prev + 1);
    window.history.pushState({}, '', '/bigscreen');
  };

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Navigation Bar — Clean & Elegant */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo / Title */}
            <div className="flex items-center space-x-3">
              <h1 className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent hidden sm:block">
                LOGO Launch
              </h1>
            </div>

            {/* Navigation Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={navigateToUserPage}
                className={`
                  px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300
                  ${currentPage === 'user'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md hover:shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                  }
                  focus:outline-none focus:ring-2 focus:ring-orange-300
                `}
              >
                User Page
              </button>

              <button
                onClick={navigateToBigScreen}
                className={`
                  px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300
                  ${currentPage === 'bigscreen'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md hover:shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                  }
                  focus:outline-none focus:ring-2 focus:ring-orange-300
                `}
              >
                Big Screen
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content — with transition */}
      <div className="pt-20">
        <div
          key={transitionKey} // ensures re-render triggers animation
          className="animate-fadeSlide"
        >
          {currentPage === 'user' ? <UserPage /> : <BigScreen />}
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeSlide {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeSlide {
          animation: fadeSlide 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default App;
