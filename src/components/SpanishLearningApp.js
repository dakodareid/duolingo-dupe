import React, { useState, useEffect } from 'react';

const SpanishLearningApp = () => {
  const [chapters, setChapters] = useState([]);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldShuffle, setShouldShuffle] = useState(true);

  useEffect(() => {
    fetch('/quizData.json')
      .then(response => response.json())
      .then(data => {
        setChapters(data.chapters);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error loading quiz data:', error);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (chapters.length > 0 && shouldShuffle) {
      shuffleQuestions();
      setShouldShuffle(false);
    }
  }, [currentChapter, shouldShuffle, chapters.length]);

  const shuffleQuestions = () => {
    if (chapters.length === 0 || !chapters[currentChapter]) return;
    
    const shuffled = [...chapters[currentChapter].questions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setChapters(prevChapters => {
      const newChapters = [...prevChapters];
      newChapters[currentChapter] = {
        ...newChapters[currentChapter],
        questions: shuffled
      };
      return newChapters;
    });
  };

  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);
    if (chapters.length > 0 && chapters[currentChapter] && chapters[currentChapter].questions[currentQuestion]) {
      const currentQ = chapters[currentChapter].questions[currentQuestion];
      if (answer === currentQ.correct_answer) {
        setScore(prevScore => prevScore + 1);
      }
    }
  };

  const nextQuestion = () => {
    setSelectedAnswer(null);
    if (chapters.length > 0 && chapters[currentChapter]) {
      if (currentQuestion < chapters[currentChapter].questions.length - 1) {
        setCurrentQuestion(prevQuestion => prevQuestion + 1);
      } else {
        setShowResults(true);
      }
    }
  };

  const restartChapter = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResults(false);
    setShouldShuffle(true);
    setSelectedAnswer(null);
  };

  const nextChapter = () => {
    if (currentChapter < chapters.length - 1) {
      setCurrentChapter(prevChapter => prevChapter + 1);
      setShouldShuffle(true);
      restartChapter();
    }
  };

  if (isLoading) {
    return <div className="text-center mt-8">Loading quiz data...</div>;
  }

  if (chapters.length === 0) {
    return <div className="text-center mt-8">No quiz data available.</div>;
  }

  if (showResults) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold mb-4">Chapter Results</h2>
        <p className="mb-4">You scored {score} out of {chapters[currentChapter]?.questions.length}</p>
        {score >= 10 ? (
          <>
            <p className="mb-4 text-green-600 font-bold">Congratulations! You passed this chapter.</p>
            {currentChapter < chapters.length - 1 ? (
              <button
                onClick={nextChapter}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Next Chapter
              </button>
            ) : (
              <p className="text-green-600 font-bold">You've completed all chapters!</p>
            )}
          </>
        ) : (
          <>
            <p className="mb-4 text-red-600 font-bold">You need to score at least 10 to pass. Try again!</p>
            <button
              onClick={restartChapter}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Restart Chapter
            </button>
          </>
        )}
      </div>
    );
  }

  const currentQ = chapters[currentChapter]?.questions[currentQuestion];

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-4">Chapter {currentChapter + 1}: {chapters[currentChapter]?.title}</h2>
      <p className="mb-4">Question {currentQuestion + 1} of {chapters[currentChapter]?.questions.length}</p>
      <p className="mb-4">Score: {score}/{chapters[currentChapter]?.questions.length}</p>
      <h3 className="text-xl font-semibold mb-4">{currentQ?.question}</h3>
      {currentQ?.options.map((option, index) => (
        <button
          key={index}
          onClick={() => handleAnswer(option)}
          className={`w-full mb-2 p-2 text-left rounded ${
            selectedAnswer !== null
              ? option === currentQ.correct_answer
                ? 'bg-green-500 text-white'
                : selectedAnswer === option
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-200'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
          disabled={selectedAnswer !== null}
        >
          {option}
          {selectedAnswer !== null && option === currentQ.correct_answer && ' ✓'}
        </button>
      ))}
      {selectedAnswer && selectedAnswer !== currentQ.correct_answer && (
        <p className="mt-4 text-red-600">
          Incorrect. The correct answer is: {currentQ.correct_answer}
        </p>
      )}
      {selectedAnswer && (
        <button
          onClick={nextQuestion}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Next Question
        </button>
      )}
    </div>
  );
};

export default SpanishLearningApp;