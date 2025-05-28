import React, { useState, useEffect } from 'react';
import styles from './ChatBot.module.css';

const ChatBot = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Halo 👋 Saya Kloowear AI! Ada yang bisa saya bantu?',
      time: getTime(),
      quickReplies: [
        'Saya ingin beli gelang custom',
        'Ada katalog produk terbaru?',
        'Gelang cocok untuk hadiah?',
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('session')) {
      function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      }

      const sessionId = generateUUID();
      const dateNow = new Date().toISOString();

      localStorage.setItem('session', JSON.stringify({ sessionId: sessionId, lastSeen: dateNow}))
    }
  }, []);

  const sendMessage = async (textOverride = null) => {
    const message = textOverride || input.trim();
    if (message === '') return;

    // Show user's message immediately
    const newMessages = [
      { sender: 'user', text: message, time: getTime() },
      ...messages,
    ];

    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Send to backend
      const response = await fetch('https://n8n.kediritechnopark.my.id/webhook/master-agent/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pertanyaan: newMessages, sessionId: JSON.parse(localStorage.getItem('session')).sessionId, lastSeen: new Date().toISOString() }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      console.log(data)
      // Assuming your backend sends back something like: { answer: "text" }
      // Adjust this according to your actual response shape
      const botAnswer = data[0].output || 'Maaf, saya tidak mengerti.';

      // Add bot's reply
      setMessages(prev => [
        { sender: 'bot', text: botAnswer, time: getTime() },
        ...prev,
      ]);
    } catch (error) {
      setMessages(prev => [
        {
          sender: 'bot',
          text: 'Maaf, terjadi kesalahan pada server. Silakan coba lagi nanti.',
          time: getTime(),
        },
        ...prev,
      ]);
      console.error('Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <img src="https://i.ibb.co/YXxXr72/bot-avatar.png" alt="Bot Avatar" />
        <strong>Kloowear AI Assistant</strong>
      </div>

      <div className={styles.chatBody}>

        {isLoading && (
          <div className={`${styles.messageRow} ${styles.bot}`}>
            <img
              src="https://i.ibb.co/YXxXr72/bot-avatar.png"
              alt="Bot"
              className={styles.avatar}
            />
            <div className={`${styles.message} ${styles.bot}`}>
              <em>Mengetik...</em>
            </div>
          </div>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`${styles.messageRow} ${styles[msg.sender]}`}
          >
            {msg.sender === 'bot' && (
              <img
                src="https://i.ibb.co/YXxXr72/bot-avatar.png"
                alt="Bot"
                className={styles.avatar}
              />
            )}
            <div className={`${styles.message} ${styles[msg.sender]}`}>
              {msg.text}
              {msg.quickReplies && (
                <div className={styles.quickReplies}>
                  {msg.quickReplies.map((reply, i) => (
                    <div
                      key={i}
                      className={styles.quickReply}
                      onClick={() => sendMessage(reply)}
                    >
                      {reply}
                    </div>
                  ))}
                </div>
              )}
              <div className={styles.timestamp}>{msg.time}</div>
            </div>
            {msg.sender === 'user' && (
              <img
                src="https://i.ibb.co/4pDNDk1/user-avatar.png"
                alt="User"
                className={styles.avatar}
              />
            )}
          </div>
        ))}
      </div>

      <div className={styles.chatInput}>
        <input
          type="text"
          placeholder="Ketik pesan..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          disabled={isLoading}
        />
        <button onClick={() => sendMessage()} disabled={isLoading}>
          Kirim
        </button>
      </div>
    </div>
  );
};

function getTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default ChatBot;
