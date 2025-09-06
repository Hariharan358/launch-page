import { useState, useEffect } from 'react';
import UserPage from './UserPage';
import BigScreen from './BigScreen';

function App() {
  const [currentPage, setCurrentPage] = useState<'user' | 'bigscreen'>('user');

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
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Navigation functions
  const navigateToUserPage = () => {
    setCurrentPage('user');
    window.history.pushState({}, '', '/');
  };

  const navigateToBigScreen = () => {
    setCurrentPage('bigscreen');
    window.history.pushState({}, '', '/bigscreen');
  };


  return (
    <div className="min-h-screen">
      {/* Navigation bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white">LOGO Launch</h1>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={navigateToUserPage}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  currentPage === 'user'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                User Page
              </button>
              <button
                onClick={navigateToBigScreen}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  currentPage === 'bigscreen'
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                Big Screen
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <div className="pt-16">
        {currentPage === 'user' ? <UserPage /> : <BigScreen />}
      </div>
    </div>
  );
}

export default App;