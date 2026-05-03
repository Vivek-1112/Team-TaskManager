const router = require('express').Router({ mergeParams: true });
const auth = require('../middleware/auth');
const { createTask, getTasks, updateTask, deleteTask, getMyTasks } = require('../controllers/taskController');
router.get('/my', auth, getMyTasks);
router.post('/:projectId/tasks', auth, createTask);
router.get('/:projectId/tasks', auth, getTasks);
router.put('/tasks/:taskId', auth, updateTask);
router.delete('/tasks/:taskId', auth, deleteTask);
module.exports = router;
