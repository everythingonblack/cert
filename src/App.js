import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import axios from 'axios';

import Dashboard from './Dashboard';
import TenantDashboard from './TenantDashboard';
import ChatBot from './ChatBot';
import Login from './Login';

import './App.css';

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

  return <ChatBot agentId={agentId} />;
}

// ✅ Komponen proteksi route
const ProtectedRoute = ({ element }) => {
  const token = localStorage.getItem('token');
  return token ? element : <Navigate to="/login" />;
};

function App() {
  return (
    <div className='App'>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ChatBotWrapper />} />
          <Route path="/login" element={<Login />} />
          {/* ✅ Route /dashboard diproteksi */}
          <Route
            path="/dashboard"
            element={<ProtectedRoute element={<Dashboard />} />}
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
