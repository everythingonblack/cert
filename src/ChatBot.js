import React, { useState, useEffect } from 'react';
import styles from './ChatBot.module.css';
import Camera from './Camera';
import { useSearchParams, useNavigate } from 'react-router-dom';

const ChatBot = ({ existingConversation }) => {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hai! Saya Alle, asisten virtual Dermalounge Clinic. Ada yang bisa Alle bantu hari ini?',
      time: getTime(),
      quickReplies: [
        'Konsultasi Estetik',
        'Konsultasi Kulit & Kelamin'
      ],
    },
  ]);

  const [searchParams, setSearchParams] = useSearchParams();
const navigate = useNavigate();

const isOpenCamera = searchParams.get('camera') === 'open';

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState('');
  const [isPoppedUp, setIsPoppedUp] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    if (existingConversation && existingConversation.length > 0) {
      setMessages(existingConversation);
    }
  }, [existingConversation]);

  useEffect(() => {
    if (!sessionStorage.getItem('session')) {
      function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      }

      const sessionId = generateUUID();
      const dateNow = new Date().toISOString();

      sessionStorage.setItem('session', JSON.stringify({ sessionId: sessionId, lastSeen: dateNow }))
    }
  }, []);

  function base64ToFile(base64Data, filename) {
    const arr = base64Data.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }

  const askToBot = async ({ type = 'text', content, tryCount = 0 }) => {
    const session = JSON.parse(sessionStorage.getItem('session'));
    if (!session || !session.sessionId) return;

    let body;
    let headers;

    const isBase64Image = type === 'image' && typeof content === 'string' && content.startsWith('data:image/');

    if (isBase64Image) {
      const file = base64ToFile(content, 'photo.jpg');
      const formData = new FormData();
      formData.append('sessionId', session.sessionId);
      formData.append('lastSeen', new Date().toISOString());
      formData.append('name', session.name || '');
      formData.append('phoneNumber', session.phoneNumber || '');
      formData.append('type', type);
      formData.append('image', file);

      body = formData;
      headers = {};
    } else {
      body = JSON.stringify({
        sessionId: session.sessionId,
        lastSeen: new Date().toISOString(),
        name: session.name,
        phoneNumber: session.phoneNumber,
        pertanyaan: content,
        type: type,
      });
      headers = { 'Content-Type': 'application/json' };
    }

    try {
      const response = await fetch('https://bot.kediritechnopark.com/webhook/master-agent/ask', {
        method: 'POST',
        headers,
        body,
      });

      const data = await response.json();
      return data;
    } catch (error) {
      if (tryCount < 3) {
        return new Promise((resolve) =>
          setTimeout(() => resolve(askToBot({ type, content, tryCount: tryCount + 1 })), 3000)
        );
      } else {
        console.error('Bot unavailable:', error);
        return { jawaban: 'Maaf saya sedang tidak tersedia sekarang, coba lagi nanti' };
      }
    }
  };

  const handleUploadImage = async (img) => {
  setSearchParams({  })
    const newMessages = [
      ...messages,
      { sender: 'user', img: img, time: getTime() },
    ];
    setMessages(newMessages);
    setIsLoading('Menganalisa gambar anda...');

    const data = await askToBot({ type: 'image', content: img });

    const botAnswer = data.jawaban || 'Maaf, saya tidak bisa menganalisis gambar tersebut.';

    setMessages((prev) => [
      ...prev,
      { sender: 'bot', text: botAnswer, time: getTime() },
    ]);

    setIsLoading('');
  };

  const sendMessage = async (textOverride = null, name, phoneNumber, tryCount = 0) => {
    const message = textOverride || input.trim();
    if (message === '') return;

    const session = JSON.parse(sessionStorage.getItem('session'));
    if ((!session || !session.name || !session.phoneNumber) && messages.length > 2) {
      setIsPoppedUp(message);
      setInput('');
      return;
    }

    const newMessages = [
      ...messages,
      { sender: 'user', text: message, time: getTime() },
    ];

    setMessages(newMessages);
    setInput('');
    setIsLoading('Mengetik...');

    try {
      const data = await askToBot({ type: 'text', content: message, tryCount });

      const botAnswer = data.jawaban || 'Maaf saya sedang tidak tersedia sekarang, coba lagi nanti';

      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: botAnswer, time: getTime() },
      ]);

      setIsLoading('');
    } catch (error) {
      console.error('Error sending message:', error);
      if (tryCount >= 3) {
        setMessages(prev => [
          ...prev,
          { sender: 'bot', text: 'Maaf saya sedang tidak tersedia sekarang, coba lagi nanti', time: getTime() },
        ]);
        setIsLoading('');
      } else {
        setTimeout(() => sendMessage(message, name, phoneNumber, tryCount + 1), 3000);
      }
    }
  };

  function formatBoldText(text) {
    const parts = text.split(/(\*\*[^\*]+\*\*)/g);

    return parts.flatMap((part, index) => {
      const elements = [];

      if (part.startsWith('**') && part.endsWith('**')) {
        part = part.slice(2, -2);
        part.split('\n').forEach((line, i) => {
          if (i > 0) elements.push(<br key={`br-bold-${index}-${i}`} />);
          elements.push(<strong key={`bold-${index}-${i}`}>{line}</strong>);
        });
      } else {
        part.split('\n').forEach((line, i) => {
          if (i > 0) elements.push(<br key={`br-${index}-${i}`} />);
          elements.push(<span key={`text-${index}-${i}`}>{line}</span>);
        });
      }

      return elements;
    });
  }

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <img src="/dermalounge.jpg" alt="Bot Avatar" />
        <strong>DERMALOUNGE</strong>
      </div>

      <div className={styles.chatBody}>
        {isLoading != '' && (
          <div className={`${styles.messageRow} ${styles.bot}`}>
            <div className={`${styles.message} ${styles.bot}`}>
              <em>{isLoading}</em>
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
                ? (msg.text ?
                  msg.text
                  :
                  <img style={{ maxHeight: '300px', maxWidth: '240px', borderRadius: '12px' }} src={msg.img} />
                )
                : (() => {
                  try {
                    return formatBoldText(msg.text);
                  } catch (e) {
                    return msg.text;
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
                  <div
                    className={styles.quickReply}
                    onClick={() => setSearchParams({ camera: 'open' })}
                    style={{ color: 'white', backgroundColor: '#075e54', display: 'flex', flexDirection: 'row', alignItems: 'center' }}
                  >
                    <img style={{ marginRight: '5px', height: '14px', filter: 'invert(1)' }} src={'/camera.png'} />
                    Analisa Gambar
                  </div>
                </div>
              )}
              <div className={styles.timestamp}>{msg.time}</div>
            </div>
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
          disabled={isLoading != ''}
        />

        <button onClick={() => sendMessage()} style={{marginLeft: '-40px'}}disabled={isLoading!=''}>
          <img
            src="/send.png"
            alt="Kirim"
            style={{ height: '20px', filter: 'invert(1)' }}
          />
        </button>

        <button onClick={() => setSearchParams({ camera: 'open' })} disabled={isLoading!=''}>
          <img
            src="/camera.png"
            alt="Kamera"
            style={{ height: '18px', filter: 'invert(1)' }}
          />
        </button>
      </div>

      {isPoppedUp !== '' &&
        <div className={styles.PopUp}>
          <div className={`${styles.message} ${styles['bot']}`}>
            Untuk bisa membantu Anda lebih jauh, boleh saya tahu nama dan nomor telepon Anda?
            Informasi ini juga membantu tim admin kami jika perlu melakukan follow-up nantinya 😊
            <div className={styles.quickReplies} style={{ flexDirection: 'column' }}>
              <input
                className={styles.quickReply}
                placeholder="Nama Lengkapmu"
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
                    if (/^\d{0,11}$/.test(value)) {
                      setPhoneNumber(value);
                    }
                  }}
                />
              </div>

              <div
                className={styles.nextButton}
                onClick={() => {
                  if (name.length > 2 && phoneNumber.length >= 10) {
                    const sessionData = JSON.parse(sessionStorage.getItem('session')) || {};
                    sessionData.name = name;
                    sessionData.phoneNumber = phoneNumber;
                    sessionStorage.setItem('session', JSON.stringify(sessionData));
                    setIsPoppedUp('');
                    sendMessage(isPoppedUp);
                  }
                }}
              >
                Lanjut
              </div>
            </div>
          </div>
        </div>
      }

      {isOpenCamera && (
        <Camera
          handleClose={() => setSearchParams({})}
          handleUploadImage={(e) => handleUploadImage(e)}
        />
      )}
    </div>
  );
};

function getTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default ChatBot;
