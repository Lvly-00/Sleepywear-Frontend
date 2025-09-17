import React, { useEffect, useState } from "react";

const Settings = () => {
  const [profile, setProfile] = useState({ business_name: "", email: "" });
  const [passwords, setPasswords] = useState({ current_password: "", new_password: "", new_password_confirmation: "" });

  useEffect(() => {
    fetch("/api/user/settings", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.json())
      .then(data => setProfile({ business_name: data.business_name, email: data.email }));
  }, []);

  const updateProfile = (e) => {
    e.preventDefault();
    fetch("/api/user/settings", {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(profile)
    })
    .then(res => res.json())
    .then(data => alert(data.message));
  };

  const updatePassword = (e) => {
    e.preventDefault();
    fetch("/api/user/settings/password", {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({
        current_password: passwords.current_password,
        new_password: passwords.new_password,
        new_password_confirmation: passwords.new_password_confirmation
      })
    })
    .then(res => res.json())
    .then(data => alert(data.message));
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto" }}>
      <h2>Profile Information</h2>
      <form onSubmit={updateProfile}>
        <input type="text" placeholder="Business Name" value={profile.business_name} 
          onChange={(e) => setProfile({...profile, business_name: e.target.value})} />
        <input type="email" placeholder="Email" value={profile.email} 
          onChange={(e) => setProfile({...profile, email: e.target.value})} />
        <button type="submit">Update Profile</button>
      </form>

      <h2>Update Password</h2>
      <form onSubmit={updatePassword}>
        <input type="password" placeholder="Current Password" 
          onChange={(e) => setPasswords({...passwords, current_password: e.target.value})} />
        <input type="password" placeholder="New Password" 
          onChange={(e) => setPasswords({...passwords, new_password: e.target.value})} />
        <input type="password" placeholder="Confirm New Password" 
          onChange={(e) => setPasswords({...passwords, new_password_confirmation: e.target.value})} />
        <button type="submit">Change Password</button>
      </form>
    </div>
  );
};

export default Settings;
