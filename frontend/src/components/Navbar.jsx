// Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleTitleClick = (e) => {
    e.preventDefault();
    navigate(user ? "/dashboard" : "/");
  };

  return (
    <>
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 opacity-95"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-purple-900/10 to-transparent"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDUwMCA1MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxIiBmaWxsPSIjN0QzM0FFIiBmaWxsLW9wYWNpdHk9IjAuMSIgLz4KICA8Y2lyY2xlIGN4PSIzMDAiIGN5PSIzMDAiIHI9IjIiIGZpbGw9IiM3RDMzQUUiIGZpbGwtb3BhY2l0eT0iMC4xIiAvPgo8L3N2Zz4=')] bg-[length:20px_20px] opacity-10"></div>
      </div>

      <nav className={`w-full fixed top-0 left-0 px-4 py-3 z-50 transition-all duration-300 ${scrolled ? "backdrop-blur-md bg-black/30 shadow-xl" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Desktop layout */}
          <div className="flex items-center gap-4">
            <a 
              href="#" 
              onClick={handleTitleClick} 
              className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 tracking-tight"
            >
              TableTalk
            </a>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            {user && (
              <>
                <Link 
                  to="/dashboard" 
                  className={`font-medium px-2 py-1 rounded-lg transition-all ${location.pathname.startsWith("/dashboard") 
                    ? "text-white bg-gradient-to-r from-purple-600 to-cyan-600 shadow-lg shadow-purple-500/20" 
                    : "text-gray-300 hover:text-white hover:bg-gray-800/50"}`}
                >
                  Home
                </Link>
                <Link 
                  to="/analytics" 
                  className={`font-medium px-2 py-1 rounded-lg transition-all ${location.pathname.startsWith("/analytics") 
                    ? "text-white bg-gradient-to-r from-purple-600 to-cyan-600 shadow-lg shadow-purple-500/20" 
                    : "text-gray-300 hover:text-white hover:bg-gray-800/50"}`}
                >
                  Analytics
                </Link>
              </>
            )}
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:bg-gray-700/50 transition-all group">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 flex items-center justify-center text-white font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <span className="font-medium text-gray-200 group-hover:text-white">{user.name}</span>
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
                <div className="absolute right-0 mt-2 w-56 bg-gray-800/80 backdrop-blur-lg border border-gray-700 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-300 z-10 overflow-hidden">
                  <div className="px-4 py-3 text-gray-300 border-b border-gray-700">{user.email}</div>
                  <button 
                    onClick={handleLogout} 
                    className="w-full text-left px-4 py-3 text-gray-300 hover:bg-red-600/20 hover:text-white flex items-center gap-2 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                    Log out
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative flex w-64 h-12 bg-gray-800/40 rounded-xl overflow-hidden border border-gray-700">
                {/* Sliding window highlight */}
                <div
                  className={`absolute top-1 left-1 h-10 w-[calc(50%-0.5rem)] rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 shadow-lg shadow-purple-500/20 transition-all duration-500 ease-in-out z-0`}
                  style={{ transform: location.pathname === "/login" ? "translateX(0)" : "translateX(100%)" }}
                ></div>
                {/* Buttons */}
                <Link
                  to="/login"
                  className={`flex-1 z-10 flex items-center justify-center font-medium transition-colors duration-300 rounded-lg relative ${location.pathname === "/login" ? "text-white" : "text-gray-300 hover:text-white"}`}
                  style={{ minWidth: 0 }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`flex-1 z-10 flex items-center justify-center font-medium transition-colors duration-300 rounded-lg relative ${location.pathname === "/register" ? "text-white" : "text-gray-300 hover:text-white"}`}
                  style={{ minWidth: 0 }}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 rounded-lg focus:outline-none bg-gray-800/50 border border-gray-700" 
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
        
        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-gray-900/95 backdrop-blur-xl border-t border-gray-800 flex flex-col gap-1 py-4 px-4 animate-fade-in z-50">
            {user && (
              <>
                <Link 
                  to="/dashboard" 
                  onClick={() => setMenuOpen(false)}
                  className={`font-medium px-4 py-3 rounded-lg transition-all ${location.pathname.startsWith("/dashboard") 
                    ? "text-white bg-gradient-to-r from-purple-600 to-cyan-600" 
                    : "text-gray-300 hover:text-white hover:bg-gray-800/50"}`}
                >
                  Home
                </Link>
                <Link 
                  to="/analytics" 
                  onClick={() => setMenuOpen(false)}
                  className={`font-medium px-4 py-3 rounded-lg transition-all ${location.pathname.startsWith("/analytics") 
                    ? "text-white bg-gradient-to-r from-purple-600 to-cyan-600" 
                    : "text-gray-300 hover:text-white hover:bg-gray-800/50"}`}
                >
                  Analytics
                </Link>
              </>
            )}
            
            <div className="border-t border-gray-800 my-2"></div>
            
            {user ? (
              <div className="flex flex-col gap-2 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 flex items-center justify-center text-white font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-200">{user.name}</div>
                    <div className="text-gray-400 text-sm">{user.email}</div>
                  </div>
                </div>
                <button 
                  onClick={() => { setMenuOpen(false); handleLogout(); }} 
                  className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-600/20 hover:text-white rounded-lg mt-2 flex items-center gap-2 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                  Log out
                </button>
              </div>
            ) : (
              <>
                <Link 
                  to="/login" 
                  onClick={() => setMenuOpen(false)} 
                  className="text-gray-300 hover:text-white px-4 py-3 rounded-lg hover:bg-gray-800/50 transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  onClick={() => setMenuOpen(false)} 
                  className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-4 py-3 rounded-lg font-medium mt-2 hover:from-purple-700 hover:to-cyan-700 transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </>
  );
}

export default Navbar;