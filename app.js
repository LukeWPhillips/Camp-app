// ** some stuff moved to Routes 
// old layout in app js file seperate 
// YelpCamp (app.js b4 organising with routes.js)**




// dotenv is an npm secret file for storing credentials; keys for cloudinary etc
// IF NOT IN PRODUCTION MODE RQUIRE THE DOTENV PACKAGE
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}





const express = require('express');

// to use flash and authentication
const session = require('express-session')
const flash = require('connect-flash')

// https://www.npmjs.com/package/method-override 
const methodOverride = require('method-override');

// https://www.npmjs.com/package/ejs-mate 
const ejsMate = require('ejs-mate')

// To import (link) catchAsync and express error function file ;
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError')


const { campgroundSchema, reviewSchema } = require('./schemas.js')



const axios = require('axios')

// For the View engine path variable 
const path = require('path');


const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user')



// SECURITY -mongoose sanitize security removes any keys containing prohibited chracters
// Without this sanitization, malicious users could send an object containing a $ operator, or including a .,
//  which could change the context of a database operation
const mongoSanitize = require('express-mongo-sanitize');

// more security package
const helmet = require('helmet')


// to import/link routes
const userRoutes = require("./routes/users")
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews')

const express_session = require('express-session');
const MongoStore = require('connect-mongo');


// to link mongoose model and connect to mongo Database
const mongoose = require('mongoose');


// Mongo Atlas Db - cloud database
// const dbUrl = process.env.DB_URL



// mongoose.connect(dbUrl);

// use  Mongo Atlas cloud db or local mongoDB
const dbUrl = "mongodb://localhost:27017/yelp-camp" || process.env.DB_URL
mongoose.connect(dbUrl)




// logic for checking errors 
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});



const app = express();





// View engines are useful for rendering web pages. There are many view engines 
// available in the market like Mustache, Handlebars, EJS, etc but the most popular
//  among them is EJS which simply stands for Embedded JavaScript. It is a simple 
//  templating language/engine 
// that lets its user generate HTML with plain javascript.

// To setup view engine, you need the write this middleware in your 
// index.js as follow:


app.engine('ejs', ejsMate)

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

// ejs template engine (npm install for templates)











//APP.USE IS MIDDLEWARE


// parsing the body
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))

// Lets you use HTTP verbs such as 
// PUT or DELETE in places where the client doesn't support it.
app.use(methodOverride('_method'));

app.use(mongoSanitize())

// SESSION/COOKIES

const secret = process.env.SECRET || 'thisisasecret';

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret,
    }
})

store.on('error', function (e) {
    console.log('session store error', e)
})

// cookies only accessible over http not through js (session id)
const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}


// Flash middleware (shows a message onlyonce)
app.use(session(sessionConfig))
app.use(flash())


// activate helmet middleware 
// helmet securiyt allows urls below 
// if adding new fonts etc from new url add below!

const scriptSrcUrls = [
    'https://icons8.com',
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/0e361674bc.js",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/ddb09rtfy/"
];
const styleSrcUrls = [

    'https://icons8.com',
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://kit.fontawesome.com/0e361674bc.js",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/ddb09rtfy/"
];
const connectSrcUrls = [
    'https://icons8.com',
    "https://*.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://events.mapbox.com",
    "https://res.cloudinary.com/ddb09rtfy/",
    "https://kit.fontawesome.com/0e361674bc.js",

];
const fontSrcUrls = [
    "https://res.cloudinary.com/ddb09rtfy/",
    'https://icons8.com',
    "https://kit.fontawesome.com/0e361674bc.js",

];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/ddb09rtfy/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                "https://images.unsplash.com/",
                "https://kit.fontawesome.com/0e361674bc.js",
                'https://icons8.com',

            ],
            fontSrc: ["'self'", ...fontSrcUrls],
            mediaSrc: ["https://res.cloudinary.com/ddb09rtfy/"],
            childSrc: ["blob:"]
        }
    })
);







// passport middleware (make sure after session middleware(above))
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))

// telling passport how to serialize a user (how to store a user in a session
// and how to get the user out of the session)(store and unstore)
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// Flash
app.use((req, res, next) => {
    console.log(req.query)
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})


// Router 
// path we want to use and the router
app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)
app.use(express.static('public'))



















// calling the cathAsync function (error function) to wrap around the async function
// so the catchAsync (file) will catch any errors if any and pass it to next
// next being the app.use error handler at bottom of page
// saves writing a try and catch for every callback function

// calling the validateCampground middleware to run first and validate


app.get('/', (req, res) => {
    res.render('Home')

})








// app.all() attaches to the application's router, so it's used whenever the
//   middleware is 
// reached (which handles all the method routes... GET, POST, etc).

// app.use() attaches to the application's main middleware stack, so it's used 
// in the order specified by middleware, e.g., if you put it first, 
// it will be the first thing to run. 
// If you put it last, (after the router), it usually won't be run at all.





app.all('*', (req, res, next) => {
    next(new ExpressError('Page not Found', 404))
})


// error handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "oh no, something went wrong!"
    res.status(statusCode).render('error', { err })

})

app.listen(3000, () => {
    console.log('Serving on port 3000!')
})








// The res. render() function is used to render a view and sends the rendered HTML string to the client.

// res.send     Sends the HTTP response.
// The body parameter can be a Buffer object, a String, an object, Boolean, or an Array. For example:

// res.redirect Redirects to the URL derived from the specified path, with specified status, a positive integer that corresponds to an HTTP status code . If not specified, status defaults to “302 “Found”.
// redirects can be a fully-qualified URL for redirecting to a different site:

// res.redirect('http://google.com')