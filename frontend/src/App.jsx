import React from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { useNavigate } from "react-router-dom";
import AnimatedBackground from "./components/AnimatedBackground";

function App() {
  const navigate = useNavigate();
  React.useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 overflow-hidden relative">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4 pt-20">
          <header className="w-full max-w-3xl mx-auto text-center py-8">
            <h1 className="text-4xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 mb-4 tracking-tighter">
              TableTalk
            </h1>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Transform customer feedback into actionable insights with AI-powered analytics
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center mt-6">
              <a href="/login" className="px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-purple-500/30 hover:from-purple-700 hover:to-cyan-700 transition-all duration-300">
                Login
              </a>
              <a href="/register" className="px-8 py-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700 text-gray-200 rounded-xl font-bold text-lg shadow-lg hover:bg-gray-700/50 transition-all duration-300">
                Sign Up
              </a>
            </div>
          </header>
          <main className="w-full max-w-6xl mx-auto grid md:grid-cols-3 gap-8 mt-16 mb-20">
            {[
              {
                title: "Real-time Feedback",
                description: "Customers provide instant feedback via QR codes",
                icon: "📱"
              },
              {
                title: "Analytics",
                description: "Sentiment analysis and keyword extraction",
                icon: "🤖"
              },
              {
                title: "Actionable Insights",
                description: "Get personalized improvement suggestions",
                icon: "📊"
              }
            ].map((feature, idx) => (
              <div 
                key={idx}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </main>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default App;