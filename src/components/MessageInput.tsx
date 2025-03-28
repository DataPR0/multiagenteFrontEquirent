import React, { useState } from 'react';
import '../styles/MessageInput.css';

const MessageInput: React.FC<{ onSend: (message: string) => void }> = ({ onSend }) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <div className="message-input">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Escribe un mensaje..."
      />
      <button onClick={handleSend}>Enviar</button>
    </div>
  );
};

export default MessageInput;
