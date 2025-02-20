import React, { useState, useEffect } from "react";
import questions from "./questions";
import { saveAttempt, getAllAttempts } from "../utils/db";
import Confetti from "react-confetti"; // 🎇 Firecracker effect

const Quiz = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [fillAnswer, setFillAnswer] = useState("");
    const [correctAnswer, setCorrectAnswer] = useState(""); // Store correct answer separately
    const [score, setScore] = useState(0);
    const [attempts, setAttempts] = useState([]);
    const [showResult, setShowResult] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30);
    const [answered, setAnswered] = useState(false);
    const [showNext, setShowNext] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Load previous attempts from IndexedDB
    useEffect(() => {
        async function fetchAttempts() {
            const history = await getAllAttempts();
            console.log("Fetched Attempts:", history);
            setAttempts([...history]);
        }
        fetchAttempts();
    }, [showResult]); // Update attempts when quiz completes


    // Save quiz history when quiz is completed
    useEffect(() => {
        if (showResult) {
            const newAttempt = { date: new Date().toLocaleString(), score };
            saveAttempt(newAttempt);

            // Update local state to show the latest attempt
            setAttempts((prev) => [...prev, newAttempt]);
        }
    }, [showResult]);


    // Timer logic (Auto-show correct answer for Fill in the Blanks)
    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            if (!answered) {
                setAnswered(true);
                setShowNext(true);

                if (questions[currentQuestion].type === "fill") {
                    setCorrectAnswer(questions[currentQuestion].answer); // Show correct answer above submit button
                }
            }
        }
    }, [timeLeft, answered]);

    // Handle Enter key for Submit
    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.key === "Enter") {
                if (!answered) {
                    if (questions[currentQuestion].type === "mcq") {
                        handleSubmit();
                    } else {
                        handleFillSubmit();
                    }
                }
            }
        };

        window.addEventListener("keydown", handleKeyPress);
        return () => {
            window.removeEventListener("keydown", handleKeyPress);
        };
    }, [selectedAnswer, fillAnswer, answered, currentQuestion]);

    // Answer selection logic
    const handleAnswer = (option) => {
        if (!answered) {
            setSelectedAnswer(option);
            setErrorMessage("");
        }
    };

    // Handle Submit for MCQs
    const handleSubmit = () => {
        if (selectedAnswer === null) {
            setErrorMessage("⚠️ Please select an answer before submitting!");
            return;
        }
        setAnswered(true);
        setShowNext(true);

        if (selectedAnswer === questions[currentQuestion].answer) {
            setScore(score + 1);
        }
    };

    // Handle Submit for Fill in the Blanks
    const handleFillSubmit = () => {
        if (fillAnswer.trim() === "") {
            setErrorMessage("⚠️ Please enter your answer before submitting!");
            return;
        }
        setAnswered(true);
        setShowNext(true);

        if (fillAnswer.trim().toLowerCase() === questions[currentQuestion].answer.toLowerCase()) {
            setScore(score + 1);
        }
        setCorrectAnswer(questions[currentQuestion].answer); // Show correct answer above submit button
    };

    // Next question logic
    const nextQuestion = () => {
        setAnswered(false);
        setShowNext(false);
        setErrorMessage("");
        setCorrectAnswer(""); // Reset correct answer

        if (currentQuestion + 1 < questions.length) {
            setCurrentQuestion(currentQuestion + 1);
            setSelectedAnswer(null);
            setFillAnswer("");
            setTimeLeft(30);
        } else {
            setShowResult(true);
        }
    };

    // Restart quiz
    const restartQuiz = () => {
        setCurrentQuestion(0);
        setSelectedAnswer(null);
        setFillAnswer("");
        setScore(0);
        setShowResult(false);
        setTimeLeft(30);
        setAnswered(false);
        setShowNext(false);
        setCorrectAnswer("");
        setErrorMessage("");
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="p-6 max-w-lg w-full bg-white shadow-lg rounded-lg text-center">
                {showResult ? (
                    <div>
                        {score === questions.length && <Confetti />} {/* 🎇 Firecracker effect */}

                        <h2 className="text-2xl font-bold text-green-600">Quiz Completed!</h2>
                        <p className="text-lg">
                            Your Score: <span className="font-bold">{score} / {questions.length}</span>
                        </p>

                        {/* Score Message */}
                        <p className="text-lg font-semibold mt-3">
                            {score < 5 ? "Better luck next time! 😊" : score === questions.length ? "🎉 Congratulations! You got a perfect score! 🎇" : "Great job! Keep practicing! 🚀"}
                        </p>
                        {/* Attempt History Section */}
                        <div className="mt-4 text-left">
                            <h3 className="font-bold text-lg">Attempt History:</h3>
                            <ul className="bg-gray-100 p-2 rounded">
                                {attempts.length > 0 ? (
                                    attempts.map((attempt, index) => (
                                        <li key={index} className="border-b py-1">
                                            <span>{attempt.date} - <b>Score:</b> {attempt.score}</span>
                                        </li>
                                    ))
                                ) : (
                                    <p>No attempts found</p>
                                )}
                            </ul>
                        </div>

                        <button
                            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-all duration-200"
                            onClick={restartQuiz}
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    <div>
                        <h2 className="text-lg font-semibold">{questions[currentQuestion].question}</h2>
                        <p className="text-red-500 font-bold">Time Left: {timeLeft}s</p>

                        {/* MCQ Section */}
                        {questions[currentQuestion].type === "mcq" ? (
                            <div className="mt-4 space-y-3">
                                {questions[currentQuestion].options.map((option, index) => (
                                    <button
                                        key={index}
                                        className={`block w-full text-left p-3 border rounded ${answered
                                                ? option === questions[currentQuestion].answer
                                                    ? "bg-green-300"
                                                    : option === selectedAnswer
                                                        ? "bg-red-300"
                                                        : "bg-gray-100"
                                                : selectedAnswer === option
                                                    ? "bg-blue-300"
                                                    : "bg-gray-100 hover:bg-gray-200"
                                            }`}
                                        onClick={() => handleAnswer(option)}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="mt-4">
                                {/* Show correct answer above Submit button if answered */}
                                {answered && correctAnswer && (
                                    <p className="text-green-600 font-semibold mb-2">Correct Answer: <b>{correctAnswer}</b></p>
                                )}

                                <input
                                    type="text"
                                    className="border p-2 w-full rounded"
                                    placeholder="Type your answer..."
                                    value={fillAnswer}
                                    onChange={(e) => {
                                        setFillAnswer(e.target.value);
                                        setErrorMessage("");
                                    }}
                                    disabled={answered} // Lock input after submit
                                />
                            </div>
                        )}

                        {errorMessage && <p className="text-red-600 font-semibold mt-2">{errorMessage}</p>}

                        {!answered && (
                            <button className="mt-4 bg-purple-500 text-white px-4 py-2 rounded w-full hover:bg-purple-600 cursor-pointer transition-all duration-200" onClick={questions[currentQuestion].type === "mcq" ? handleSubmit : handleFillSubmit}>
                                Submit
                            </button>
                        )}

                        {showNext && (
                            <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-700 cursor-pointer transition-all duration-200" onClick={nextQuestion}>
                                Next
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Quiz;
