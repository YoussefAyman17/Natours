import '@babel/polyfill';
import { login, logout, signUp } from './login';
import { displayMap } from './mapbox';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import { createReview, updateReview, deleteReview } from './review';

const loginForm = document.querySelector('.form--login');
const signUpForm = document.querySelector('.form--signUp');
const reviewForm = document.querySelector('.form--review');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-settings');
const mapBox = document.getElementById('map');
const bookBtn = document.getElementById('book-tour');
const editButtons = document.querySelectorAll('.btn-edit-review');
const cancelButtons = document.querySelectorAll('.btn-cancel-edit');
const editForms = document.querySelectorAll('.form--edit-review');
const modal = document.getElementById('delete-modal');
const btnCancelDelete = document.getElementById('btn-cancel-delete');
const btnConfirmDelete = document.getElementById('btn-confirm-delete');
let reviewIdToDelete = null;
const deleteReviewBtns = document.querySelectorAll('.btn-delete-review');

if (mapBox) {
  const locations = JSON.parse(
    document.getElementById('map').dataset.locations,
  );
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (signUpForm) {
  signUpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;

    document.querySelector('.btn-signUp').textContent = 'Creating...';
    signUp(name, email, password, passwordConfirm);
  });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (reviewForm) {
  const stars = document.querySelectorAll(
    '.reviews__rating--interactive .reviews__star',
  );
  let ratingInput = document.getElementById('rating');

  if (stars.length > 0) {
    stars.forEach((star) => {
      star.addEventListener('click', function () {
        const currentRating = this.dataset.rating;

        ratingInput.value = currentRating;

        stars.forEach((s) => {
          if (s.dataset.rating <= currentRating) {
            s.classList.add('reviews__star--active');
            s.classList.remove('reviews__star--inactive');
          } else {
            s.classList.add('reviews__star--inactive');
            s.classList.remove('reviews__star--active');
          }
        });
      });
    });
  }
  reviewForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const tourId = reviewForm.dataset.tourId;
    const rating = ratingInput.value;
    const review = document.getElementById('review').value;

    document.querySelector('.btn--save-review').textContent = 'Submitting...';

    createReview(tourId, rating, review);
  });
}

if (userDataForm) {
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateSettings(form, 'data');
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password',
    );

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
}

if (editButtons.length > 0) {
  editButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.reviews__card');
      card.querySelector('.review-display').style.display = 'none';
      card.querySelector('.review-edit').style.display = 'block';
    });
  });
}

if (cancelButtons.length > 0) {
  cancelButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.reviews__card');
      card.querySelector('.review-display').style.display = 'block';
      card.querySelector('.review-edit').style.display = 'none';
    });
  });
}

if (editForms.length > 0) {
  editForms.forEach((form) => {
    const stars = form.querySelectorAll(
      '.reviews__rating--interactive .reviews__star',
    );
    let ratingInput = form.querySelector('#rating');

    if (stars.length > 0) {
      stars.forEach((star) => {
        star.addEventListener('click', function () {
          const currentRating = this.dataset.rating;

          ratingInput.value = currentRating;

          stars.forEach((s) => {
            if (s.dataset.rating <= currentRating) {
              s.classList.add('reviews__star--active');
              s.classList.remove('reviews__star--inactive');
            } else {
              s.classList.add('reviews__star--inactive');
              s.classList.remove('reviews__star--active');
            }
          });
        });
      });
    }
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const reviewId = form.dataset.reviewId;
      const rating = ratingInput.value;
      const review = form.querySelector('.edit-text').value;

      form.querySelector('.btn--save-edit').textContent = 'Saving...';

      updateReview(reviewId, rating, review);
    });
  });
}

if (deleteReviewBtns.length > 0) {
  deleteReviewBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      reviewIdToDelete = e.target.dataset.reviewId;
      modal.classList.add('active');
      modal.classList.remove('hidden');
    });
  });
}

const closeModal = () => {
  modal.classList.remove('active');
  modal.classList.add('hidden');
  reviewIdToDelete = null;
};

if (btnCancelDelete) {
  btnCancelDelete.addEventListener('click', closeModal);
}

if (modal) {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

if (btnConfirmDelete) {
  btnConfirmDelete.addEventListener('click', (e) => {
    e.target.textContent = 'Deleting...';
    deleteReview(reviewIdToDelete);
  });
}
