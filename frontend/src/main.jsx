import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import RestaurantPage from "./pages/RestaurantPage";
import FeedbackForm from "./pages/FeedbackForm";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/restaurant/:id/*" element={<RestaurantPage />} />
        <Route path="/feedback/:restaurantId/:tableNumber" element={<FeedbackForm />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
