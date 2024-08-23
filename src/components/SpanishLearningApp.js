import React, { useState, useEffect } from 'react';
import quizData from '../quizData.json';

const SpanishLearningApp = () => {
  const [chapters, setChapters] = useState(quizData.chapters);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [shouldShuffle, setShouldShuffle] = useState(true);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [unlockedChapters, setUnlockedChapters] = useState([0]);
  const [chapterCompleted, setChapterCompleted] = useState(false);

  useEffect(() => {
    if (chapters.length > 0 && shouldShuffle) {
      shuffleQuestions();
      setShouldShuffle(false);
    }
  }, [currentChapter, shouldShuffle, chapters.length]);

  useEffect(() => {
    if (chapters.length > 0 && chapters[currentChapter] && chapters[currentChapter].questions[currentQuestion]) {
      const currentQ = chapters[currentChapter].questions[currentQuestion];
      setShuffledOptions(shuffleArray([...currentQ.options]));
    }
  }, [currentChapter, currentQuestion, chapters]);

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

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
        setChapterCompleted(true);
        // Unlock the next chapter
        if (currentChapter < chapters.length - 1) {
          const nextChapterIndex = currentChapter + 1;
          setUnlockedChapters(prev => [...new Set([...prev, nextChapterIndex])]);
        }
      }
    }
  };

  const restartChapter = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResults(false);
    setShouldShuffle(true);
    setSelectedAnswer(null);
    setChapterCompleted(false);
  };

  const nextChapter = () => {
    if (currentChapter < chapters.length - 1) {
      const nextChapterIndex = currentChapter + 1;
      setCurrentChapter(nextChapterIndex);
      setUnlockedChapters(prev => [...new Set([...prev, nextChapterIndex])]);
      setShouldShuffle(true);
      restartChapter();
    }
  };

  const renderHomePage = () => {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold mb-4">Spanish Learning App</h2>
        <div className="space-y-4">
          {chapters.map((chapter, index) => (
            <button
              key={index}
              onClick={() => {
                if (unlockedChapters.includes(index)) {
                  setCurrentChapter(index);
                  restartChapter();
                }
              }}
              className={`w-full p-4 text-left rounded ${
                unlockedChapters.includes(index)
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!unlockedChapters.includes(index)}
            >
              Chapter {index + 1}: {chapter.topic}
              {unlockedChapters.includes(index) ? '' : ' (Locked)'}
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (currentChapter === null) {
    return renderHomePage();
  }

  const currentQ = chapters[currentChapter]?.questions[currentQuestion];

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-4">Chapter {currentChapter + 1}: {chapters[currentChapter]?.topic}</h2>
      <p className="mb-4">Question {currentQuestion + 1} of {chapters[currentChapter]?.questions.length}</p>
      <p className="mb-4">Score: {score}/{chapters[currentChapter]?.questions.length}</p>
      <h3 className="text-xl font-semibold mb-4">{currentQ?.question}</h3>
      {shuffledOptions.map((option, index) => (
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
      {chapterCompleted && (
        <button
          onClick={() => {
            setCurrentChapter(null);
            // Ensure the next chapter is unlocked when going back to the home page
            if (currentChapter < chapters.length - 1) {
              const nextChapterIndex = currentChapter + 1;
              setUnlockedChapters(prev => [...new Set([...prev, nextChapterIndex])]);
            }
          }}
          className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Back to Chapters
        </button>
      )}
    </div>
  );
};

export default SpanishLearningApp;