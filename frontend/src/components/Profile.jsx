import React, { useState, useRef } from 'react';
import { User, Mail, Phone, Calendar, MapPin, Shield, Check, X, KeySquare, Image as ImageIcon } from 'lucide-react';

function Profile() {
  // Application State
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Mock State mimicking a Users table record
  const [user, setUser] = useState({
    name: 'Harshad Thok',
    email: 'harshad.thok@example.com',
    phone: '+91 9876543210',
    memberSince: 'March 2026',
    address: 'Pune, Maharashtra',
    role: 'Passenger',
    avatar: null
  });

  const fileInputRef = useRef(null);

  // Temporary state for edits before saving
  const [editForm, setEditForm] = useState(user);
  
  // Password State
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const saveProfile = () => {
    setUser(editForm);
    setIsEditing(false);
    alert(`Profile updated successfully!\nSimulated SQL: UPDATE Users SET first_name='...', email='...' WHERE user_id = ...`);
  };

  const cancelEdit = () => {
    setEditForm(user);
    setIsEditing(false);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File is too large! Please select an image under 2MB.");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser({ ...user, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const handlePasswordChange = () => {
    if (passwords.new !== passwords.confirm) {
        alert("New passwords do not match!");
        return;
    }
    if (passwords.new.length < 6) {
        alert("Password must be at least 6 characters long.");
        return;
    }
    alert("Password changed successfully!\nSimulated SQL: UPDATE Users SET password_hash='...' WHERE user_id = ...");
    setIsChangingPassword(false);
    setPasswords({ current: '', new: '', confirm: '' });
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <User size={28} color="var(--emerald-500)" />
          My Profile
        </h1>
        <p style={{ color: 'var(--slate-400)', marginTop: '0.5rem' }}>Manage your personal information and account settings.</p>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
        {/* Avatar Section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', minWidth: '200px' }}>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleAvatarChange} 
            accept="image/*" 
            style={{ display: 'none' }} 
          />
          <div style={{ 
            width: '120px', height: '120px', borderRadius: '50%', 
            backgroundColor: 'var(--slate-700)', display: 'flex', justifyContent: 'center', alignItems: 'center',
            fontSize: '3rem', color: 'var(--emerald-400)', border: '4px solid var(--slate-600)',
            overflow: 'hidden', position: 'relative'
          }}>
            {user.avatar ? (
              <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              user.name.split(' ').map(n => n[0]).join('')
            )}
          </div>
          <button className="btn btn-secondary" onClick={triggerFileSelect}>
            <ImageIcon size={16} /> Change Avatar
          </button>
        </div>

        {/* Info Grid */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Edit Or View Mode */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            
            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={14} /> Full Name</label>
              {isEditing ? (
                  <input type="text" className="form-control" name="name" value={editForm.name} onChange={handleEditChange} />
              ) : (
                  <div style={{ color: 'white', padding: '0.5rem 0', fontWeight: '500', fontSize: '1.1rem', borderBottom: '1px solid var(--slate-700)' }}>{user.name}</div>
              )}
            </div>

            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={14} /> Email Address</label>
              {isEditing ? (
                  <input type="email" className="form-control" name="email" value={editForm.email} onChange={handleEditChange} />
              ) : (
                  <div style={{ color: 'white', padding: '0.5rem 0', fontWeight: '500', fontSize: '1.1rem', borderBottom: '1px solid var(--slate-700)' }}>{user.email}</div>
              )}
            </div>

            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={14} /> Phone Number</label>
              {isEditing ? (
                  <input type="text" className="form-control" name="phone" value={editForm.phone} onChange={handleEditChange} />
              ) : (
                  <div style={{ color: 'white', padding: '0.5rem 0', fontWeight: '500', fontSize: '1.1rem', borderBottom: '1px solid var(--slate-700)' }}>{user.phone}</div>
              )}
            </div>

            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={14} /> Location</label>
              {isEditing ? (
                  <input type="text" className="form-control" name="address" value={editForm.address} onChange={handleEditChange} />
              ) : (
                  <div style={{ color: 'white', padding: '0.5rem 0', fontWeight: '500', fontSize: '1.1rem', borderBottom: '1px solid var(--slate-700)' }}>{user.address}</div>
              )}
            </div>
            
            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={14} /> Joined Date</label>
              <div style={{ color: 'white', padding: '0.5rem 0', fontWeight: '500', fontSize: '1.1rem', borderBottom: '1px solid var(--slate-700)' }}>{user.memberSince}</div>
            </div>

            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Shield size={14} /> Account Role</label>
              <div style={{ color: 'white', padding: '0.5rem 0', fontWeight: '500', fontSize: '1.1rem', borderBottom: '1px solid var(--slate-700)' }}>
                <span className="badge badge-confirmed">{user.role}</span>
              </div>
            </div>
            
          </div>
          
          {/* Action Buttons */}
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
             {isEditing ? (
                 <>
                    <button className="btn btn-primary" onClick={saveProfile}><Check size={18} /> Save Changes</button>
                    <button className="btn btn-secondary" onClick={cancelEdit}><X size={18} /> Cancel</button>
                 </>
             ) : (
                 <button className="btn btn-primary" onClick={() => setIsEditing(true)}>Edit Profile</button>
             )}

             {!isEditing && (
                 <button className="btn btn-secondary" onClick={() => setIsChangingPassword(!isChangingPassword)}>
                    <KeySquare size={18} /> {isChangingPassword ? 'Cancel Password Change' : 'Change Password'}
                 </button>
             )}
          </div>

          {/* Change Password Inline Form */}
           {isChangingPassword && (
              <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'var(--slate-800)', borderRadius: '0.5rem', border: '1px solid var(--slate-700)', animation: 'fadeIn 0.3s ease-out' }}>
                  <h3 style={{ color: 'var(--emerald-400)', marginBottom: '1rem', fontSize: '1.1rem' }}>Update Security Credentials</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
                      <div className="input-group">
                          <label className="input-label">Current Password</label>
                          <input type="password" className="form-control" value={passwords.current} onChange={(e) => setPasswords({...passwords, current: e.target.value})} />
                      </div>
                      <div className="input-group">
                          <label className="input-label">New Password</label>
                          <input type="password" className="form-control" value={passwords.new} onChange={(e) => setPasswords({...passwords, new: e.target.value})} />
                      </div>
                      <div className="input-group">
                          <label className="input-label">Confirm New Password</label>
                          <input type="password" className="form-control" value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} />
                      </div>
                      <button className="btn btn-primary" onClick={handlePasswordChange} style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>Update Password</button>
                  </div>
              </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Profile;
