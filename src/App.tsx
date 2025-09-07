import { useState, useEffect } from 'react';
import UserPage from './UserPage';
import BigScreen from './BigScreen';
import logo from './logo/casa.png';

function App() {
  const [currentPage, setCurrentPage] = useState<'user' | 'bigscreen'>('user');
  const [transitionKey, setTransitionKey] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    setIsMenuOpen(false);
  };

  const navigateToBigScreen = () => {
    setCurrentPage('bigscreen');
    setTransitionKey(prev => prev + 1);
    window.history.pushState({}, '', '/bigscreen');
    setIsMenuOpen(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const nav = document.querySelector('nav');
      if (isMenuOpen && nav && !nav.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans">
      {/* Navigation Bar — Clean & Elegant */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo / Title */}
            <div className="flex items-center space-x-3">
              <img src={logo} alt="Logo" className="h-10 w-auto drop-shadow-lg" />
              <h1 className="text-xl md:text-2xl font-light bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                LOGO Launch
              </h1>
            </div>

            {/* Desktop Navigation - Hidden on mobile */}
            <div className="hidden md:flex space-x-3">
              <button
                onClick={navigateToUserPage}
                className={`
                  px-5 py-2.5 rounded-xl font-light text-sm transition-all duration-300
                  ${currentPage === 'user'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md hover:shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                  }
                `}
              >
                User Page
              </button>

              <button
                onClick={navigateToBigScreen}
                className={`
                  px-5 py-2.5 rounded-xl font-light text-sm transition-all duration-300
                  ${currentPage === 'bigscreen'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md hover:shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                  }
                `}
              >
                Big Screen
              </button>
            </div>

            {/* Mobile menu button - Visible only on mobile */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
              >
                <div className="w-6 h-6 flex flex-col justify-center items-center">
                  <span className={`block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm bg-current ${isMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'}`}></span>
                  <span className={`block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm bg-current my-1 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                  <span className={`block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm bg-current ${isMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'}`}></span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - Slides in from top */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-4 py-3 space-y-2 bg-white/95 backdrop-blur-sm border-t border-gray-100">
            <button
              onClick={navigateToUserPage}
              className={`
                w-full text-left px-4 py-3 rounded-xl font-light text-sm transition-all duration-300
                ${currentPage === 'user'
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              User Page
            </button>

            <button
              onClick={navigateToBigScreen}
              className={`
                w-full text-left px-4 py-3 rounded-xl font-light text-sm transition-all duration-300
                ${currentPage === 'bigscreen'
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              Big Screen
            </button>
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