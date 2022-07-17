const express = require('express');
const mongoose = require('mongoose');
const app = express();
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const Review = require('./models/review')
const morgan = require('morgan');
const ejsMate = require('ejs-mate');
const AppError = require('./utils/AppError');
const catchAsync = require("./utils/catchAsync");
const { campgroundSchema, reviewSchema } = require('./shemas');


mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    
})
    .then(() => {
        console.log("Database Connected ! ");
    })
    .catch((err) => { 
        console.log("Error ! !");
        console.log(err);
    });
    
app.engine('ejs',ejsMate);    
app.set('view engine', 'ejs');
app.set('views', __dirname+"/views");

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(morgan('tiny'));

app.use((req , res , next) => { 
    console.log(req.method , req.path);
    next();
});

// validation middleware
const validateCampground = (req , res , next ) => { 
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message);
        throw new AppError(msg, 400);
    } else { 
        next();
    }
}

const validateReview = (req , res , next ) => { 
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message);
        throw new AppError(msg, 400);
    } else { 
        next();
    }
}

// middlewares 
app.get('/', async (req, res) => {
    res.send('Home');
});

app.route('/campgrounds')
    .get(async (req, res) => {
        const campgrounds = await Campground.find({});
        res.render('campgrounds/index', { campgrounds });
    })
    .post( validateCampground ,catchAsync(async (req, res ,next) => {
       
        
        for (let field in req.body.campground) { 
            
            if (!req.body.campground) throw new AppError('insuficient Data Sent !', 403);
            if (! req.body.campground[field].trim().length) { 
            console.log("Only space error !");
            throw new AppError("fields Can't be a white Space Only !",406);
        }
        }
        
        const newCampground =  new Campground(...req.body.Campground);
        console.log(newCampground);
        await newCampground.save();
        res.redirect(`/campgrounds/${newCampground._id}`);
    }));


app.get('/campgrounds/new', (req, res) => {
    
    res.render('campgrounds/new');
});

app.route('/campgrounds/:id')
    .get( catchAsync(async (req, res ) => {
        const campground = await Campground.findById(req.params.id).populate('reviews', Review);
        console.log(campground);
        res.render('campgrounds/show', { campground });
    }))
    
    .put(catchAsync( async (req, res) => {
        const { id } = req.params;
        console.log(req.body);
        const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
        res.redirect(`/campgrounds/${campground._id}`);
    }))
    .delete(catchAsync(async (req, res) => {
        const { id } = req.params;
        await Campground.findByIdAndDelete(id);
        res.redirect('/campgrounds');
     }));


app.get('/campgrounds/:id/edit',catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', {campground});
}));

app.post('/campgrounds/:id/reviews',validateReview ,async (req , res) => { 
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review)
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect("/campgrounds/show");
});

app.all('*', (req, res, next) => {
    next(new AppError('page Not Found',404));
});
app.use((err, req ,res , next) => { 
    const {status = 500 , message } = err;
    console.log(`This is the status code ! ${status}`, message);
    res.render('error', {err});
});
app.listen(3000, () => { 
    console.log("Listening at port 3000!");
});

