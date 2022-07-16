// MONGOOSE SCHEMAS 

// The database schema is one that contains list of attributes and instructions
//  to tell the database engine how data is organised whereas Data model is a 
//  collection of conceptional tools for describing data,
//  data-relationship and consistency constraints.



const { string } = require('joi');
const mongoose = require('mongoose');
const { campgroundSchema } = require('../schemas');
const review = require('./review');
const Schema = mongoose.Schema;

// the new operator is used when calling a constructor (Schema)
// this tells javascript to create a new instance of Schema called CampgroundSchema
// (OOP)

// Reviews - is an array of object id's on each campground
//  using the reviews mongoose.model(review.js) 



// https://res.cloudinary.com/ddb09rtfy/image/upload/w_150v1644623210/yelpcamp/vwxgxlzyoy46motramhh.jpg
// above is the url for an image with the size w_150 to resize this image
// to make all images resize automatically we created a image schema below
// replace /upload(default) to /upload/w_200




// https://res.cloudinary.com/douqbebwk/image/upload/w_300/v1600113904/YelpCamp/gxgle1ovzd2f3dgcpass.png

const ImageSchema = new Schema({
    url: String,
    filename: String
});


// https://mongoosejs.com/docs/tutorials/virtuals.html for more on virtuals
// virtuals do not get stored on mongodb

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true } }

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    // properties: {
    //     popUpMarkup: '<h3>'
    // }
}, opts);


CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
        <p>${this.description.substring(0, 30)}...</p>`
});


CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);