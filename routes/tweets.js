const express = require('express');

const router = express.Router();

const { check, validationResult } = require('express-validator')

const db = require('../db/models');
const { Tweet } = db;

const asyncHandler = handler => (req, res, next) => handler(req, res, next).catch(next);

const messageValidator = [
  check('message')
    .exists({ checkFalsy: true })
    .withMessage('Please enter a message'),
  check('message')
    .isLength({ max: 280 })
    .withMessage('No more than 280 characters.')
]

// Custom error handlers.
const handleValidationErrors = (req, res, next) => {
  const validationErrors = validationResult(req);
  // TODO: Generate error object and invoke next middleware function
  if (!validationErrors.isEmpty()) {
    const errors = validationErrors.array().map((error) => error.msg);

    const err = Error("Bad request.");
    err.errors = errors;
    err.status = 400;
    err.title = "Bad request.";
    return next(err);
  }
  next();
};

const tweetNotFoundError = tweetId => {
  const err = new Error(`Tweet ${tweetId} not found`);
  err.title = 'Tweet not found.';
  err.status = 404;
  return err;
}

router.get('/', asyncHandler(async (req, res) => {
  const tweets = await Tweet.findAll();
  res.json({ tweets })
}))

router.get('/:id(\\d+)', asyncHandler(async (req, res, next) => {
  const tweetId = parseInt(req.params.id, 10);
  const tweet = await Tweet.findByPk(tweetId);
  if (tweet) res.json({ tweet })
  else next(tweetNotFoundError(tweetId))
}))

router.post('/', messageValidator, handleValidationErrors, asyncHandler(async (req, res) => {
  const { message } = req.body;
  const tweets = await Tweet.create({ message });
  res.json({ tweets })
}))

router.put('/:id(\\d+)', messageValidator, handleValidationErrors, asyncHandler(async (req, res, next) => {
  const tweetId = parseInt(req.params.id, 10);
  const tweet = await Tweet.findByPk(tweetId);
  if (tweet) {
    tweet.message = req.body.message;
    await tweet.save();
    res.json({ tweet })
  } else {
    next(tweetNotFoundError(tweetId))
  }
}))

router.delete('/:id(\\d+)', messageValidator, handleValidationErrors, asyncHandler(async (req, res, next) => {
  const tweetId = parseInt(req.params.id, 10);
  const tweet = await Tweet.findByPk(tweetId);
  if (tweet) {
    await tweet.destroy();
    res.status(204).end();
  } else {
    next(tweetNotFoundError(tweetId))
  }
}))


// ------

// router.post(
//   "/",
//   validateTask,
//   handleValidationErrors,
//   asyncHandler(async (req, res) => {
//     const { name } = req.body;
//     const task = await Task.create({ name });
//     res.status(201).json({ task });
//   })
// );




module.exports = router;
