import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { jwtDecode } from "jwt-decode";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const validateEmail = (email) => /.+@.+\..+/.test(email);

  const handleSignup = async () => {
    setError("");
    if (!name || !email || !password) {
      setError("All fields are required.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Invalid email format.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    try {
      const res = await axios.post("/signup", { name, email, password });
      localStorage.setItem("token", res.data.token);
      const decoded = jwtDecode(res.data.token);
      login(decoded);
      setName(""); setEmail(""); setPassword("");
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Try again.");
    }
  };

  return (
    <div className="p-8 max-w-sm mx-auto">
      <h2 className="text-xl font-bold mb-4">Signup</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <input className="border p-2 mb-2 w-full" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input className="border p-2 mb-2 w-full" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="border p-2 mb-4 w-full" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleSignup} className="bg-green-600 text-white px-4 py-2 w-full mb-2">Signup</button>
      <button onClick={() => navigate('/')} className="text-blue-600 underline w-full">Already have an account? Login</button>
    </div>
  );
}
