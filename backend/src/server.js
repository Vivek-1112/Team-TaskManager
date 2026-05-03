const express = require('express');
const { initDB } = require('./config/db');

const app = express();
const PORT = 4000;

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') { res.sendStatus(200); return; }
  next();
});

app.use(express.json());

app.get('/', function(req, res) { res.json({ message: 'API Running' }); });

app.post('/api/auth/signup', require('./controllers/authController').signup);
app.post('/api/auth/login', require('./controllers/authController').login);
app.get('/api/auth/me', require('./middleware/auth'), require('./controllers/authController').getMe);
app.get('/api/auth/users', require('./middleware/auth'), require('./controllers/authController').getAllUsers);

app.get('/api/projects', require('./middleware/auth'), require('./controllers/projectController').getProjects);
app.post('/api/projects', require('./middleware/auth'), require('./controllers/projectController').createProject);
app.get('/api/projects/:projectId', require('./middleware/auth'), require('./controllers/projectController').getProject);
app.post('/api/projects/:projectId/members', require('./middleware/auth'), require('./controllers/projectController').addMember);
app.delete('/api/projects/:projectId/members/:userId', require('./middleware/auth'), require('./controllers/projectController').removeMember);
app.delete('/api/projects/:projectId', require('./middleware/auth'), require('./controllers/projectController').deleteProject);

app.post('/api/projects/:projectId/tasks', require('./middleware/auth'), require('./controllers/taskController').createTask);
app.get('/api/projects/:projectId/tasks', require('./middleware/auth'), require('./controllers/taskController').getTasks);
app.put('/api/tasks/:taskId', require('./middleware/auth'), require('./controllers/taskController').updateTask);
app.delete('/api/tasks/:taskId', require('./middleware/auth'), require('./controllers/taskController').deleteTask);
app.get('/api/tasks/my', require('./middleware/auth'), require('./controllers/taskController').getMyTasks);

app.get('/api/dashboard', require('./middleware/auth'), require('./controllers/dashboardController').getDashboard);

initDB();

app.listen(PORT, 'localhost', function() {
  console.log('Server running on port ' + PORT);
});
