import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AnimatedBackground from "../components/AnimatedBackground";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", photo: "", specialty: "", numTables: 1, description: "", location: "", type: "main", branchNumber: "", openingDate: "" });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!storedUser || !token) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(storedUser));
    fetchRestaurants(token);
  }, [navigate]);

  const fetchRestaurants = async (token) => {
    try {
      const res = await fetch("http://localhost:5000/api/restaurants", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRestaurants(data);
    } catch (err) {
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRestaurant = () => {
    setShowModal(true);
    setEditId(null);
    setForm({ name: "", photo: "", specialty: "", numTables: 1, description: "", location: "", type: "main", branchNumber: "", openingDate: "" });
    setFormError("");
  };

  const handleEditRestaurant = (restaurant) => {
    setShowModal(true);
    setEditId(restaurant._id);
    setForm({
      name: restaurant.name || "",
      photo: restaurant.photo || "",
      specialty: restaurant.specialty || "",
      numTables: restaurant.numTables || 1,
      description: restaurant.description || "",
      location: restaurant.location || "",
      type: restaurant.type || "main",
      branchNumber: restaurant.branchNumber || "",
      openingDate: restaurant.openingDate ? restaurant.openingDate.slice(0, 10) : "",
    });
    setFormError("");
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    const token = localStorage.getItem("token");
    try {
      const payload = { ...form };
      if (form.type !== "branch") delete payload.branchNumber;
      let res, data;
      if (editId) {
        res = await fetch(`http://localhost:5000/api/restaurants/${editId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to update restaurant");
        setRestaurants((prev) => prev.map((r) => (r._id === editId ? data : r)));
      } else {
        res = await fetch("http://localhost:5000/api/restaurants", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to add restaurant");
        setRestaurants((prev) => [...prev, data]);
      }
      setShowModal(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestaurantClick = (id) => {
    if (!editMode) navigate(`/restaurant/${id}`);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/restaurants/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete restaurant");
      setRestaurants((prev) => prev.filter((r) => r._id !== deleteId));
      setShowDeleteConfirm(false);
      setDeleteId(null);
    } catch (err) {
      alert("Error deleting restaurant: " + err.message);
    }
  };

  // Drag and drop reorder handlers (UI only)
  const handleDragStart = (index) => setDragIndex(index);
  const handleDragOver = (index) => {
    if (dragIndex === null || dragIndex === index) return;
    const updated = [...restaurants];
    const [removed] = updated.splice(dragIndex, 1);
    updated.splice(index, 0, removed);
    setRestaurants(updated);
    setDragIndex(index);
  };
  const handleDragEnd = () => setDragIndex(null);
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-900 dark:to-gray-950 pb-24">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navbar />
        <div className="flex-1 max-w-6xl mx-auto py-8 w-full px-4 pt-24">
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 mb-8">
            Your Restaurants
          </h1>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
              <div className="text-gray-400">Loading your restaurants...</div>
            </div>
          ) : restaurants.length === 0 ? (
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-8 text-center backdrop-blur-sm shadow-lg">
              <div className="text-5xl mb-4">🍽️</div>
              <p className="mb-6 text-gray-300">You haven't added any restaurants yet</p>
              <button 
                onClick={handleAddRestaurant} 
                className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg shadow-purple-500/30 hover:from-purple-700 hover:to-cyan-700 transition-all"
              >
                Add Your First Restaurant
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold text-gray-300">Manage Your Locations</h2>
                <div className="flex gap-3">
                  <button 
                    onClick={handleAddRestaurant} 
                    className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-5 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-cyan-700 transition shadow-lg shadow-purple-500/20"
                  >
                    Add Restaurant
                  </button>
                  <button 
                    onClick={() => setEditMode((v) => !v)} 
                    className={`px-5 py-2 rounded-lg font-semibold border ${
                      editMode 
                        ? 'bg-gray-800 border-purple-500 text-purple-400 shadow-lg shadow-purple-500/10' 
                        : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50'
                    }`}
                  >
                    {editMode ? 'Done Editing' : 'Edit'}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurants.map((r, idx) => (
                  <div
                    key={r._id}
                    className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-5 flex flex-col gap-4 transition-all duration-300 border ${
                      editMode 
                        ? 'border-gray-700 cursor-move hover:border-purple-500' 
                        : 'border-gray-700 hover:border-cyan-500 cursor-pointer'
                    } shadow-lg backdrop-blur-sm`}
                    onClick={() => !editMode && handleRestaurantClick(r._id)}
                  >
                    <div className="flex gap-4">
                      {r.photo ? (
                        <img src={r.photo} alt={r.name} className="w-16 h-16 object-cover rounded-xl" />
                      ) : (
                        <div className="bg-gray-700 border border-gray-600 rounded-xl w-16 h-16 flex items-center justify-center">
                          <span className="text-2xl">🍴</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="font-bold text-lg text-white flex justify-between">
                          {r.name}
                          {editMode && (
                            <div className="flex gap-2">
                              <button
                                className="text-cyan-400 hover:text-cyan-300"
                                onClick={e => { e.stopPropagation(); handleEditRestaurant(r); }}
                                title="Edit Restaurant"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                              <button
                                className="text-red-400 hover:text-red-300"
                                onClick={e => { e.stopPropagation(); handleDeleteClick(r._id); }}
                                title="Delete Restaurant"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="text-cyan-400 text-sm mb-1">{r.specialty}</div>
                        <div className="flex items-center text-gray-400 text-xs gap-1 mb-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                          <span>{r.location || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-xs text-gray-500">
                        {r.openingDate ? `Opened ${new Date(r.openingDate).toLocaleDateString()}` : ''}
                      </div>
                      <div className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded">
                        {r.numTables} tables
                      </div>
                    </div>
                    
                    {r.description && (
                      <div className="text-gray-400 text-sm mt-2 line-clamp-2">{r.description}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Modals remain mostly the same with updated styling */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-md relative backdrop-blur-sm shadow-2xl">
              <button onClick={() => setShowModal(false)} className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl">&times;</button>
              <h2 className="text-2xl font-bold text-white mb-4">{editId ? 'Edit Restaurant' : 'Add Restaurant'}</h2>
              <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
                <input type="text" name="name" value={form.name} onChange={handleFormChange} placeholder="Name" className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white" required />
                <input type="text" name="photo" value={form.photo} onChange={handleFormChange} placeholder="Photo URL" className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white" />
                <input type="text" name="specialty" value={form.specialty} onChange={handleFormChange} placeholder="Specialty (e.g. Italian, Cafe)" className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white" required />
                <input type="number" name="numTables" value={form.numTables} onChange={handleFormChange} placeholder="Number of Tables" min={1} className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white" required />
                <input type="text" name="location" value={form.location} onChange={handleFormChange} placeholder="Location" className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white" required />
                <input type="date" name="openingDate" value={form.openingDate} onChange={handleFormChange} placeholder="Opening Date" className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white" />
                <select name="type" value={form.type} onChange={handleFormChange} className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white">
                  <option value="main">Main</option>
                  <option value="branch">Branch</option>
                </select>
                {form.type === "branch" && (
                  <input type="text" name="branchNumber" value={form.branchNumber} onChange={handleFormChange} placeholder="Branch Number" className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white" />
                )}
                <textarea name="description" value={form.description} onChange={handleFormChange} placeholder="Description" className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white" rows={2} />
                {formError && <div className="text-red-400 text-sm text-center">{formError}</div>}
                <div className="flex gap-4 mt-2">
                  <button type="submit" disabled={submitting} className="flex-1 bg-gradient-to-r from-purple-600 to-cyan-600 text-white py-2 rounded-lg font-bold hover:from-purple-700 hover:to-cyan-700 transition disabled:opacity-50">{submitting ? 'Saving...' : (editId ? 'Save Changes' : 'Add Restaurant')}</button>
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-700 text-gray-300 py-2 rounded-lg font-bold hover:bg-gray-600 transition">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-sm relative backdrop-blur-sm shadow-2xl text-center">
              <button onClick={() => setShowDeleteConfirm(false)} className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl">&times;</button>
              <div className="text-3xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold text-white mb-2">Delete Restaurant?</h2>
              <p className="text-gray-300 mb-6">Are you sure you want to delete this restaurant? This action cannot be undone.</p>
              <div className="flex gap-4">
                <button onClick={handleDeleteConfirm} className="flex-1 bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700 transition">Delete</button>
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 bg-gray-700 text-gray-300 py-2 rounded-lg font-bold hover:bg-gray-600 transition">Cancel</button>
              </div>
            </div>
          </div>
        )}
        
        <Footer />
      </div>
    </div>
  );
}

export default Dashboard;