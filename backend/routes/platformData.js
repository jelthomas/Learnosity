const router = require('express').Router();
let platformData = require('../models/platformData.model');

//gets every platform Data
router.route('/').get((req, res) => {
  platformData.find()
    .then(platformDatas => res.json(platformDatas))
    .catch(err => res.status(400).json('Error: ' + err));
});

//get platform Data's using array of Learned Platform Data
router.route('/getLearnedPlatforms').get((req, res) => {
  platformData.find({ _id: {$in : req.body.platformDatas_id}})
    .then(platformDatas => res.json(platformDatas))
    .catch(err => res.status(400).json('Error: ' + err));
});

//gets a platform Data based on ID
router.route('/:id').get((req, res) => {
  platformData.findById(req.params.id)
    .then(platformData => res.json(platformData))
    .catch(err => res.status(400).json('Error: ' + err));
});

//deletes a platform Data based on ID
router.route('/:id').delete((req, res) => {
  platformData.findByIdAndDelete(req.params.id)
      .then(() => res.json('Platform Data deleted.'))
      .catch(err => res.status(400).json('Error: ' + err));
});

//adds a platform Data entry 
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

//updates the platform Data by ID
router.route('/update/:id').post((req, res) => {
  platformData.findById(req.params.id)
      .then(platformData => {
        platformData.user_id = req.body.user_id;
        platformData.platform_id = req.body.platform_id;
        platformData.completed_pages = req.body.completed_pages;
        platformData.is_favorited = req.body.is_favorited;
        platformData.is_completed = req.body.is_completed;
        platformData.recently_played = req.body.recently_played;
          platformData.save()
              .then(() => res.json('Platform Data Updated!'))
              .catch(err => res.status(400).json('Error: ' + err));
      })
      .catch(err => res.status(400).json('Error: ' + err));
})

router.route('/updatePages/:id').post((req, res) => {
  platformData.findById(req.params.id)
      .then(platformData => {
        platformData.completed_pages = req.body.completed_pages;
          platformData.save()
              .then(() => res.json('Platform Data Pages Updated!'))
              .catch(err => res.status(400).json('Error: ' + err));
      })
      .catch(err => res.status(400).json('Error: ' + err));
})

module.exports = router;