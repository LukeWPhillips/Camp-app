const express = require('express');
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware')
const reviews = require('../controllers/reviews')

const { reviewSchema } = require('../schemas.js');


const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');


// JOI SCHEMA FROM NPM JOI (validation on the server side)
// middleware.. not app.use as this runs on every single route.
// this is a middleware function to use on selective routes 
// by puttin validateCampground and validate review into seleceted routes 
// schema in Schema.js file




router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))
module.exports = router;


