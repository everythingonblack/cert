  import React, { useState, useEffect } from 'react';
  import styles from './ChatBot.module.css';

  const ChatBot = ({ existingConversation, readOnly, hh }) => {
    const [messages, setMessages] = useState([
      {
        sender: 'bot',
        text: 'Halo 👋 Saya Klinik AI! Ada yang bisa saya bantu?',
        time: getTime(),
        quickReplies: [
          'Bagaimana menghilangkan komedo',
          'Apakah bisa menghilangkan bopeng?',
          'Perutku mual dan kembung',
        ],
      },
    ]);

    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {

      if (existingConversation && existingConversation.length > 0) {
        setMessages(existingConversation);
      }
    }, [existingConversation])
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

        localStorage.setItem('session', JSON.stringify({ sessionId: sessionId, lastSeen: dateNow }))
      }
    }, []);

    const sendMessage = async (textOverride = null) => {
      const message = textOverride || input.trim();
      if (message === '') return;

      // Show user's message immediately
      const newMessages = [
        ...messages,
        { sender: 'user', text: message, time: getTime() },
      ];

      setMessages(newMessages);
      setInput('');

      try {
        // Send to backend
        const response = await fetch('https://bot.kediritechnopark.com/webhook/master-agent/ask/dev', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pertanyaan: message, sessionId: JSON.parse(localStorage.getItem('session')).sessionId, lastSeen: new Date().toISOString() }),
        });

        const data = await response.json();
        console.log(data)
        // Assuming your backend sends back something like: { answer: "text" }
        // Adjust this according to your actual response shape
        const botAnswer = data[0].output[0].text || data[0].output  || 'Maaf, saya tidak mengerti.';

        // Add bot's reply
        setMessages(prev => [
          ...prev,
          { sender: 'bot', text: botAnswer, time: getTime() },
        ]);

        setIsLoading(false);
      } catch (error) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'bot',
            text: 'Maaf, terjadi kesalahan pada server. Silakan coba lagi nanti.',
            time: getTime(),
          },
        ]);
        console.error('Fetch error:', error);
      } finally {
        setIsLoading(false);
      }
        setIsLoading(false);
    };

    return (
      <div className={styles.chatContainer} style={{ height: hh || '100vh' }}>
        <div className={styles.chatHeader}>
          <img src="/dermalounge.jpg" alt="Bot Avatar" />
          <strong>DERMALOUNGE</strong>
        </div>

        <div className={styles.chatBody}>

          {isLoading && (
            <div className={`${styles.messageRow} ${styles.bot}`}>
              <div className={`${styles.message} ${styles.bot}`}>
                <em>Mengetik...</em>
              </div>
            </div>
          )}
          {messages.slice().reverse().map((msg, index) => (
            <div
              key={index}
              className={`${styles.messageRow} ${styles[msg.sender]}`}
            >
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
            </div>
          ))}
        </div>

        <div className={styles.chatInput} style={{ visibility: readOnly ? 'hidden' : 'visible', marginTop: readOnly ? '-59px' : '0px' }}>
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
