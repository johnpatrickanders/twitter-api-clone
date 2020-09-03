const express = require('express');

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    message: "test index root"
  })
});

module.exports = {
  tweets: require('./tweets'),
  router,
  users: require('./users')
}
