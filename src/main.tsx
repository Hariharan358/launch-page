import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App";   // Launch Page
import Home from "./Home"; // New Home Page
import "./index.css";
import BigScreen from "./BigScreen";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/screen" element={<BigScreen />} />
        <Route path="/launch" element={<App />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
