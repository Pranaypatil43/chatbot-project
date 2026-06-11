import { useState, useEffect } from 'react';
import { ChatInput } from './components/ChatInput';
import { ChatMessages } from './components/ChatMessages';
import './App.css'

function App() {
  const [chatMessages, setChatMessages] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('messages')) || [];
    const clean = saved.filter(m => typeof m.message === 'string' && m.id !== 'loading-spinner');
    return clean.length > 0 ? clean : [
      { message: 'hello chatbot', sender: 'user', id: 'id1', time: 1736127288920 },
      { message: 'Hello! How can I help you?', sender: 'robot', id: 'id2', time: 1736127291230 },
      { message: 'can you get me todays date?', sender: 'user', id: 'id3', time: 1736127385356 },
      { message: 'Today is September 27', sender: 'robot', id: 'id4', time: 1736127385500 }
    ];
  });

  const [showSaved, setShowSaved] = useState(false);
  const [savedAnswers, setSavedAnswers] = useState(() =>
    JSON.parse(localStorage.getItem('liked-answers')) || []
  );

  useEffect(() => {
    const textOnly = chatMessages.filter(m => typeof m.message === 'string');
    localStorage.setItem('messages', JSON.stringify(textOnly));
  }, [chatMessages]);

  function refreshSaved() {
    setSavedAnswers(JSON.parse(localStorage.getItem('liked-answers')) || []);
  }

  return (
    <div className="app-container">
      <div className="app-header">
        🤖 AI Chatbot
        <button className="saved-toggle" onClick={() => { refreshSaved(); setShowSaved(!showSaved); }}>
          {showSaved ? '💬 Chat' : '⭐ Saved'}
        </button>
      </div>

      {showSaved ? (
        <div className="saved-answers-container">
          {savedAnswers.length === 0
            ? <p className="welcome-message">No saved answers yet. Like a response to save it!</p>
            : savedAnswers.map(a => (
              <div key={a.id} className="saved-answer-item">
                <p>{a.message}</p>
                <span className="saved-answer-time">{a.time ? new Date(a.time).toLocaleString() : ''}</span>
              </div>
            ))
          }
        </div>
      ) : (
        <>
          {chatMessages.length === 0 && (
            <p className="welcome-message">
              Welcome to the chatbot! Send a message below.
            </p>
          )}
          <ChatMessages chatMessages={chatMessages} />
          <ChatInput chatMessages={chatMessages} setChatMessages={setChatMessages} />
        </>
      )}
    </div>
  );
}

export default App