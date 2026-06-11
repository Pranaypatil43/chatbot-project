import dayjs from 'dayjs'
import { useState } from 'react'
import loadingSpinnerImage from '../assets/loading-spinner.gif';
import { getGroqResponse } from '../groq';
import './ChatInput.css'
export function ChatInput({ chatMessages, setChatMessages }) {
      const [inputText, setInputText] = useState('');
      const [isLoading, setIsLoading] = useState(false);

      function saveInputText(event) {
        setInputText(event.target.value);
      }

      async function sendMessage(){
        if (isLoading || inputText === '') return;

        setIsLoading(true);

        const newChatMessages = [
          ...chatMessages,
          {
            message: inputText,
            sender: 'user',
            id: crypto.randomUUID(),
            time : dayjs().valueOf()
          }
        ];

        setInputText('');

        // loading (spinner from code 2)
        setChatMessages([
          ...newChatMessages,
          {
            message: 'loading',
            sender: 'robot',
            id: 'loading-spinner',
            time: dayjs().valueOf()
          }
        ]);

        const response = await getGroqResponse(inputText);

        setChatMessages([
          ...newChatMessages,
          {
            message: response,
            sender: 'robot',
            id: crypto.randomUUID()
          }
        ]);

        setIsLoading(false);
      }

      function handleKeyDown(event){
        if(event.key === 'Enter'){
          sendMessage();
        } else if(event.key === 'Escape'){
          setInputText('');
        }
      }

      return (
        <div className="chat-input-container">
          <input
            placeholder="Send a message to Chatbot"
            size="30"
            onChange={saveInputText}
            value={inputText}
            onKeyDown={handleKeyDown}
            className="chat-input"
          />
          <button onClick={sendMessage} className="send-button">Send</button>
          <button onClick={() => setChatMessages([])} className="clear-button">Clear</button>
        </div>
      );
    }
