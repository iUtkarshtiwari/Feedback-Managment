// src/components/Dashboard/Dashboard.js
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [requests, setRequests] = useState([]);
  const [counts, setCounts] = useState({ open: 0, inProgress: 0, completed: 0, rating: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/feedback/my');
        setRequests(res.data);
        const open = res.data.filter(r => r.status === 'open').length;
        const inProgress = res.data.filter(r => r.status === 'inProgress').length;
        const completed = res.data.filter(r => r.status === 'completed').length;
        const rating = res.data.reduce((a, b) => a + (b.rating || 0), 0) / (res.data.length || 1);
        setCounts({ open, inProgress, completed, rating: rating.toFixed(1) });
      } catch (err) {
        console.error("Failed to fetch feedbacks", err);
      }
    };
    fetchData();
  }, []);

  if (!user) return <div className="p-6">Loading user info...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Welcome, {user.name || user.email}</h1>
        <button className="bg-red-600 text-white px-4 py-2" onClick={() => { logout(); window.location.href = '/'; }}>
          Logout
        </button>
      </div>
      <div className="flex gap-4 mt-4">
        <div>Open Requests: {counts.open}</div>
        <div>In Progress / Completed: {counts.inProgress + counts.completed}</div>
        <div>Rating: {counts.rating} ⭐</div>
      </div>
      <button className="bg-green-600 text-white px-4 py-2 mt-4" onClick={() => navigate('/feedback/create')}>
        Submit Feedback
      </button>
      <h2 className="mt-6 text-xl font-semibold">Your Requests</h2>
      <div className="mt-2">
        {requests.map(req => (
          <div key={req._id} className="border p-2 my-2">
            <div className="font-bold text-lg">{req.title}</div>
            <div className="italic text-sm mb-1">Type: {req.type}</div>
            <div className="mb-1">Status: <span className="font-semibold">{req.status}</span></div>
            <div className="mb-1">Description: {req.description}</div>
            <div>Rating: {req.rating} ⭐</div>
          </div>
        ))}
      </div>
    </div>
  );
}
