const express = require('express');
const viewController = require('./../controllers/viewController');
const bookingController = require('./../controllers/bookingController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.get('/', authController.isLoggedIn, viewController.getOverview);
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);
router.get('/login', authController.isLoggedIn, viewController.getLoginForm);
router.get('/signUp', authController.isLoggedIn, viewController.getSignUpForm);

router.use(authController.protect);
router.get('/me', viewController.getAccount);
router.get('/my-tours', viewController.getMyTours);
router.post('/submit-user-data', viewController.updateUserData);
router.get('/my-reviews', viewController.getMyReviews);
router.get(
  '/manage-tours',
  authController.restrictTo('admin', 'lead-guide'),
  viewController.getManageTours,
);

router.get(
  '/manage-users',
  authController.restrictTo('admin'),
  viewController.getManageUsers,
);
router.get(
  '/manage-reviews',
  authController.restrictTo('admin'),
  viewController.getManageReviews,
);
router.get(
  '/manage-bookings',
  authController.restrictTo('admin'),
  viewController.getManageBookings,
);

module.exports = router;
