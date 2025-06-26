// src/components/Dashboard/FeedbackForm.js
import React, { useState } from 'react';
import axios from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function FeedbackForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('bug');
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submitFeedback = async () => {
    setError('');
    if (!title || !description || !type || !rating) {
      setError('All fields are required.');
      return;
    }
    try {
      await axios.post('/feedback/create', { title, description, type, rating });
      setSubmitted(true);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError('Failed to submit feedback.');
    }
  };

  if (submitted) {
    return <div className="p-6 max-w-xl mx-auto text-green-700 font-bold">Your request has been received!</div>;
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Submit Feedback</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <input className="border p-2 mb-2 w-full" placeholder="Feedback Title" value={title} onChange={e => setTitle(e.target.value)} />
      <textarea className="border w-full p-2 mb-2" rows="3" placeholder="Feedback Description" value={description} onChange={e => setDescription(e.target.value)}></textarea>
      <select className="border p-2 mb-2 w-full" value={type} onChange={e => setType(e.target.value)}>
        <option value="bug">Bug</option>
        <option value="request">Request</option>
        <option value="complaint">Complaint</option>
        <option value="compliment">Compliment</option>
      </select>
      <div className="mb-2">Feedback Status: <span className="font-semibold">Open</span></div>
      <div className="mb-4">
        <label>Star Rating: </label>
        <input type="number" min="1" max="5" className="border p-2 ml-2" onChange={e => setRating(e.target.value)} value={rating} />
      </div>
      <button onClick={submitFeedback} className="bg-green-600 text-white px-4 py-2">Submit</button>
    </div>
  );
}
