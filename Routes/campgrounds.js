// ../ = up one lvel and then into models or utils folder 

const express = require('express')
const router = express.Router()
const catchAsync = require('../utils/catchAsync');
const campgrounds = require('../controllers/campgrounds')

// MULTER AND CLOUDINARY FOR IMAGES USING THE .ENV FILE 
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const Campground = require('../models/campground');
// link to schema validation file;

const { isLoggedIn, isAuthor, validateCampground } = require('../middleware')


// (campgrounds.index)etc     is calling the functions(modules) from ('../controllers/campgrounds')



// router.route   groups together with same path rather than :

// router.get('/',catchAsync(campgrounds.index))
// router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground))



router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))



router.get('/new', isLoggedIn, (campgrounds.renderNewForm))


router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampgrounds))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampgrounds))


router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))





module.exports = router;

// campgrounds is the router and doesnt need to be written on each
// / = campgrounds
// /new = /campgrounds/new etc




// isLoggedin middleware - checks user l;ogged in first
// isAuthor middleware - checks if the user is the author before allowing changes
//  validateCampground, runs the middleware first for validation and then..
// catchAsync eror handler function 





