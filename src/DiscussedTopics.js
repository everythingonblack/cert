
// DiscussedTopics.js
import React from 'react';

const DiscussedTopics = ({ topics }) => {
  return (
    <div>
      <h2>Top Topic</h2>
      <ul>
        {topics.map((topic, idx) => (
          <li key={idx}><strong>{topic.topic}</strong> - {topic.count} x</li>
        ))}
      </ul>
    </div>
  );
};

export default DiscussedTopics;