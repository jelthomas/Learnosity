const router = require('express').Router();
let user = require('../models/user.model');

router.route('/').get((req, res) => {
    user.find()
    .then(users => res.json(users))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/signup').post((req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const security_question = req.body.security_question;
  const security_answer = req.body.security_answer;
  const total_time_played = Number(req.body.total_time_played);
  const completed_platforms = Number(req.body.completed_platforms);
  const experience_points = Number(req.body.experience_points);

  const newUser = new user({
    username, 
    email,
    password,
    security_question,
    security_answer,
    total_time_played,
    completed_platforms,
    experience_points
  });

  newUser.save()
  .then(() => res.json('User added!'))
  .catch(err => res.status(400).json('Error: ' + err));
});


module.exports = router;