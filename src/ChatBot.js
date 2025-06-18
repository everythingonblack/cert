import React, { useState, useEffect } from 'react';
import styles from './ChatBot.module.css';

const ChatBot = ({ existingConversation, readOnly, hh }) => {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hai Dermalovers! 👋 Saya siap membantu anda tampil lebih percaya diri. Ada pertanyaan seputar perawatan kulit atau kecantikan hari ini?',
      time: getTime(),
      quickReplies: [
        'Info layanan Dermalounge',
        'Apa perawatan wajah recommended',
        'Saya ingin konsultasi masalah kulit',
        'Info lokasi & cara booking',
      ],
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  const [isPoppedUp, setIsPoppedUp] = useState(false);
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
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

  const sendMessage = async (textOverride = null, name, phoneNumber, tryCount = 0) => {
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
      const response = await fetch('https://bot.kediritechnopark.com/webhook/master-agent/ask/dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pertanyaan: message, sessionId: JSON.parse(localStorage.getItem('session')).sessionId, lastSeen: new Date().toISOString(), name: JSON.parse(localStorage.getItem('session')).name, phoneNumber: JSON.parse(localStorage.getItem('session')).phoneNumber }),
      });

      const data = await response.json();
      console.log(data)
      // Assuming your backend sends back something like: { answer: "text" }
      // Adjust this according to your actual response shape
      const botAnswer = data.jawaban || 'Maaf, saya tidak mengerti.';

      // Add bot's reply
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: botAnswer, time: getTime() },
      ]);
      
      const session = JSON.parse(localStorage.getItem('session'));

      if ((!session ||   !session.name || !session.phoneNumber) && messages.length > 2) {
        setIsPoppedUp(true);               // munculkan form input
      }

      setIsLoading(false);
    } catch (error) {
      console.log(tryCount)
      if (tryCount > 3) {
        // Add bot's error reply
        setMessages(prev => [
          ...prev,
          { sender: 'bot', text: 'Maaf saya sedang tidak tersedia sekarang, coba lagi nanti', time: getTime() },
        ]);
        setIsLoading(false);
        return;
      }
      setTimeout(() => sendMessage(message, name, phoneNumber, tryCount + 1), 3000);

      console.error('Fetch error:', error);
    }
  };

  return (
    <div className={styles.chatContainer} >
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
                  try {
                    let cleanText = msg.text.replace(/`/g, '');  // Remove backticks
                    cleanText = cleanText.substring(4);  // Remove first 4 characters
                    let parsedObj = JSON.parse(cleanText);

                    return parsedObj.jawaban;
                  } catch (e) {
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

      <div className={styles.chatInput} /*/style={{ visibility: readOnly ? 'hidden' : 'visible'}}/*/>
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
      {isPoppedUp &&
        <div className={styles.PopUp}>
          <div className={`${styles.message} ${styles['bot']}`}>
            Untuk bisa membantu Anda lebih jauh, boleh saya tahu nama dan nomor telepon Anda?
            Informasi ini juga membantu tim admin kami jika perlu melakukan follow-up nantinya 😊
            <div className={styles.quickReplies} style={{ flexDirection: 'column' }}>
              <input
                className={styles.quickReply}
                placeholder="Nama Lengkapmu"
                onFocus={() => console.log('Nama focused')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
              />
              <div className={styles.inputGroup}>
                <span className={styles.prefix}>+62</span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={11}
                  className={styles.quickReply2}
                  placeholder="Nomor HP"
                  value={phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Hanya angka, maksimal 11 karakter
                    if (/^\d{0,11}$/.test(value)) {
                      setPhoneNumber(value);
                    }
                  }}
                  onFocus={() => console.log('Telepon focused')}
                />

              </div>

              <div
                className={styles.quickReply}
                style={{ color: name.length > 2 && phoneNumber.length >= 10 ? 'black' : '#ccc' }}
                onClick={() => {
                  if (name.length > 2 && phoneNumber.length >= 10) {
                    const sessionData = JSON.parse(localStorage.getItem('session')) || {};

                    sessionData.name = name;
                    sessionData.phoneNumber = phoneNumber;

                    localStorage.setItem('session', JSON.stringify(sessionData));
                    setIsPoppedUp(false)
                  }
                }}
              >
                Lanjut
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  );
};

function getTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default ChatBot;
