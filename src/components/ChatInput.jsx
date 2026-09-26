import dayjs from 'dayjs';
import { useState, useRef } from 'react';
import { getGeminiResponse } from '../gemini';
import './ChatInput.css';

export function ChatInput({ chatMessages, setChatMessages }) {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef(null);

  function handleInput(e) {
    setInputText(e.target.value);
    // Auto-grow textarea
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
    }
  }

  async function sendMessage() {
    if (isLoading || inputText.trim() === '') return;

    setIsLoading(true);
    const text = inputText.trim();
    setInputText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    const userMsg = {
      message: text,
      sender: 'user',
      id: crypto.randomUUID(),
      time: dayjs().valueOf(),
    };

    const loadingMsg = {
      message: 'loading',
      sender: 'robot',
      id: 'loading-spinner',
      time: dayjs().valueOf(),
    };

    const withUser = [...chatMessages, userMsg];
    setChatMessages([...withUser, loadingMsg]);

    let response;
    try {
      response = await getGeminiResponse(text);
    } catch (err) {
      console.error('Gemini API error:', err);
      const msg = err.message || '';
      if (msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('temporarily')) {
        response = '⚠️ Gemini is experiencing high demand right now. Please try again in a few seconds.';
      } else if (msg.includes('429') || msg.includes('RATE')) {
        response = '⚠️ Rate limit reached. Please wait a moment before sending another message.';
      } else {
        response = '⚠️ Something went wrong. Please try again.';
      }
    }

    setChatMessages([
      ...withUser,
      { message: response, sender: 'robot', id: crypto.randomUUID(), time: dayjs().valueOf() },
    ]);

    setIsLoading(false);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
    if (e.key === 'Escape') {
      setInputText('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  }

  return (
    <div className="input-bar-wrapper">
      <div className="input-bar">
        <textarea
          ref={textareaRef}
          className="input-textarea"
          placeholder="Ask Gemini anything…"
          value={inputText}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button
          className={`input-send-btn ${isLoading ? 'loading' : ''}`}
          onClick={sendMessage}
          disabled={isLoading || inputText.trim() === ''}
          title="Send"
        >
          {isLoading ? (
            <span className="send-spinner" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          )}
        </button>
      </div>
      <p className="input-hint">Press Enter to send · Shift+Enter for new line</p>
    </div>
  );
}
