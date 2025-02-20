import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Welcome to the Quiz Platform</h1>
      <Link to="/quiz" className="bg-blue-500 text-white px-4 py-2 rounded">
        Start Quiz
      </Link>
    </div>
  );
};

export default Home;
