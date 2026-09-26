import dayjs from 'dayjs';
import { useState } from 'react';
import './ChatMessage.css';

// ── Markdown-lite renderer ──────────────────────────────────────────────────
// Handles: **bold**, *italic*, `code`, numbered sections (### or "01. Title"),
// bullet lists (- item), and plain paragraphs.
function renderContent(text) {
  const lines = text.split('\n');
  const elements = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    // Skip blank lines between blocks
    if (line === '') { i++; continue; }

    // Numbered card: "### Title" or "**01. Title**" or "01. Title"
    const cardMatch = line.match(/^(?:#{1,3}\s+|(?:\*\*)?(\d{2})\.\s+)(.+?)(?:\*\*)?$/);
    if (cardMatch) {
      const num = cardMatch[1];
      const title = cardMatch[2].replace(/\*\*/g, '');
      // Collect description lines following the header
      const descLines = [];
      i++;
      while (i < lines.length && lines[i].trim() !== '' && !lines[i].trim().match(/^(?:#{1,3}\s+|(?:\*\*)?(\d{2})\.\s+)/)) {
        descLines.push(lines[i].trim().replace(/^[-•]\s*/, ''));
        i++;
      }
      elements.push(
        <div className="ai-card" key={key++}>
          {num && <span className="ai-card-num">{num}</span>}
          <div className="ai-card-body">
            <div className="ai-card-title">{title}</div>
            {descLines.length > 0 && (
              <div className="ai-card-desc">{descLines.join(' ')}</div>
            )}
          </div>
        </div>
      );
      continue;
    }

    // Bullet list
    if (line.startsWith('- ') || line.startsWith('• ')) {
      const items = [];
      while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('• '))) {
        items.push(lines[i].trim().replace(/^[-•]\s*/, ''));
        i++;
      }
      elements.push(
        <ul className="ai-list" key={key++}>
          {items.map((item, idx) => (
            <li key={idx}>{inlineFormat(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // Regular paragraph
    elements.push(<p key={key++}>{inlineFormat(line)}</p>);
    i++;
  }

  return elements;
}

// Inline: **bold**, *italic*, `code`
function inlineFormat(text) {
  const parts = [];
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`/g;
  let last = 0, m;
  let key = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1]) parts.push(<strong key={key++}>{m[1]}</strong>);
    else if (m[2]) parts.push(<em key={key++}>{m[2]}</em>);
    else if (m[3]) parts.push(<code className="inline-code" key={key++}>{m[3]}</code>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length > 0 ? parts : text;
}
// ────────────────────────────────────────────────────────────────────────────

export function ChatMessage({ message, sender, time, id }) {
  const [liked, setLiked] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('liked-answers')) || [];
    return saved.some(a => a.id === id);
  });
  const [copied, setCopied] = useState(false);

  function toggleLike() {
    const saved = JSON.parse(localStorage.getItem('liked-answers')) || [];
    if (liked) {
      localStorage.setItem('liked-answers', JSON.stringify(saved.filter(a => a.id !== id)));
    } else {
      localStorage.setItem('liked-answers', JSON.stringify([...saved, { id, message, time }]));
    }
    setLiked(!liked);
  }

  function copyMessage() {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isLoading = message === 'loading';

  if (sender === 'user') {
    return (
      <div className="msg-user-row">
        <div className="msg-user-bubble">{message}</div>
      </div>
    );
  }

  return (
    <div className="msg-ai-row">
      <div className="msg-ai-avatar">🌿</div>
      <div className="msg-ai-card">
        {isLoading ? (
          <div className="typing-dots">
            <span /><span /><span />
          </div>
        ) : (
          <>
            <div className="msg-ai-content">
              {renderContent(message)}
            </div>
            <div className="msg-ai-footer">
              <span className="msg-ai-time">
                {time ? dayjs(time).format('h:mm A') : ''}
              </span>
              <div className="msg-ai-actions">
                <button className="action-btn" onClick={copyMessage} title="Copy">
                  {copied ? '✓' : '⧉'}
                </button>
                <button
                  className={`action-btn ${liked ? 'action-liked' : ''}`}
                  onClick={toggleLike}
                  title={liked ? 'Unsave' : 'Save'}
                >
                  {liked ? '▲' : '△'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
