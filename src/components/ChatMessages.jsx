import { ChatMessage} from './ChatMessage';
import { useAutoScroll} from './useAutoScroll';
import './ChatMessages.css'
export function ChatMessages({ chatMessages }) {
        const chatMessagesRef = useAutoScroll([chatMessages]);

      return (
        <div className="chat-messages-container" ref={chatMessagesRef}>
          {chatMessages.map((chatMessage) => {
            return (
              <ChatMessage
                message={chatMessage.message}
                sender={chatMessage.sender}
                time={chatMessage.time}
                id={chatMessage.id}
                key={chatMessage.id}
              />
            );
          })}
        </div>
      );
    }
