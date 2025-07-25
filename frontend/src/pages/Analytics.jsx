import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AnimatedBackground from "../components/AnimatedBackground";
import Sentiment from "sentiment";

function getAllWeeksOfYear(year) {
  const weeks = [];
  const now = new Date();
  const lastWeek = year === now.getFullYear() ? Math.ceil((((now - new Date(year,0,1)) / 86400000 + new Date(year,0,1).getDay()+1)/7)) : 52;
  for (let i = 1; i <= lastWeek; i++) {
    weeks.push(`${year}-W${String(i).padStart(2, '0')}`);
  }
  return weeks;
}

function Analytics() {
  const [restaurants, setRestaurants] = React.useState([]);
  const [feedbacks, setFeedbacks] = React.useState({}); // { [restaurantId]: [feedback] }
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const sentiment = new Sentiment();
  const [startWeek, setStartWeek] = React.useState('');
  const [endWeek, setEndWeek] = React.useState('');

  React.useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/restaurants", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setRestaurants(data);
        // Fetch feedback for each restaurant
        const feedbackObj = {};
        await Promise.all(data.map(async (r) => {
          const resF = await fetch(`http://localhost:5000/api/feedback/restaurant/${r._id}`);
          const dataF = await resF.json();
          feedbackObj[r._id] = dataF;
        }));
        setFeedbacks(feedbackObj);
      } catch (err) {
        setError("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Aggregate analytics for all restaurants
  const summary = React.useMemo(() => {
    let totalRating = 0, totalCount = 0, allKeywords = {}, pos = 0, neg = 0, neu = 0;
    Object.values(feedbacks).forEach(fbs => {
      fbs.forEach(fb => {
        if (fb.ratings) {
          const avg = (fb.ratings.service + fb.ratings.food + fb.ratings.ambiance + fb.ratings.value) / 4;
          totalRating += avg;
          totalCount++;
        }
        if (fb.comments) {
          const s = sentiment.analyze(fb.comments).score;
          if (s > 0) pos++; else if (s < 0) neg++; else neu++;
          fb.comments.split(/\W+/).forEach(word => {
            if (word.length > 3) allKeywords[word.toLowerCase()] = (allKeywords[word.toLowerCase()] || 0) + 1;
          });
        }
      });
    });
    const avgRating = totalCount ? (totalRating / totalCount).toFixed(2) : "-";
    const topKeyword = Object.entries(allKeywords).sort((a,b)=>b[1]-a[1])[0]?.[0] || "-";
    let sentimentLabel = "Neutral", sentimentIcon = "😐";
    const totalSent = pos + neg + neu;
    if (pos/totalSent > 0.6) { sentimentLabel = "Positive"; sentimentIcon = "😊"; }
    else if (neg/totalSent > 0.4) { sentimentLabel = "Negative"; sentimentIcon = "😞"; }
    return { avgRating, totalCount, topKeyword, sentimentLabel, sentimentIcon, pos, neg, neu };
  }, [feedbacks]);

  // Weekly trends for all restaurants (with zero fill)
  const weeklyTrends = React.useMemo(() => {
    const weekMap = {};
    let minYear = new Date().getFullYear(), maxYear = new Date().getFullYear();
    Object.values(feedbacks).forEach(fbs => {
      fbs.forEach(fb => {
        const date = new Date(fb.createdAt);
        const year = date.getFullYear();
        minYear = Math.min(minYear, year);
        maxYear = Math.max(maxYear, year);
        const week = `${year}-W${String(Math.ceil(((date - new Date(year,0,1)) / 86400000 + new Date(year,0,1).getDay()+1)/7)).padStart(2,'0')}`;
        if (!weekMap[week]) weekMap[week] = { ratings: [], sentiments: [], count: 0 };
        if (fb.ratings) weekMap[week].ratings.push((fb.ratings.service + fb.ratings.food + fb.ratings.ambiance + fb.ratings.value) / 4);
        const s = sentiment.analyze(fb.comments || "").score;
        weekMap[week].sentiments.push(s);
        weekMap[week].count++;
      });
    });
    // Fill all weeks from minYear to maxYear
    let allWeeks = [];
    for (let y = minYear; y <= maxYear; y++) {
      allWeeks = allWeeks.concat(getAllWeeksOfYear(y));
    }
    // Only up to current week for current year
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentWeek = Math.ceil(((now - new Date(currentYear,0,1)) / 86400000 + new Date(currentYear,0,1).getDay()+1)/7);
    allWeeks = allWeeks.filter(w => {
      const [y, wk] = w.split('-W');
      return Number(y) < currentYear || Number(wk) <= currentWeek;
    });
    // Fill missing weeks with zero
    const trendArr = allWeeks.map(week => {
      const obj = weekMap[week] || { ratings: [], sentiments: [], count: 0 };
      const avgRating = obj.ratings.length ? (obj.ratings.reduce((a,b)=>a+b,0)/obj.ratings.length).toFixed(2) : '0';
      const avgSentiment = obj.sentiments.length ? (obj.sentiments.reduce((a,b)=>a+b,0)/obj.sentiments.length) : 0;
      return { week, avgRating, avgSentiment, count: obj.count };
    });
    return trendArr;
  }, [feedbacks]);

  // Range filter for weeks
  const weekOptions = weeklyTrends.map(w => w.week);
  React.useEffect(() => {
    if (weeklyTrends.length) {
      if (weeklyTrends.length > 9) {
        setStartWeek(weeklyTrends[weeklyTrends.length-10].week);
        setEndWeek(weeklyTrends[weeklyTrends.length-1].week);
      } else {
        setStartWeek(weeklyTrends[0].week);
        setEndWeek(weeklyTrends[weeklyTrends.length-1].week);
      }
    }
  }, [weeklyTrends.length]);
  const filteredTrends = React.useMemo(() => {
    const startIdx = weeklyTrends.findIndex(w => w.week === startWeek);
    const endIdx = weeklyTrends.findIndex(w => w.week === endWeek);
    if (startIdx === -1 || endIdx === -1) return weeklyTrends;
    return weeklyTrends.slice(startIdx, endIdx+1);
  }, [weeklyTrends, startWeek, endWeek]);

  // Keyword cloud for all restaurants
  const keywordCloud = React.useMemo(() => {
    const kw = {};
    Object.values(feedbacks).forEach(fbs => {
      fbs.forEach(fb => fb.comments?.split(/\W+/).forEach(word => { if (word.length > 3) kw[word.toLowerCase()] = (kw[word.toLowerCase()] || 0) + 1; }));
    });
    return Object.entries(kw).sort((a,b)=>b[1]-a[1]).slice(0,15);
  }, [feedbacks]);

  // Sentiment breakdown for all feedback
  const sentimentBreakdown = React.useMemo(() => {
    let pos = 0, neg = 0, neu = 0;
    Object.values(feedbacks).forEach(fbs => {
      fbs.forEach(fb => {
        const s = sentiment.analyze(fb.comments || "").score;
        if (s > 0) pos++; else if (s < 0) neg++; else neu++;
      });
    });
    return { pos, neg, neu };
  }, [feedbacks]);

  // NLP suggestions per restaurant
  function getSuggestions(fbs) {
    let avg = { service: 0, food: 0, ambiance: 0, value: 0 };
    let count = 0;
    fbs.forEach(fb => {
      if (fb.ratings) {
        Object.keys(avg).forEach(k => { if (fb.ratings[k]) avg[k] += fb.ratings[k]; });
        count++;
      }
    });
    Object.keys(avg).forEach(k => { avg[k] = count ? (avg[k] / count).toFixed(2) : "-"; });
    const suggestions = [];
    if (avg.service < 4) suggestions.push("Improve service speed or friendliness");
    if (avg.food < 4) suggestions.push("Focus on food quality or temperature");
    if (avg.ambiance < 4) suggestions.push("Enhance ambiance or comfort");
    if (avg.value < 4) suggestions.push("Review pricing or value offers");
    if (!suggestions.length) suggestions.push("Keep up the great work!");
    return suggestions;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-900 dark:to-gray-950 pb-24">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navbar />
        <div className="flex-1 flex flex-col items-center p-4 pt-24">
          <div className="w-full max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 mb-8">
              Analytics Dashboard
            </h1>
            {loading ? (
              <div className="text-center py-12 text-gray-400">Loading analytics...</div>
            ) : error ? (
              <div className="text-center py-12 text-red-400">{error}</div>
            ) : (
              <>
                {/* Summary cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 backdrop-blur-sm shadow-lg hover:border-purple-500 transition-all duration-300">
                    <div className="text-gray-400 mb-1">Avg. Rating</div>
                    <div className="text-3xl font-bold text-purple-400">{summary.avgRating}</div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 backdrop-blur-sm shadow-lg hover:border-cyan-500 transition-all duration-300">
                    <div className="text-gray-400 mb-1">Feedback Count</div>
                    <div className="text-3xl font-bold text-cyan-400">{summary.totalCount}</div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 backdrop-blur-sm shadow-lg hover:border-pink-500 transition-all duration-300">
                    <div className="text-gray-400 mb-1">Top Keyword</div>
                    <div className="text-3xl font-bold text-pink-400">{summary.topKeyword}</div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 backdrop-blur-sm shadow-lg hover:border-yellow-500 transition-all duration-300">
                    <div className="text-gray-400 mb-1">Sentiment</div>
                    <div className="text-3xl font-bold text-yellow-400">{summary.sentimentIcon} {summary.sentimentLabel}</div>
                  </div>
                </div>
                {/* After summary cards, add visual trend chart and NLP insights: */}
                {filteredTrends.length > 0 && (
                  <div className="mb-10">
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 backdrop-blur-sm shadow-lg">
                      <h2 className="text-xl font-semibold text-white mb-4">Weekly Trends</h2>
                      <div className="flex flex-wrap gap-4 mb-4 items-center">
                        <label className="text-gray-300">From: <select className="bg-gray-900 border border-gray-700 rounded px-2 py-1 ml-1" value={startWeek} onChange={e=>setStartWeek(e.target.value)}>{weekOptions.map(w=><option key={w} value={w}>{w}</option>)}</select></label>
                        <label className="text-gray-300">To: <select className="bg-gray-900 border border-gray-700 rounded px-2 py-1 ml-1" value={endWeek} onChange={e=>setEndWeek(e.target.value)}>{weekOptions.map(w=><option key={w} value={w}>{w}</option>)}</select></label>
                      </div>
                      <div className="overflow-x-auto">
                        <div className="w-full">
                          <svg width="100%" height="200" viewBox={`0 0 ${Math.max(400, filteredTrends.length * 60)} 200`} className="block mx-auto mb-2">
                            <defs>
                              <linearGradient id="trendLineGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#a78bfa" stopOpacity="1" />
                                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.7" />
                              </linearGradient>
                              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.25" />
                                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.10" />
                              </linearGradient>
                            </defs>
                            {/* Y axis */}
                            <line x1="35" y1="20" x2="35" y2="160" stroke="#e5e7eb" strokeWidth="1.5" />
                            {/* X axis */}
                            <line x1="35" y1="160" x2={filteredTrends.length*60+40} y2="160" stroke="#e5e7eb" strokeWidth="1.5" />
                            {/* Y axis labels as emojis */}
                            {[
                              {v:5, emoji:'😍'},
                              {v:4, emoji:'😊'},
                              {v:3, emoji:'😐'},
                              {v:2, emoji:'😕'},
                              {v:1, emoji:'😞'},
                              {v:0, emoji:'💀'}
                            ].map(({v,emoji})=>(
                              <text key={v} x="25" y={160-v*28+8} fontSize="18" textAnchor="end">{emoji}</text>
                            ))}
                            {/* Area under the curve */}
                            {(() => {
                              if (filteredTrends.length < 2) return null;
                              const getX = i => i*(Math.max(360, (filteredTrends.length-1)*60)/Math.max(1,filteredTrends.length-1))+40;
                              const getY = v => 160-Number(v)*28;
                              let d = `M${getX(0)},${getY(filteredTrends[0].avgRating)}`;
                              for (let i = 1; i < filteredTrends.length; i++) {
                                const x0 = getX(i-1), y0 = getY(filteredTrends[i-1].avgRating);
                                const x1 = getX(i), y1 = getY(filteredTrends[i].avgRating);
                                const cx = (x0 + x1) / 2;
                                d += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`;
                              }
                              // Area path
                              let areaD = d + ` L${getX(filteredTrends.length-1)},160 L${getX(0)},160 Z`;
                              return <>
                                <path d={areaD} fill="url(#areaGradient)" />
                                <path d={d} fill="none" stroke="url(#trendLineGradient)" strokeWidth="5" style={{filter:'drop-shadow(0 4px 12px #a78bfa88)'}}>
                                  <animate attributeName="stroke-dasharray" from="0,10000" to="10000,0" dur="1.2s" fill="freeze" />
                                </path>
                              </>;
                            })()}
                            {/* Dots for ratings */}
                            {filteredTrends.map((w, i) => w.avgRating !== '-' && (
                              <circle key={i} cx={i*(Math.max(360, (filteredTrends.length-1)*60)/Math.max(1,filteredTrends.length-1))+40} cy={160-Number(w.avgRating)*28} r="10" fill="#fff" stroke="#a78bfa" strokeWidth="3" style={{filter:'drop-shadow(0 2px 8px #a78bfa88)'}} />
                            ))}
                            {/* Feedback count below each week */}
                            {filteredTrends.map((w, i) => (
                              <text key={i} x={i*(Math.max(360, (filteredTrends.length-1)*60)/Math.max(1,filteredTrends.length-1))+40} y={180} fontSize="16" textAnchor="middle" fill="#fbbf24">{w.count}</text>
                            ))}
                            {/* Week labels */}
                            {filteredTrends.map((w, i) => (
                              <text key={i} x={i*(Math.max(360, (filteredTrends.length-1)*60)/Math.max(1,filteredTrends.length-1))+40} y={192} fontSize="10" textAnchor="middle" fill="#e0e7ef">{w.week.slice(5)}</text>
                            ))}
                          </svg>
                        </div>
                        <div className="flex justify-center gap-6 text-sm text-gray-400">
                          <span><span className="inline-block w-4 h-2 bg-purple-400 mr-1 align-middle"></span>Avg Rating</span>
                          <span><span className="text-yellow-400 font-bold">#</span> Feedback Count</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 backdrop-blur-sm shadow-lg">
                    <h2 className="text-xl font-semibold text-white mb-4">Keyword Cloud</h2>
                    <div className="flex flex-wrap gap-3 justify-center py-4">
                      {keywordCloud.map(([word, count], idx) => (
                        <span key={word} className={`px-3 py-2 rounded-full text-sm font-medium bg-purple-900/50 text-purple-300`} style={{ fontSize: `${1 + count/10}rem` }}>{word} <span className="text-purple-400">{count}</span></span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 backdrop-blur-sm shadow-lg flex flex-col items-center justify-center">
                    <h2 className="text-xl font-semibold text-white mb-4">Sentiment Breakdown</h2>
                    <div className="flex gap-6 text-3xl mb-2">
                      <span title="Positive">😊 {sentimentBreakdown.pos}</span>
                      <span title="Neutral">😐 {sentimentBreakdown.neu}</span>
                      <span title="Negative">😞 {sentimentBreakdown.neg}</span>
                    </div>
                    <div className="text-gray-400">Total Feedback: {sentimentBreakdown.pos + sentimentBreakdown.neu + sentimentBreakdown.neg}</div>
                  </div>
                </div>
                {/* Restaurant-wise analytics */}
                <div className="mb-10">
                  <h2 className="text-2xl font-bold text-white mb-6">Your Restaurants</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {restaurants.map(r => (
                      <div key={r._id} className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
                        <div className="flex items-center gap-4 mb-4">
                          {r.photo ? (
                            <img src={r.photo} alt={r.name} className="w-16 h-16 object-cover rounded-xl" />
                          ) : (
                            <div className="bg-gray-700 border border-gray-600 rounded-xl w-16 h-16 flex items-center justify-center">
                              <span className="text-2xl">🍴</span>
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-lg text-white">{r.name}</div>
                            <div className="text-cyan-400 text-sm">{r.specialty}</div>
                            <div className="text-gray-400 text-xs">{r.location}</div>
                          </div>
                        </div>
                        <div className="mb-2 text-gray-300">Feedbacks: {feedbacks[r._id]?.length || 0}</div>
                        <div className="mb-2 text-gray-300">Avg. Rating: {feedbacks[r._id] && feedbacks[r._id].length ? (feedbacks[r._id].reduce((sum, fb) => sum + ((fb.ratings?.service || 0) + (fb.ratings?.food || 0) + (fb.ratings?.ambiance || 0) + (fb.ratings?.value || 0)) / 4, 0) / feedbacks[r._id].length).toFixed(2) : '-'}</div>
                        <div className="mb-2 text-gray-300">Top Keyword: {(() => {
                          const kw = {};
                          feedbacks[r._id]?.forEach(fb => fb.comments?.split(/\W+/).forEach(word => { if (word.length > 3) kw[word.toLowerCase()] = (kw[word.toLowerCase()] || 0) + 1; }));
                          return Object.entries(kw).sort((a,b)=>b[1]-a[1])[0]?.[0] || '-';
                        })()}</div>
                        <div className="mb-4 text-gray-300">Suggestions:
                          <ul className="list-disc pl-6 mt-1">
                            {getSuggestions(feedbacks[r._id] || []).map((s,i) => <li key={i}>{s}</li>)}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default Analytics;