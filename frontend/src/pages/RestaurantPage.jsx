import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Sentiment from "sentiment";
import AnimatedBackground from "../components/AnimatedBackground";

const tabs = ["Dashboard", "Manage", "Reports"];

function RestaurantPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/api/restaurants/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setRestaurant(data);
      } catch (err) {
        setRestaurant(null);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurant();
  }, [id]);

  // Move fetchFeedback outside so it can be called from event
  const fetchFeedback = async () => {
    if (!restaurant) return;
    setFeedbackLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/feedback/restaurant/${restaurant._id}`);
      const data = await res.json();
      setFeedback(data);
    } catch {
      setFeedback([]);
    } finally {
      setFeedbackLoading(false);
    }
  };

  useEffect(() => {
    if (!restaurant) return;
    fetchFeedback();
    const handleFeedbackSubmitted = () => {
      fetchFeedback();
    };
    window.addEventListener("feedback-submitted", handleFeedbackSubmitted);
    return () => window.removeEventListener("feedback-submitted", handleFeedbackSubmitted);
  }, [restaurant]);

  // --- Analytics logic ---
  const sentiment = new Sentiment();
  const summary = React.useMemo(() => {
    if (!feedback.length) return null;
    // Average ratings
    const avg = { service: 0, food: 0, ambiance: 0, value: 0 };
    feedback.forEach(fb => {
      Object.keys(avg).forEach(k => { if (fb.ratings && fb.ratings[k]) avg[k] += fb.ratings[k]; });
    });
    Object.keys(avg).forEach(k => { avg[k] = (avg[k] / feedback.length).toFixed(2); });
    // Sentiment
    let pos = 0, neg = 0, neu = 0;
    let allComments = [];
    let keywords = {};
    feedback.forEach(fb => {
      if (fb.comments) {
        allComments.push(fb.comments);
        const s = sentiment.analyze(fb.comments).score;
        if (s > 0) pos++; else if (s < 0) neg++; else neu++;
        // Keyword extraction (simple split, can use NLP lib)
        fb.comments.split(/\W+/).forEach(word => {
          if (word.length > 3) keywords[word.toLowerCase()] = (keywords[word.toLowerCase()] || 0) + 1;
        });
      }
    });
    // Top keyword
    const topKeyword = Object.entries(keywords).sort((a,b)=>b[1]-a[1])[0]?.[0] || "-";
    // Overall sentiment
    const total = pos + neg + neu;
    let sentimentLabel = "Neutral", sentimentIcon = "😐";
    if (pos/total > 0.6) { sentimentLabel = "Positive"; sentimentIcon = "😊"; }
    else if (neg/total > 0.4) { sentimentLabel = "Negative"; sentimentIcon = "😞"; }
    // Suggestions (simple logic)
    const suggestions = [];
    if (avg.service < 4) suggestions.push("Improve service speed or friendliness");
    if (avg.food < 4) suggestions.push("Focus on food quality or temperature");
    if (avg.ambiance < 4) suggestions.push("Enhance ambiance or comfort");
    if (avg.value < 4) suggestions.push("Review pricing or value offers");
    if (!suggestions.length) suggestions.push("Keep up the great work!");
    // Recent feedback
    const recent = feedback.slice(0, 3);
    // Keyword cloud
    const keywordCloud = Object.entries(keywords).sort((a,b)=>b[1]-a[1]).slice(0,10);

    // Table-wise analytics
    const tableWise = [];
    const tables = {};
    feedback.forEach(fb => {
      const tableNum = fb.table?.tableNumber;
      if (!tableNum) return;
      if (!tables[tableNum]) tables[tableNum] = { ratings: [], sentiments: [] };
      if (fb.ratings) tables[tableNum].ratings.push(fb.ratings);
      const s = sentiment.analyze(fb.comments || "").score;
      tables[tableNum].sentiments.push(s);
    });
    Object.entries(tables).forEach(([tableNumber, obj]) => {
      const ratingsArr = obj.ratings;
      const sentimentsArr = obj.sentiments;
      const avgRating = ratingsArr.length ? (ratingsArr.reduce((sum, r) => sum + (Object.values(r).reduce((a,b)=>a+b,0)/4), 0) / ratingsArr.length).toFixed(2) : '-';
      const avgSentiment = sentimentsArr.length ? (sentimentsArr.reduce((a,b)=>a+b,0)/sentimentsArr.length) : 0;
      let sentimentLabel = "Neutral", sentimentIcon = "😐";
      if (avgSentiment > 0.6) { sentimentLabel = "Positive"; sentimentIcon = "😊"; }
      else if (avgSentiment < -0.4) { sentimentLabel = "Negative"; sentimentIcon = "😞"; }
      tableWise.push({ tableNumber, avgRating, sentimentLabel, sentimentIcon });
    });

    // Weekly trends
    const weekMap = {};
    feedback.forEach(fb => {
      const date = new Date(fb.createdAt);
      // Get ISO week string (YYYY-WW)
      const week = `${date.getFullYear()}-W${String(Math.ceil(((date - new Date(date.getFullYear(),0,1)) / 86400000 + new Date(date.getFullYear(),0,1).getDay()+1)/7)).padStart(2,'0')}`;
      if (!weekMap[week]) weekMap[week] = { ratings: [], sentiments: [] };
      if (fb.ratings) weekMap[week].ratings.push((fb.ratings.service + fb.ratings.food + fb.ratings.ambiance + fb.ratings.value) / 4);
      const s = sentiment.analyze(fb.comments || "").score;
      weekMap[week].sentiments.push(s);
    });
    const weeklyTrends = Object.entries(weekMap).sort(([a], [b]) => a.localeCompare(b)).map(([week, obj]) => {
      const avgRating = obj.ratings.length ? (obj.ratings.reduce((a,b)=>a+b,0)/obj.ratings.length).toFixed(2) : '-';
      const avgSentiment = obj.sentiments.length ? (obj.sentiments.reduce((a,b)=>a+b,0)/obj.sentiments.length) : 0;
      let sentimentLabel = "😐";
      if (avgSentiment > 0.6) sentimentLabel = "😊";
      else if (avgSentiment < -0.4) sentimentLabel = "😞";
      return { week, avgRating, sentimentLabel };
    });

    return { avg, topKeyword, sentimentLabel, sentimentIcon, suggestions, recent, keywordCloud, pos, neg, neu, tableWise, weeklyTrends };
  }, [feedback]);

   
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-900 dark:to-gray-950 pb-24">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navbar />
        <div className="flex-1 flex flex-col items-center p-4 pt-24">
          <div className="w-full max-w-6xl mx-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
                <div className="text-gray-400">Loading restaurant details...</div>
              </div>
            ) : restaurant ? (
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 flex flex-col md:flex-row items-start gap-6 mb-8 backdrop-blur-sm shadow-lg">
                {restaurant.photo ? (
                  <img src={restaurant.photo} alt={restaurant.name} className="w-32 h-32 object-cover rounded-2xl" />
                ) : (
                  <div className="bg-gray-700 border border-gray-600 rounded-2xl w-32 h-32 flex items-center justify-center">
                    <span className="text-4xl">🍽️</span>
                  </div>
                )}
                <div className="flex-1">
                  <div className="text-2xl font-bold text-white mb-1">{restaurant.name}</div>
                  <div className="text-cyan-400 mb-3">{restaurant.specialty}</div>
                  <div className="flex items-center text-gray-400 gap-2 mb-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    <span>{restaurant.location || 'N/A'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="text-gray-500 text-sm">Tables:</div>
                      <div className="text-white font-medium">{restaurant.numTables}</div>
                    </div>
                    {restaurant.type === "branch" && restaurant.branchNumber && (
                      <div className="flex items-center gap-2">
                        <div className="text-gray-500 text-sm">Branch:</div>
                        <div className="text-white font-medium">#{restaurant.branchNumber}</div>
                      </div>
                    )}
                    {restaurant.openingDate && (
                      <div className="flex items-center gap-2">
                        <div className="text-gray-500 text-sm">Opened:</div>
                        <div className="text-white font-medium">{new Date(restaurant.openingDate).toLocaleDateString()}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-red-400 text-center py-8">Restaurant not found.</div>
            )}
            
            {/* Sub-navbar */}
            {!loading && restaurant && (
              <div className="flex gap-2 border-b border-gray-700 mb-8 w-full">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    className={`px-5 py-3 font-semibold rounded-t-lg transition-all ${
                      activeTab === tab 
                        ? "bg-gray-800 text-purple-400 border-t-2 border-purple-500" 
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            )}
            
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 min-h-[500px] w-full backdrop-blur-sm shadow-lg">
              {activeTab === "Dashboard" && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Performance Dashboard</h2>
                  {feedbackLoading ? (
                    <div className="flex justify-center py-10">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                  ) : summary ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-gray-700/30 border border-gray-600 rounded-2xl p-5">
                          <div className="text-lg text-gray-300 mb-2">Average Rating</div>
                          <div className="text-4xl font-bold text-purple-400">
                            {((+summary.avg.service + +summary.avg.food + +summary.avg.ambiance + +summary.avg.value)/4).toFixed(2)}
                            <span className="text-2xl text-yellow-400">★</span>
                          </div>
                        </div>
                        
                        <div className="bg-gray-700/30 border border-gray-600 rounded-2xl p-5">
                          <div className="text-lg text-gray-300 mb-2">Top Keyword</div>
                          <div className="text-4xl font-bold text-pink-400">{summary.topKeyword}</div>
                        </div>
                        
                        <div className="bg-gray-700/30 border border-gray-600 rounded-2xl p-5">
                          <div className="text-lg text-gray-300 mb-2">Customer Sentiment</div>
                          <div className="text-3xl font-bold">
                            <span className="mr-2">{summary.sentimentIcon}</span>
                            <span className={summary.sentimentLabel === "Positive" ? "text-green-400" : summary.sentimentLabel === "Negative" ? "text-red-400" : "text-yellow-400"}>
                              {summary.sentimentLabel}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-8">
                        <div className="text-xl font-semibold text-white mb-4">Actionable Suggestions</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {summary.suggestions.map((s, i) => (
                            <div key={i} className="bg-gray-700/50 border border-gray-600 rounded-xl p-4 flex items-start gap-3">
                              <div className="bg-purple-500/10 text-purple-400 p-2 rounded-lg">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                              </div>
                              <div className="text-gray-300">{s}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-xl font-semibold text-white mb-4">Recent Feedback</div>
                        <div className="space-y-4">
                          {summary.recent.map((fb, i) => (
                            <div key={i} className="border-b border-gray-700 pb-4 last:border-0">
                              <div className="flex justify-between items-center mb-2">
                                <div className="font-medium text-white">{fb.customerName}</div>
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map(star => (
                                    <span key={star} className={`text-sm ${star <= 4 ? 'text-yellow-400' : 'text-gray-600'}`}>★</span>
                                  ))}
                                </div>
                              </div>
                              <p className="text-gray-400">{fb.comments}</p>
                              <div className="text-xs text-gray-500 mt-2">
                                {new Date(fb.createdAt).toLocaleString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : <div className="text-center py-10 text-gray-500">No feedback data available</div>}
                </div>
              )}
              
              {activeTab === "Manage" && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Manage Tables & QR Codes</h2>
                  <ManageTables restaurantId={id} />
                </div>
              )}
              
              {activeTab === "Reports" && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Weekly Analytics Report</h2>
                  {feedbackLoading ? (
                    <div className="flex justify-center py-10">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                  ) : summary ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-gray-700/30 border border-gray-600 rounded-2xl p-5">
                          <div className="text-lg text-gray-300 mb-3">Sentiment Analysis</div>
                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between">
                              <span className="text-green-400">😊 Positive</span>
                              <span className="dark:text-white">{summary.pos}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-yellow-400">😐 Neutral</span>
                              <span className="dark:text-white">{summary.neu}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-red-400">😞 Negative</span>
                              <span className="dark:text-white">{summary.neg}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-700/30 border border-gray-600 rounded-2xl p-5">
                          <div className="text-lg text-gray-300 mb-3">Category Ratings</div>
                          <div className="space-y-2">
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-gray-400">Service</span>
                                <span className="dark:text-white">{summary.avg.service}</span>
                              </div>
                              <div className="w-full bg-gray-600 rounded-full h-2">
                                <div 
                                  className="bg-purple-500 h-2 rounded-full" 
                                  style={{ width: `${summary.avg.service * 20}%` }}
                                ></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-gray-400">Food</span>
                                <span className="dark:text-white">{summary.avg.food}</span>
                              </div>
                              <div className="w-full bg-gray-600 rounded-full h-2">
                                <div 
                                  className="bg-pink-500 h-2 rounded-full" 
                                  style={{ width: `${summary.avg.food * 20}%` }}
                                ></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-gray-400">Ambiance</span>
                                <span className="dark:text-white">{summary.avg.ambiance}</span>
                              </div>
                              <div className="w-full bg-gray-600 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full" 
                                  style={{ width: `${summary.avg.ambiance * 20}%` }}
                                ></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-gray-400">Value</span>
                                <span className="dark:text-white">{summary.avg.value}</span>
                              </div>
                              <div className="w-full bg-gray-600 rounded-full h-2">
                                <div 
                                  className="bg-yellow-500 h-2 rounded-full" 
                                  style={{ width: `${summary.avg.value * 20}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-700/30 border border-gray-600 rounded-2xl p-5">
                          <div className="text-lg text-gray-300 mb-3">Keyword Frequency</div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {summary.keywordCloud.map(([word, count]) => (
                              <span 
                                key={word} 
                                className="px-3 py-1 rounded-full text-xs font-medium bg-gray-600/50 text-gray-300"
                              >
                                {word} <span className="text-purple-400">{count}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {summary.weeklyTrends && summary.weeklyTrends.length > 0 && (
                        <div className="mb-8">
                          <div className="text-xl font-semibold text-white mb-4">Weekly Trends</div>
                          <div className="overflow-x-auto">
                            <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow text-center">
                              <thead>
                                <tr>
                                  <th className="px-4 py-2 dark:text-white">Week</th>
                                  <th className="px-4 py-2 dark:text-white">Avg Rating</th>
                                  <th className="px-4 py-2 dark:text-white">Sentiment</th>
                                </tr>
                              </thead>
                              <tbody>
                                {summary.weeklyTrends.map((row, i) => (
                                  <tr key={row.week} className="border-t border-gray-200 dark:border-gray-700">
                                    <td className="px-4 py-2 dark:text-white">{row.week}</td>
                                    <td className="px-4 py-2 dark:text-white">{row.avgRating}</td>
                                    <td className="px-4 py-2 dark:text-white text-2xl">{row.sentimentLabel}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      <div className="mb-8">
                        <div className="text-xl font-semibold text-white mb-4">Improvement Opportunities</div>
                        <ul className="list-disc pl-6 text-gray-300 space-y-2">
                          {summary.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}
                        </ul>
                      </div>

                      <div className="mb-6">
                        <div className="text-lg font-semibold mb-2 dark:text-white">Table-wise Analytics</div>
                        <div className="overflow-x-auto">
                          <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow">
                            <thead>
                              <tr>
                                <th className="px-4 py-2 text-left dark:text-white">Table</th>
                                <th className="px-4 py-2 text-left dark:text-white">Avg Rating</th>
                                <th className="px-4 py-2 text-left dark:text-white">Sentiment</th>
                              </tr>
                            </thead>
                            <tbody>
                              {summary.tableWise.map((row, i) => (
                                <tr key={row.tableNumber} className="border-t border-gray-200 dark:border-gray-700">
                                  <td className="px-4 py-2 dark:text-white">{row.tableNumber}</td>
                                  <td className="px-4 py-2 dark:text-white">{row.avgRating}</td>
                                  <td className="px-4 py-2 dark:text-white">{row.sentimentIcon} {row.sentimentLabel}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  ) : <div className="text-center py-10 text-gray-500">No report data available</div>}
                </div>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}

// ManageTables component remains mostly the same with updated styling
function ManageTables({ restaurantId }) {
  const [tables, setTables] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [restaurant, setRestaurant] = React.useState(null);
  const [syncing, setSyncing] = React.useState(false);
  const [qrModal, setQrModal] = React.useState({ open: false, qr: null, tableNumber: null });

  React.useEffect(() => {
    fetchRestaurantAndTables();
    // Optionally, set up polling or websocket for real-time updates
  }, [restaurantId]);

  const fetchRestaurantAndTables = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      // Fetch restaurant to get numTables
      const resRest = await fetch(`http://localhost:5000/api/restaurants/${restaurantId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const restData = await resRest.json();
      setRestaurant(restData);
      // Fetch tables
      const resTables = await fetch(`http://localhost:5000/api/tables/restaurant/${restaurantId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const tableData = await resTables.json();
      setTables(tableData);
      // Sync tables if needed
      await syncTables(restData.numTables, tableData, token);
    } catch (err) {
      setTables([]);
      setRestaurant(null);
    } finally {
      setLoading(false);
    }
  };

  // Ensure there are exactly numTables tables in DB
  const syncTables = async (numTables, tableData, token) => {
    setSyncing(true);
    try {
      const existingNumbers = tableData.map(t => t.tableNumber);
      const toAdd = [];
      for (let i = 1; i <= numTables; i++) {
        if (!existingNumbers.includes(i)) {
          toAdd.push(i);
        }
      }
      // Add missing tables
      await Promise.all(toAdd.map(tableNumber =>
        fetch(`http://localhost:5000/api/tables`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ restaurantId, tableNumber }),
        })
      ));
      // Remove extra tables
      const toRemove = tableData.filter(t => t.tableNumber > numTables);
      await Promise.all(toRemove.map(table =>
        fetch(`http://localhost:5000/api/tables/${table._id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })
      ));
      // Refetch tables if any changes
      if (toAdd.length > 0 || toRemove.length > 0) {
        const resTables = await fetch(`http://localhost:5000/api/tables/restaurant/${restaurantId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const tableDataNew = await resTables.json();
        setTables(tableDataNew);
      }
    } catch (err) {
      // ignore
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      {loading || syncing ? (
        <div className="text-gray-600">{loading ? "Loading tables..." : "Syncing tables..."}</div>
      ) : !restaurant ? (
        <div className="text-red-600">Restaurant not found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[...Array(restaurant.numTables)].map((_, i) => {
            const table = tables.find(t => t.tableNumber === i + 1);
            return (
              <div key={i + 1} className="bg-gray-50 rounded-lg shadow p-4 flex flex-col items-center gap-4">
                <div className="font-semibold text-purple-700 text-lg">Table {i + 1}</div>
                {table && table.qrCode ? (
                  <img src={table.qrCode} alt={`QR for Table ${i + 1}`} className="w-28 h-28" />
                ) : (
                  <div className="text-gray-400">Generating QR...</div>
                )}
                <div className="flex gap-2 mt-2">
                  {table && table.qrCode && (
                    <button
                      className="bg-purple-600 text-white px-3 py-1 rounded font-semibold hover:bg-purple-700 transition text-sm"
                      onClick={() => setQrModal({ open: true, qr: table.qrCode, tableNumber: i + 1 })}
                    >
                      Preview QR
                    </button>
                  )}
                  <a href={`/feedback/${restaurantId}/${i + 1}`} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white px-3 py-1 rounded font-semibold hover:bg-blue-700 transition text-sm">Open Feedback Form</a>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* QR Modal */}
      {qrModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-xs relative flex flex-col items-center">
            <button onClick={() => setQrModal({ open: false, qr: null, tableNumber: null })} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl">&times;</button>
            <div className="font-bold text-purple-700 mb-2">Table {qrModal.tableNumber} QR</div>
            <img src={qrModal.qr} alt={`QR for Table ${qrModal.tableNumber}`} className="w-48 h-48 mb-4" />
            <a href={qrModal.qr} download={`Table${qrModal.tableNumber}_QR.png`} className="bg-purple-600 text-white px-4 py-2 rounded font-semibold hover:bg-purple-700 transition">Download QR</a>
          </div>
        </div>
      )}
    </div>
  );
}

export default RestaurantPage; 