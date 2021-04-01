const router = require('express').Router();
let pageFormat = require('../models/pageFormat.model');

router.route('/').get((req, res) => {
    pageFormat.find()
      .then(pageFormats => res.json(pageFormats))
      .catch(err => res.status(400).json('Error: ' + err));
  });

router.route('/:id').get((req, res) => {
    pageFormat.findById(req.params.id)
      .then(pageFormat => res.json(pageFormat))
      .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/:id').delete((req, res) => {
    pageFormat.findByIdAndDelete(req.params.id)
        .then(() => res.json('PageFormat deleted.'))
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => {
   const type = req.body.type;
   const prompt = req.body.prompt;
   const audio_file = req.body.audio_file;
   const page_title = req.body.page_title;
   const multiple_choices = req.body.multiple_choices;
   const multiple_choice_answer = req.body.multiple_choice_answer;
   const matching_pairs = req.body.matching_pairs;
   const fill_in_the_blank_answers = req.body.fill_in_the_blank_answers;
   const clock = req.body.clock;
   const timer_answers = req.body.timer_answers;
    
   const newpageFormat = new pageFormat({
    type,
    prompt,
    audio_file,
    page_title,
    multiple_choices,
    multiple_choice_answer,
    matching_pairs,
    fill_in_the_blank_answers,
    clock,
    timer_answers
   });

   newpageFormat.save()
   .then(() => res.json('PageFormat added!'))
   .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/update/:id').post((req, res) => {
    pageFormat.findById(req.params.id)
        .then(pageFormat => {
            pageFormat.type = req.body.type;
            pageFormat.prompt = req.body.prompt;
            pageFormat.audio_file = req.body.audio_file;
            pageFormat.page_title = req.body.page_title;
            pageFormat.multiple_choices = req.body.multiple_choices;
            pageFormat.multiple_choice_answer = req.body.multiple_choice_answer;
            pageFormat.matching_pairs = req.body.matching_pairs;
            pageFormat.fill_in_the_blank_answers = req.body.fill_in_the_blank_answers;
            pageFormat.clock = req.body.clock;
            pageFormat.timer_answers = req.body.timer_answers;

            pageFormat.save()
                .then(() => res.json('Page Format Updated!'))
                .catch(err => res.status(400).json('Error: ' + err));
        })
        .catch(err => res.status(400).json('Error: ' + err));
})

module.exports = router;