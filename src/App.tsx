import { useState, useEffect } from 'react';
import UserPage from './UserPage';
import BigScreen from './BigScreen';
import ResetPage from './ResetPage';
import logo from './logo/casa.png';

function App() {
  const [currentPage, setCurrentPage] = useState<'user' | 'bigscreen' | 'reset'>('user');
  const [transitionKey, setTransitionKey] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Simple URL-based routing
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/bigscreen' || path === '/bigscreen/') {
      setCurrentPage('bigscreen');
    } else if (path === '/reset' || path === '/reset/') {
      setCurrentPage('reset');
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
      } else if (path === '/reset' || path === '/reset/') {
        setCurrentPage('reset');
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

  const navigateToReset = () => {
    setCurrentPage('reset');
    setTransitionKey(prev => prev + 1);
    window.history.pushState({}, '', '/reset');
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
            
            <button
              onClick={navigateToReset}
              className={`
                w-full text-left px-4 py-3 rounded-xl font-light text-sm transition-all duration-300
                ${currentPage === 'reset'
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              Reset Launch
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
          {currentPage === 'user' ? <UserPage /> : 
           currentPage === 'bigscreen' ? <BigScreen /> : 
           <ResetPage />}
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