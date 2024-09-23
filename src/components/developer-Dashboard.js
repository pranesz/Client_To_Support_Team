import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './developer.css'; 

const DeveloperDashboard = () => {
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState({});
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const email = localStorage.getItem('email');

  const fetchMessages = async () => {
    try {
      const res = await axios.get('http://localhost:5000/messages', {
        params: { email } // Pass the developer's email to filter messages
      });
      setMessages(res.data);
    } catch (err) {
      console.error('Error fetching messages:', err.response?.data);
    }
  };

  const handleReplyChange = (value) => {
    setReply(prev => ({ ...prev, [selectedMessageId]: value }));
  };

  const handleReplySubmit = async () => {
    if (selectedMessageId) {
      try {
        await axios.post('http://localhost:5000/messages/reply', {
          messageId: selectedMessageId,
          reply: reply[selectedMessageId] || '',
          email,
        });
        
        setReply(prev => ({ ...prev, [selectedMessageId]: '' }));
        fetchMessages();  
        setSelectedMessageId(null);  
      } catch (err) {
        console.error('Error sending reply:', err.response?.data);
      }
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      await axios.post('http://localhost:5000/logout', {}, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      localStorage.removeItem('email');
      localStorage.removeItem('token');
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout failed:', err.response?.data || err.message);
    }
  };

  const handleContextMenu = (e, messageId) => {
    e.preventDefault();
    setSelectedMessageId(messageId);
  };

  useEffect(() => {
    const setAvailability = async () => {
      try {
        await axios.put('http://localhost:5000/developer/available', {
          email,
          available: true,
        });
      } catch (err) {
        console.error('Error setting availability:', err.response?.data);
      }
    };

    setAvailability();
    fetchMessages();

    const intervalId = setInterval(fetchMessages, 3000); // Poll every 3 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, [email]);

  return (
    <div className="dashboard-container">
      <button className="logout-button" onClick={handleLogout}>Logout</button>
      <h1>Developer Dashboard</h1>
      <h2>Messages</h2>
      <div className="message-container">
        <ul className="message-list">
          {messages.map(msg => (
            <li key={msg._id} className="message-item" onContextMenu={(e) => handleContextMenu(e, msg._id)}>
              <p><strong>From:</strong> {msg.sender}</p>
              <p><strong>Message:</strong> {msg.message}</p>
              {msg.reply && (
                <div>
                  <p><strong>Reply:</strong> {msg.reply}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
      {selectedMessageId && (
        <div className="reply-container">
          <textarea
            value={reply[selectedMessageId] || ''}
            onChange={(e) => handleReplyChange(e.target.value)}
            placeholder="Type your reply here..."
          />
          <button onClick={handleReplySubmit}>Send Reply</button>
        </div>
      )}
    </div>
  );
};

export default DeveloperDashboard;
