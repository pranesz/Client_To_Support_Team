import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './user.css';

const UserDashboard = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]); // Store both user messages and replies
  const [developersAvailable, setDevelopersAvailable] = useState(true);
  const [developerEmail, setDeveloperEmail] = useState(null);

  const checkDeveloperAvailability = async () => {
    try {
      const res = await axios.get('http://localhost:5000/developers/available');
      const availableDev = res.data.find(dev => dev.available);
      if (availableDev) {
        setDevelopersAvailable(true);
        setDeveloperEmail(availableDev.email);
      } else {
        setDevelopersAvailable(false);
      }
    } catch (err) {
      console.error('Error fetching developer availability:', err.response?.data);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!developersAvailable) {
      alert('No developers are currently available. Please try again later.');
      return;
    }

    try {
      const senderEmail = localStorage.getItem('email');
      await axios.post('http://localhost:5000/messages', {
        message,
        sender: senderEmail,
        developer: developerEmail, // Include developer's email
      });
      setMessage(''); // Clear message input
      alert('Message sent');
      fetchMessages(); // Fetch messages after sending a message
    } catch (err) {
      console.error('Error sending message:', err.response?.data);
    }
  };

  const fetchMessages = async () => {
    try {
      const userEmail = localStorage.getItem('email');
      const res = await axios.get('http://localhost:5000/messages', {
        params: { email: userEmail }
      });
      setMessages(res.data);
    } catch (err) {
      console.error('Error fetching messages:', err.response?.data);
    }
  };

  useEffect(() => {
    checkDeveloperAvailability();
    fetchMessages();

    const intervalId = setInterval(fetchMessages, 3000); // Poll every 3 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const sortedMessages = messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  return (
    <div className="dashboard-container">
      <h1>User Dashboard</h1>
      {developerEmail && <h2 className="developer-email">Chatting with: {developerEmail}</h2>}

      <div className="conversation-container">
        <ul className="messages-list">
          {sortedMessages.map((msg) => (
            <li key={msg._id} className={`message-item ${msg.sender === localStorage.getItem('email') ? 'user-message' : 'developer-message'}`}>
              <p className="message">
                <strong>{msg.sender === localStorage.getItem('email') ? 'You' : msg.developer}:</strong>
                <span>{msg.message }</span>
              </p>
              <p className="reply">
              <span>Developer :{msg.reply}</span>
              </p>
            </li>
          ))}
        </ul>
      </div>

      <form className="message-form" onSubmit={handleSubmit}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          placeholder="Type your message here..."
        />
        <button type="submit">Send Message</button>
      </form>
    </div>
  );
};

export default UserDashboard;
