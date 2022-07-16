// FUNCTIONALITY FOR CAMPGROUNDS(ROUTES)

// Module.exports = modules need to be exported so they can be used(required) elswhere
// in this case (./routes/campgrounds)

const e = require('connect-flash');
const Campground = require('../models/campground');
const { cloudinary } = require("../cloudinary")
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })

// Show campgrounds MAIN page
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })

}

// New Page
module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
}

// add new campground

module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}


// show campground
module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author',
        }
    }).populate('author');
    console.log(campground)
    if (!campground) {
        req.flash('error', 'cannot find that campground')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground });

}

// Edit Campground page
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);

    if (!campground) {
        req.flash('error', 'cannot find that campground')
        return res.redirect('/campgrounds')
    }

    res.render('campgrounds/edit', { campground });

}

// edit campground
module.exports.updateCampgrounds = async (req, res) => {
    const { id } = req.params;
    console.log(req.body)
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save()
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
        console.log(campground)
    }
    req.flash('success', 'successfully updated campground')
    res.redirect(`/campgrounds/${campground._id}`)
}

// Delete Campground
module.exports.deleteCampgrounds = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'successfully deleted campground')
    res.redirect('/campgrounds');
}


// req.files.map(f => ({ url: f.path, filename: f.filename }))
// makes a new array containing path and filename


// { $pull: { images: { filename: { $in: req.body.deleteImages } } } }) ....
// we want to pull out of the images array where the filenmae is in the req.body.deleteImages array