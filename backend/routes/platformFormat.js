const router = require('express').Router();
let platformFormat = require('../models/platformFormat.model');

router.route('/').get((req, res) => {
    platformFormat.find()
      .then(platformFormats => res.json(platformFormats))
      .catch(err => res.status(400).json('Error: ' + err));
  });

router.route('/:id').get((req, res) => {
    platformFormat.findById(req.params.id)
      .then(platformFormat => res.json(platformFormat))
      .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/:id').delete((req, res) => {
    platformFormat.findByIdAndDelete(req.params.id)
        .then(() => res.json('Platform Format deleted.'))
        .catch(err => res.status(400).json('Error: ' + err));
});

 router.route('/add').post((req, res) => {
    const plat_name = req.body.plat_name;
    const owner = req.body.owner;
    const is_public = req.body.is_public;
    const privacy_password = req.body.privacy_password;
    const cover_photo = req.body.cover_photo;
    const pages = req.body.pages;
    const is_published = req.body.is_published;
    
    const newplatformFormat = new platformFormat({
     plat_name,
     owner,
     is_public,
     privacy_password,
     cover_photo,
     pages,
     is_published,
    });

    newplatformFormat.save()
    .then(() => res.json('Platform Format added!'))
    .catch(err => res.status(400).json('Error: ' + err));
 });

 router.route('/update/:id').post((req, res) => {
     platformFormat.findById(req.params.id)
         .then(platformFormat => {
          platformFormat.plat_name = req.body.plat_name;
          platformFormat.owner = req.body.owner;
          platformFormat.is_public = req.body.is_public;
          platformFormat.privacy_password = req.body.privacy_password;
          platformFormat.cover_photo = req.body.cover_photo;
          platformFormat.pages = req.body.pages;
          platformFormat.is_published = req.body.is_published;

          platformFormat.save()
                 .then(() => res.json('Platform Format Updated!'))
                 .catch(err => res.status(400).json('Error: ' + err));
         })
         .catch(err => res.status(400).json('Error: ' + err));
 })

module.exports = router;