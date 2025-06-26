import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "../../services/api";

const EditProfile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [name, setName] = useState(user.name);

  const handleUpdate = async () => {
    try {
      const res = await axios.put("/api/user/update", { name });
      setUser(res.data.user);
      alert("Profile updated!");
    } catch (err) {
      console.error(err);
      alert("Update failed.");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
      <input
        type="text"
        className="border p-2 w-full mb-4"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={handleUpdate} className="bg-blue-600 text-white px-4 py-2">
        Save Changes
      </button>
    </div>
  );
};

export default EditProfile;
