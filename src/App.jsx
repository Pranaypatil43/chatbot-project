import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { ChatInput } from './components/ChatInput';
import { ChatMessages } from './components/ChatMessages';
import './App.css';

// ── helpers ────────────────────────────────────────────────────────────────

function loadSessions() {
  try { return JSON.parse(localStorage.getItem('chat-sessions')) || []; }
  catch { return []; }
}

function saveSessions(sessions) {
  localStorage.setItem('chat-sessions', JSON.stringify(sessions));
}

function formatRelative(ts) {
  if (!ts) return '';
  const now = dayjs();
  const d   = dayjs(ts);
  if (now.diff(d, 'minute') < 2)  return 'Just now';
  if (now.diff(d, 'hour')   < 24) return d.format('h:mm A');
  if (now.diff(d, 'day')    < 2)  return 'Yesterday';
  if (now.diff(d, 'day')    < 7)  return d.format('dddd');
  return d.format('MMM D');
}

// Pull a short title from the first user message in a session
function sessionTitle(messages) {
  const first = messages.find(m => m.sender === 'user');
  if (!first) return 'New chat';
  const t = first.message.trim();
  return t.length > 40 ? t.slice(0, 40) + '…' : t;
}

// ── component ──────────────────────────────────────────────────────────────

function App() {
  // All sessions: [{ id, messages, updatedAt }]
  const [sessions, setSessions]         = useState(() => loadSessions());
  // Active session id — null means brand-new chat (not yet saved)
  const [activeId, setActiveId]         = useState(null);
  // Messages for the currently visible chat
  const [chatMessages, setChatMessages] = useState([]);
  const [showSaved, setShowSaved]       = useState(false);
  const [savedAnswers, setSavedAnswers] = useState(() =>
    JSON.parse(localStorage.getItem('liked-answers')) || []
  );
  const [searchQuery, setSearchQuery]   = useState('');

  // Whenever messages change, persist the active session
  useEffect(() => {
    if (chatMessages.length === 0) return;

    const clean = chatMessages.filter(
      m => typeof m.message === 'string' && m.id !== 'loading-spinner'
    );
    if (clean.length === 0) return;

    setSessions(prev => {
      let updated;
      if (activeId && prev.some(s => s.id === activeId)) {
        // Update existing session
        updated = prev.map(s =>
          s.id === activeId
            ? { ...s, messages: clean, updatedAt: Date.now() }
            : s
        );
      } else {
        // First message in a brand-new session → create it
        const newId = crypto.randomUUID();
        setActiveId(newId);
        updated = [
          { id: newId, messages: clean, updatedAt: Date.now() },
          ...prev,
        ];
      }
      saveSessions(updated);
      return updated;
    });
  }, [chatMessages]);

  function startNewChat() {
    setActiveId(null);
    setChatMessages([]);
    setShowSaved(false);
  }

  function openSession(session) {
    setActiveId(session.id);
    setChatMessages(session.messages);
    setShowSaved(false);
  }

  function deleteSession(e, id) {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== id);
    saveSessions(updated);
    setSessions(updated);
    if (activeId === id) startNewChat();
  }

  function refreshSaved() {
    setSavedAnswers(JSON.parse(localStorage.getItem('liked-answers')) || []);
  }

  const filteredSessions = sessions.filter(s =>
    sessionTitle(s.messages).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasMessages = chatMessages.length > 0;

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">✦</div>
            <span className="sidebar-brand-label">Workspace</span>
          </div>
          <div className="sidebar-title">My conversations</div>
          <button className="new-chat-btn" onClick={startNewChat}>
            <span>+</span> New chat
          </button>
        </div>

        <div className="sidebar-search">
          <input
            placeholder="Search chats…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <nav className="sidebar-history">
          {filteredSessions.length === 0 ? (
            <p className="sidebar-empty">
              {searchQuery ? 'No chats match your search.' : 'No previous chats yet.'}
            </p>
          ) : (
            <>
              <div className="sidebar-section-label">Recent</div>
              {filteredSessions.map(session => (
                <div
                  key={session.id}
                  className={`history-item ${session.id === activeId ? 'active' : ''}`}
                  onClick={() => openSession(session)}
                >
                  <span className="history-item-icon">💬</span>
                  <div className="history-item-info">
                    <div className="history-item-title">{sessionTitle(session.messages)}</div>
                    <div className="history-item-time">{formatRelative(session.updatedAt)}</div>
                  </div>
                  <button
                    className="history-delete-btn"
                    onClick={e => deleteSession(e, session.id)}
                    title="Delete"
                  >×</button>
                </div>
              ))}
            </>
          )}
        </nav>
      </aside>

      {/* ── Main ── */}
      <main className="main-area">
        <div className="main-topbar">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="main-topbar-title">Gemini Assistant</span>
            </div>
            <div className="main-topbar-subtitle">Your AI thinking partner · Gemini 3.8</div>
          </div>
          <div className="topbar-right">
            <button
              className="topbar-btn"
              onClick={() => { refreshSaved(); setShowSaved(!showSaved); }}
            >
              {showSaved ? '💬 Chat' : '★ Saved'}
            </button>
            <button className="topbar-btn" onClick={startNewChat}>
              + New chat
            </button>
          </div>
        </div>

        {showSaved ? (
          <div className="saved-panel">
            <div className="saved-panel-title">★ Saved responses</div>
            {savedAnswers.length === 0 ? (
              <p className="empty-state">No saved responses yet. Save a reply to see it here.</p>
            ) : (
              savedAnswers.map(a => (
                <div key={a.id} className="saved-answer-item">
                  <p>{a.message}</p>
                  <span className="saved-answer-time">
                    {a.time ? new Date(a.time).toLocaleString() : ''}
                  </span>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="chat-area">
            {!hasMessages ? (
              <div className="welcome-hero">
                <div className="welcome-hero-icon">🌿</div>
                <h1>Let's make something great</h1>
                <p>
                  I'm your AI thinking partner for ideas, strategy,
                  and everything in between.
                </p>
              </div>
            ) : (
              <ChatMessages chatMessages={chatMessages} />
            )}
            <ChatInput chatMessages={chatMessages} setChatMessages={setChatMessages} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
