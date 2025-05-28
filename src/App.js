import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import axios from 'axios';
import Dashboard from './Dashboard';
import TenantDashboard from './TenantDashboard';
import ChatBot from './ChatBot';

import './App.css';

function App() {
  function ChatBotWrapper() {
  const { agentId } = useParams();
  const [agentDetails, setAgentDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        // const response = await axios.get(
        //   `https://n8n.kediritechnopark.my.id/webhook/get-agent?id=${agentId}`
        // );
        // if (response.data && response.data.length > 0) {
        //   setAgentDetails(response.data[0].data);
        // }
      } catch (error) {
        console.error("Error fetching certificate:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [agentId]);

  // if (loading) return <div>Loading...</div>;
  // if (!agentDetails) return <div>No agent found</div>;

  return <ChatBot agentId={agentId} />;
}
  return (
    <div className='App'>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<TenantDashboard />} />
        <Route path="/:tenantId" element={<ChatBotWrapper />} />
      </Routes>
    </BrowserRouter>
    </div>
  );
}

export default App;
