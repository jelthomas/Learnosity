const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const cors = require("cors");

router.use(cors());

process.env.SECRET_KEY = 'secret';

let user = require('../models/user.model');

router.route('/').get((req, res) => {
    user.find()
    .then(users => res.json(users))
    .catch(err => res.status(400).json('Error: ' + err));
});

// gets Security Question for a User or Email
// specifically selects just the one value 
router.route('/getSecurityQuestion').get((req, res) => {
  user.find({$or:[{username: req.body.identifier},{email:req.body.identifier}]}).select('security_question -_id')
    .then(user => res.json(user))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/:id').get((req, res) => {
  user.findById(req.params.id)
    .then(user => res.json(user))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/delete/:id').delete((req, res) => {
  user.findByIdAndDelete(req.params.id)
      .then(() => res.json('User deleted.'))
      .catch(err => res.status(400).json('Error: ' + err));
});

// router.route('/signup').post((req, res) => {
//   const username = req.body.username;
//   const email = req.body.email;
//   const password = req.body.password;
//   const security_question = req.body.security_question;
//   const security_answer = req.body.security_answer;
//   const total_time_played = req.body.total_time_played;
//   const completed_platforms = req.body.completed_platforms;
//   const experience_points = req.body.experience_points;

//   const newUser = new user({
//     username, 
//     email,
//     password,
//     security_question,
//     security_answer,
//     total_time_played,
//     completed_platforms,
//     experience_points
//   });

//   newUser.save()
//   .then(() => res.json('User added!'))
//   .catch(err => res.status(400).json('Error: ' + err));
// });



router.post('/signup', (req,res)=>{
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const security_question = req.body.security_question;
  const security_answer = req.body.security_answer;
  const total_time_played = req.body.total_time_played;
  const completed_platforms = req.body.completed_platforms;
  const experience_points = req.body.experience_points;

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

  user.findOne({$or:[{username: req.body.username},{email:req.body.email}]})
  .then(tempUser => {
    if(!tempUser){
      bcrypt.hash(req.body.password, 10, (err,hash) =>{
        newUser.password = hash;
        user.create(newUser)
        .then(user => {
          res.json({status: user.username + " registered!"})
        })
        .catch(err =>{
          res.send("Error: " + err);
        })
      })
    }
    else{
      res.json({error: "User already exists"})
    }
  })
  .catch(err =>{
    res.send("Error: " + err);
  })
});

router.post('/login', (req,res)=>{
  user.findOne({$or:[{username: req.body.identifier},{email:req.body.identifier}]})
  .then(tempUser => {
    if(tempUser){
      if(bcrypt.compareSync(req.body.password, tempUser.password)){
        const payload = {
          _id: tempUser._id,
          username: tempUser.username
        }
        let token = jwt.sign(payload, process.env.SECRET_KEY, {
          expiresIn: 1440
        })
        res.send("Successfully logged in " + tempUser.username + ". Token: " + token);
      }
      else{
        res.json({error: "Incorrect Password"})
      }
    }
    else{
      res.status(401).send({
        success: false,
        msg: "Failed to login: User does not exist"
      });
    }
  })
  .catch(err => {
    res.send("Error: " + err);
  })
});







router.route('/update/:id').post((req, res) => {
  user.findById(req.params.id)
      .then(user => {
          user.username = req.body.username;
          user.password = req.body.password;
          user.email = req.body.email;
          user.security_question = req.body.security_question;
          user.security_answer = req.body.security_answer;
          user.is_admin = req.body.is_admin;
          user.created_platforms = req.body.created_platforms;
          user.learned_platforms = req.body.learned_platforms;
          user.profile_picture = req.body.profile_picture;
          user.total_time_played = req.body.total_time_played;
          user.completed_platforms = req.body.completed_platforms;
          user.experience_points = req.body.experience_points;

          user.save()
              .then(() => res.json('User Updated!'))
              .catch(err => res.status(400).json('Error: ' + err));
      })
      .catch(err => res.status(400).json('Error: ' + err));
})

router.route('/updateProfilePicture/:id').post((req, res) => {
  user.findById(req.params.id)
      .then(user => {
        user.profile_picture = req.body.profile_picture;

          user.save()
              .then(() => res.json('User Profile Picture Updated!'))
              .catch(err => res.status(400).json('Error: ' + err));
      })
      .catch(err => res.status(400).json('Error: ' + err));
})
module.exports = router;