import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });
  const [show, setShow] = useState(false);
  const nav = useNavigate();
  const { user } = useAuth();

  const load = () => api.get('/projects').then(r => setProjects(r.data));
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    await api.post('/projects', form);
    setForm({ name: '', description: '' }); setShow(false); load();
  };

  const deleteProject = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Delete this project and all its tasks?')) {
      await api.delete(`/projects/${id}`); load();
    }
  };

  const cardStyle = { background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', cursor: 'pointer', marginBottom: '1rem', transition: 'box-shadow 0.2s' };

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ color: '#1e293b', margin: 0 }}>Projects</h1>
          <p style={{ color: '#64748b', margin: '0.25rem 0 0' }}>{user?.role === 'admin' ? 'Manage all projects and teams' : 'Your assigned projects'}</p>
        </div>
        {user?.role === 'admin' && (
          <button onClick={() => setShow(!show)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer' }}>+ New Project</button>
        )}
      </div>

      {user?.role !== 'admin' && (
        <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', color: '#0369a1' }}>
          You are viewing projects you have been added to. Contact an admin to create new projects.
        </div>
      )}

      {show && user?.role === 'admin' && (
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Create New Project</h3>
          <form onSubmit={create}>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Project Name" required style={{ width: '100%', padding: '0.75rem', marginBottom: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" style={{ width: '100%', padding: '0.75rem', marginBottom: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box', height: '80px' }} />
            <button type="submit" style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '8px', cursor: 'pointer' }}>Create Project</button>
          </form>
        </div>
      )}

      {projects.length === 0 ?
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          <p style={{ fontSize: '1.1rem' }}>No projects yet.</p>
          {user?.role === 'admin' && <p>Click "+ New Project" to get started.</p>}
          {user?.role !== 'admin' && <p>Ask an admin to add you to a project.</p>}
        </div> :
        projects.map(p => (
          <div key={p.id} style={cardStyle} onClick={() => nav(`/projects/${p.id}`)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ color: '#1e293b', marginBottom: '0.5rem', margin: '0 0 0.5rem' }}>{p.name}</h3>
                <p style={{ color: '#64748b', marginBottom: '0.5rem', margin: '0 0 0.5rem' }}>{p.description || 'No description'}</p>
                <small style={{ color: '#94a3b8' }}>Owner: {p.owner_name} | Created: {new Date(p.created_at).toLocaleDateString()}</small>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ background: '#dbeafe', color: '#3b82f6', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem' }}>
                  {user?.role === 'admin' ? 'Admin' : 'Member'}
                </span>
                {user?.role === 'admin' && (
                  <button onClick={(e) => deleteProject(e, p.id)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '0.3rem 0.7rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>Delete</button>
                )}
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};
export default Projects;
