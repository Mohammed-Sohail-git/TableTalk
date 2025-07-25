import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import AnimatedBackground from "../components/AnimatedBackground";
import Footer from "../components/Footer";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard"); // Placeholder for dashboard route
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-900 dark:to-gray-950 pb-24">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4 pt-24">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-8 w-full max-w-2xl min-w-[350px] md:min-w-[400px] lg:min-w-[500px] backdrop-blur-sm mx-auto flex flex-col justify-center">
            
            <h2 className="text-2xl font-bold text-center mb-8">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
                Login to TableTalk
              </span>
            </h2>
            
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full bg-gray-700/50 border-2 border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition text-white placeholder-gray-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-gray-700/50 border-2 border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition text-white placeholder-gray-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white py-3 rounded-xl font-bold mt-2 hover:from-purple-700 hover:to-cyan-700 transition-all shadow-lg shadow-purple-500/20"
              >
                Login
              </button>
            </form>
            
            {error && <div className="mt-4 text-red-400 text-center">{error}</div>}
            
            <p className="mt-6 text-center text-gray-400">
              New here?{" "}
              <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-medium">
                Create an account
              </Link>
            </p>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default Login;