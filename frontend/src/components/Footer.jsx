// Footer.jsx
import React from "react";

function Footer() {
  return (
    <footer className="w-full text-center py-2 bg-gradient-to-t from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900 text-gray-600 dark:text-gray-200 text-xs fixed bottom-0 left-0 z-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-2">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDUwMCA1MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxIiBmaWxsPSIjN0QzM0FFIiBmaWxsLW9wYWNpdHk9IjAuMSIgLz4KICA8Y2lyY2xlIGN4PSIzMDAiIGN5PSIzMDAiIHI9IjIiIGZpbGw9IiM3RDMzQUUiIGZpbGwtb3BhY2l0eT0iMC4xIiAvPgo8L3N2Zz4=')] bg-[length:30px_30px] opacity-10"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 mb-1">
            <div className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 tracking-tight">
              TableTalk
            </div>
            <div className="flex gap-4">
              <a href="#" className="text-gray-600 dark:text-gray-200 hover:text-gray-800 dark:hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-gray-600 dark:text-gray-200 hover:text-gray-800 dark:hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-gray-600 dark:text-gray-200 hover:text-gray-800 dark:hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 w-full my-1"></div>
          <p className="dark:text-gray-200 text-gray-700">&copy; {new Date().getFullYear()} TableTalk. All rights reserved.</p>
          <p className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">Customer feedback analytics for modern restaurants</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;