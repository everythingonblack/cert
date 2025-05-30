import React, { useState } from 'react';
import ChatBot from './ChatBot'; // Adjust path if needed

const modalStyle = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  background: '#fff',
  padding: '5px',
  zIndex: 1000,
  borderRadius: '12px',
  maxHeight: '70%',
  overflowY: 'auto',
};

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  zIndex: 999,
};

const boxStyle = {
  backgroundColor: '#f0f0f0',
  padding: '16px 20px',
  margin: '12px 0',
  borderRadius: '12px',
  cursor: 'pointer',
  fontWeight: 'bold',
};

const Conversations = ({ conversations }) => {
  const [selectedConv, setSelectedConv] = useState(null);

  const closeModal = () => setSelectedConv(null);

  return (
    <div>
      <h2>Daftar Percakapan</h2>
      {conversations.map((conv, idx) => (
        <div
          key={idx}
          style={boxStyle}
          onClick={() => {console.log(conv);setSelectedConv(conv.messages);}}
        >
          Conversation #{idx + 1}
        </div>
      ))}

      {selectedConv && (
        <>
          <div style={overlayStyle} onClick={closeModal} />
          <div style={modalStyle}>
            <ChatBot existingConversation={selectedConv} readOnly={true} hh={'60vh'}/>
          </div>
        </>
      )}
    </div>
  );
};

export default Conversations;
