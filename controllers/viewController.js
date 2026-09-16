const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Review = require('../models/reviewModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find({ secretTour: false });
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }
  let hasBooked = false;
  if (res.locals.user) {
    const bookings = await Booking.find({
      user: res.locals.user.id,
      tour: tour.id,
    });
    if (bookings.length > 0) hasBooked = true;
  }
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
    hasBooked,
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Login',
  });
};

exports.getSignUpForm = (req, res) => {
  res.status(200).render('signup', {
    title: 'Sign Up',
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser,
  });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  // 2) Find tours with the returned IDs
  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
    bookedTours: true,
  });
});

exports.getMyReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find({ user: req.user.id }).populate({
    path: 'tour',
    select: 'name imageCover slug',
  });

  res.status(200).render('myReviews', {
    title: 'My Reviews',
    reviews,
  });
});

exports.getManageTours = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  const users = await User.find({ role: { $in: ['guide', 'lead-guide'] } });
  res.status(200).render('manageTours', {
    title: 'Manage Tours',
    tours,
    users,
  });
});

const APIFeatures = require('../utils/apiFeatures');

exports.getManageUsers = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(User.find(), req.query)
    .filter()
    .sort('name')
    .limitFields()
    .paginate();

  const users = await features.query;

  res.status(200).render('manageUsers', {
    title: 'Manage Users',
    users,
  });
});

exports.getManageReviews = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Review.find(), req.query)
    .filter()
    .sort('-createdAt')
    .paginate();

  const reviews = await features.query;

  res.status(200).render('manageReviews', {
    title: 'Manage Reviews',
    reviews,
  });
});

exports.getManageBookings = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Booking.find(), req.query)
    .filter()
    .sort('-createdAt')
    .paginate();

  const bookings = await features.query;

  res.status(200).render('manageBookings', {
    title: 'Manage Bookings',
    bookings,
  });
});
