import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

function App() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Handle incoming messages
    socket.on('chat message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    // Request chat history on mount
    socket.emit('request chat history');
  }, []);

  useEffect(() => {
    // Handle chat history
    socket.on('chat history', (history) => {
      setMessages(history);
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message && username) {
      socket.emit('chat message', { username, message });
      setMessage('');
    }
  };

  return (
    <div>
      <h1>Chat Application</h1>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>
            <strong>{msg.username}: </strong>{msg.message}
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message"
          required
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default App;