
// DiscussedTopics.js
import React from 'react';

const DiscussedTopics = ({ topics }) => {
  return (
    <div>
      <h2>Topik yang Sering Ditanyakan</h2>
      <ul>
        {topics.map((topic, idx) => (
          <li key={idx}><strong>{topic.topic}</strong> - {topic.count} kali</li>
        ))}
      </ul>
    </div>
  );
};

export default DiscussedTopics;