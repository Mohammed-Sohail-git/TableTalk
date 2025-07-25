import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import AnimatedBackground from "../components/AnimatedBackground";


function FeedbackForm() {
  const { restaurantId, tableNumber } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [ratings, setRatings] = useState({ service: 0, food: 0, ambiance: 0, value: 0 });
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  useEffect(() => {
    fetchRestaurant();
  }, [restaurantId]);

  const fetchRestaurant = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/restaurants/${restaurantId}`);
      const data = await res.json();
      setRestaurant(data);
    } catch {
      setRestaurant(null);
    }
  };

  const handleRating = (aspect, value) => {
    setRatings((prev) => ({ ...prev, [aspect]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    if (!customerName.trim()) {
      setError("Name is required");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNumber,
          ratings,
          comments,
          restaurant: restaurantId,
          customerName,
          customerPhone,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit feedback");
      setSuccess(true);
      window.dispatchEvent(new Event("feedback-submitted"));
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <AnimatedBackground />
        <div className="relative z-10">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-3xl shadow-2xl p-10 w-full max-w-md text-center backdrop-blur-sm">
            <div className="text-6xl mb-6 animate-bounce">🎉</div>
            <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 mb-4">
              Thank You!
            </h2>
            <p className="text-gray-300 text-lg">
              Your feedback helps us create better experiences
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      <AnimatedBackground />
      <div className="relative z-10">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-3xl shadow-2xl p-8 w-full max-w-lg backdrop-blur-sm">
          <div className="flex flex-col items-start mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m0 0H3" /></svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{restaurant ? restaurant.name : "Loading..."}</div>
                <div className="flex items-center gap-2 text-gray-400 mt-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span>{restaurant && restaurant.location ? restaurant.location : "Location loading..."}</span>
                </div>
              </div>
            </div>
            <div className="mt-2 text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
              Table {tableNumber}
            </div>
          </div>
          
          <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <RatingCard label="Service" value={ratings.service} onChange={(v) => handleRating("service", v)} color="purple" icon="✨" />
              <RatingCard label="Food" value={ratings.food} onChange={(v) => handleRating("food", v)} color="pink" icon="🍽️" />
              <RatingCard label="Ambiance" value={ratings.ambiance} onChange={(v) => handleRating("ambiance", v)} color="blue" icon="🎶" />
              <RatingCard label="Value" value={ratings.value} onChange={(v) => handleRating("value", v)} color="cyan" icon="💸" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 font-semibold mb-2">Your Name</label>
                <input
                  className="bg-gray-700/50 border-2 border-gray-600 rounded-xl px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition text-white placeholder-gray-500"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="Name"
                  type="text"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 font-semibold mb-2">Phone <span className="text-gray-500 text-sm">(optional)</span></label>
                <input
                  className="bg-gray-700/50 border-2 border-gray-600 rounded-xl px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition text-white placeholder-gray-500"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="Phone (optional)"
                  type="tel"
                  pattern="[0-9]{10,15}"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-300 font-semibold mb-2">Comments</label>
              <textarea
                className="bg-gray-700/50 border-2 border-gray-600 rounded-xl px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition text-white placeholder-gray-500"
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Share your experience..."
                required
              />
            </div>
            
            <button 
              type="submit" 
              disabled={submitting} 
              className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:from-purple-700 hover:to-cyan-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                  Submitting...
                </>
              ) : "Submit Feedback"}
            </button>
            
            {error && <div className="text-red-400 text-center text-sm mt-2">{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );
}

function RatingCard({ label, value, onChange, color, icon }) {
  const colorClasses = {
    purple: "from-purple-900/30 to-purple-800/20 border-purple-700",
    pink: "from-pink-900/30 to-pink-800/20 border-pink-700",
    blue: "from-blue-900/30 to-blue-800/20 border-blue-700",
    cyan: "from-cyan-900/30 to-cyan-800/20 border-cyan-700"
  };
  
  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-2xl p-4 backdrop-blur-sm relative`}>
      <span className="absolute top-3 right-3 text-2xl">{icon}</span>
      <span className="font-semibold text-gray-300 mb-3 block">{label}</span>
      <div className="flex gap-1 justify-center">
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            type="button"
            className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-lg font-bold transition-all ${
              value >= v 
                ? "bg-gradient-to-br from-purple-500 to-cyan-500 text-white border-transparent shadow-lg shadow-purple-500/20" 
                : "bg-gray-700/50 text-gray-400 border-gray-600 hover:bg-gray-600"
            }`}
            onClick={() => onChange(v)}
            aria-label={`${label} ${v}`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

export default FeedbackForm;