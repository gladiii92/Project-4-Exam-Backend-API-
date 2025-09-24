const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const bodyParser = require('body-parser');
let users = [];
let exercises = [];
let userCounter = 1;

app.use(cors())
app.use(express.static('public'))

app.use(bodyParser.urlencoded( {extended: false}));
app.use(bodyParser.json());

app.post('/api/users', (req, res) => {
  const username = req.body.username;

  const newUser = {
    username: username,
    _id: String(userCounter++)
  };

  users.push(newUser);

  res.json(newUser);
});

app.post('/api/users/:_id/exercises', (req, res) => {
  const userId = req.params._id;
  const user = users.find(u => u._id === userId);

  if (!user) return res.json({ error: 'User not found'});

  const { description, duration, date } = req.body;

  const exerciseDate = date ? new Date(date) : new Date();

  const newExercise = {
    userId: userId,
    description: String(description),
    duration: Number(duration),
    date: exerciseDate.toDateString()
  };

  exercises.push(newExercise);

  res.json({
    username: user.username,
    description: newExercise.description,
    duration: newExercise.duration,
    date: newExercise.date,
    _id: user._id
  });
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.get('/api/users/:_id/logs', (req, res) => {
  const userId = req.params._id;
  const user = users.find(u => u._id === userId)

  if (!user) return res.json({ error: 'User not found' });

  let userExercises = exercises.filter(e => e.userId === userId);
  const totalCount = userExercises.length;
  const { from, to, limit } = req.query;

  if (from) {
    const fromDate = new Date(from);
    userExercises = userExercises.filter(e => new Date(e.date) >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    userExercises = userExercises.filter(e => new Date(e.date) <= toDate);
  }

  if (limit) {
    userExercises = userExercises.slice(0, Number(limit));
  }

  res.json({
    username: user.username,
    count: totalCount,
    _id: user._id,
    log: userExercises.map(e => ({
      description: e.description,
      duration: e.duration,
      date: e.date
    }))
  });
});





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
