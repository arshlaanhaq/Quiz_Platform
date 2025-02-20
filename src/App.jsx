import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Quiz from "./components/quiz";
import Home from "./components/Home"; // A home component

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/quiz" element={<Quiz />} />
      </Routes>
    </Router>
  );
}
