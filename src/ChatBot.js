  import React, { useState, useEffect } from 'react';
  import styles from './ChatBot.module.css';

  const ChatBot = ({ existingConversation, readOnly, hh }) => {
    const [messages, setMessages] = useState([
      {
        sender: 'bot',
        text: 'Hai Dermalovers! 👋 Saya siap membantu anda tampil lebih percaya diri. Ada pertanyaan seputar perawatan kulit atau kecantikan hari ini?',
        time: getTime(),
        quickReplies: [
          'List harga layanan Dermalounge',
          'Beri saya info jadwal dokter',
          'Apa saja layanan disini',
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

      setIsLoading(true);
      try {
        // Send to backend
        const response = await fetch('https://bot.kediritechnopark.com/webhook/master-agent/ask', {
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
        sendMessage('gimana')
        console.error('Fetch error:', error);
      } finally {
        setIsLoading(false);
      }
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
                {msg.sender !== 'bot' 
  ? msg.text 
  : (() => {
    try {let cleanText = msg.text.replace(/`/g, '');  // Remove backticks
cleanText = cleanText.substring(4);  // Remove first 4 characters
let parsedObj = JSON.parse(cleanText);

return parsedObj.jawaban;
} catch (e) {
  console.error("JSON parsing error:", e);  // Log error parsing if it occurs
  return msg.text;  // Return an empty string if there is an error
}

    })()}
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
        <div style={{width: '96.6%'}}>
                    <div style={{
            backgroundColor: '#f0f0f0',
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            overflowX: 'auto',
            padding: '8px',
            scrollbarWidth: 'none'
          }}>
            <div
              style={{
                flexShrink: 0,
                background: '#fff',
                border: '1px solid #ccc',
                padding: '8px 12px',
                borderRadius: '20px',
                fontSize: '13px',
                cursor: 'pointer',
                margin: '3px'
              }}
              onClick={() => sendMessage('Dapatkah bopeng dihilangkan?')}
            >
              Dapatkah bopeng dihilangkan?
            </div>
            <div
              style={{
                flexShrink: 0,
                background: '#fff',
                border: '1px solid #ccc',
                padding: '8px 12px',
                borderRadius: '20px',
                fontSize: '13px',
                cursor: 'pointer',
                margin: '3px'
              }}
              onClick={() => sendMessage('Bisa booking treatment untuk besok?')}
            >
              Bisa booking treatment untuk besok?
            </div>
            <div
              style={{
                flexShrink: 0,
                background: '#fff',
                border: '1px solid #ccc',
                padding: '8px 12px',
                borderRadius: '20px',
                fontSize: '13px',
                cursor: 'pointer',
                margin: '3px'
              }}
              onClick={() => sendMessage('Bisa booking treatment untuk besok?')}
            >
              Ada treatment untuk jerawat?
            </div>
          </div>

            </div>
      </div>
    );
  };

  function getTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  export default ChatBot;
