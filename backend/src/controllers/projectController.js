const { db } = require('../config/db');

exports.createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Project name required' });
    const result = db.prepare('INSERT INTO projects (name, description, owner_id) VALUES (?, ?, ?)').run(name, description || '', req.user.id);
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid);
    db.prepare('INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)').run(project.id, req.user.id, 'admin');
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const projects = db.prepare(`
      SELECT p.*, u.name as owner_name FROM projects p
      JOIN project_members pm ON p.id = pm.project_id
      JOIN users u ON p.owner_id = u.id
      WHERE pm.user_id = ? ORDER BY p.created_at DESC
    `).all(req.user.id);
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = db.prepare('SELECT p.*, u.name as owner_name FROM projects p JOIN users u ON p.owner_id = u.id WHERE p.id = ?').get(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const members = db.prepare('SELECT u.id, u.name, u.email, pm.role FROM users u JOIN project_members pm ON u.id = pm.user_id WHERE pm.project_id = ?').all(projectId);
    res.json({ ...project, members });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { email, role } = req.body;
    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (!user) return res.status(404).json({ error: 'User not found' });
    db.prepare('INSERT OR IGNORE INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)').run(projectId, user.id, role || 'member');
    res.json({ message: 'Member added successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    db.prepare('DELETE FROM project_members WHERE project_id = ? AND user_id = ?').run(projectId, userId);
    res.json({ message: 'Member removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    db.prepare('DELETE FROM projects WHERE id = ?').run(projectId);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
