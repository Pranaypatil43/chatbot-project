import dayjs from 'dayjs';
import { useState } from 'react';
import RobotprofileImage from '../assets/robot.png';
import userprofileImage  from '../assets/profile-1.jpg';
import loadingSpinnerImage from '../assets/loading-spinner.gif';
import './ChatMessage.css'
export function ChatMessage({ message, sender, time, id }) {
  const [liked, setLiked] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('liked-answers')) || [];
    return saved.some(a => a.id === id);
  });

  function toggleLike() {
    const saved = JSON.parse(localStorage.getItem('liked-answers')) || [];
    if (liked) {
      localStorage.setItem('liked-answers', JSON.stringify(saved.filter(a => a.id !== id)));
    } else {
      localStorage.setItem('liked-answers', JSON.stringify([...saved, { id, message, time }]));
    }
    setLiked(!liked);
  }

  return (
    <div className={sender === 'user' ? 'chat-message-user' : 'chat-message-robot'}>
      {sender === 'robot' && (
        <img src={RobotprofileImage} className="chat-message-profile" />
      )}
      <div className="chat-message-text">
        {message === 'loading'
          ? <img src={loadingSpinnerImage} className="loading-spinner" />
          : message
        }
        {time && <div className="chat-message-time">{dayjs(time).format('h:mm A')}</div>}
        {sender === 'robot' && message !== 'loading' && (
          <button className={`like-button ${liked ? 'liked' : ''}`} onClick={toggleLike}>
            {liked ? '👍 Saved' : '👍 Save'}
          </button>
        )}
      </div>
      {sender === 'user' && (
        <img src={userprofileImage} className="chat-message-profile" />
      )}
    </div>
  );
}