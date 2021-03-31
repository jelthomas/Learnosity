const router = require('express').Router();
let platformData = require('../models/platformData.model');

router.route('/').get((req, res) => {
  platformData.find()
    .then(platformDatas => res.json(platformDatas))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => {
  const user_id = req.body.user_id;
  const platform_id = req.body.platform_id;
  const completed_pages = req.body.completed_pages;
  const is_favorited = req.body.is_favorited;
  const is_completed = req.body.is_completed;
  const recently_played = Date.parse(req.body.recently_played);

  const newplatformData = new platformData({
    user_id, 
    platform_id,
    completed_pages,
    is_favorited, 
    is_completed,
    recently_played
  });

  newplatformData.save()
  .then(() => res.json('PlatformData added!'))
  .catch(err => res.status(400).json('Error: ' + err));
});


module.exports = router;