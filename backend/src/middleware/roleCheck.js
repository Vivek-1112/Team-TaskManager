const { db } = require('../config/db');

const isProjectAdmin = (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = db.prepare('SELECT owner_id FROM projects WHERE id = ?').get(projectId);
    const member = db.prepare('SELECT role FROM project_members WHERE project_id = ? AND user_id = ?').get(projectId, req.user.id);
    if (project?.owner_id === req.user.id || member?.role === 'admin' || req.user.role === 'admin') {
      return next();
    }
    res.status(403).json({ error: 'Admin access required' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { isProjectAdmin };
