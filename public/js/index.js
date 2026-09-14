import '@babel/polyfill';
import { login, logout, signUp } from './login';
import { displayMap } from './mapbox';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import { createReview, updateReview, deleteReview } from './review';
import { saveTour, deleteTour } from './manageTours';

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
const tourModal = document.getElementById('tour-modal');
const modalTitle = document.getElementById('modal-title');
const tourForm = document.getElementById('form-tour');
const openModalBtn = document.getElementById('btn-open-create-modal');
const closeModalBtn = document.getElementById('btn-close-modal');
const tableBody = document.getElementById('tours-table-body');
const locationsContainer = document.getElementById('locations-container');
const addLocationBtn = document.getElementById('btn-add-location');
const locationTemplate = document.getElementById('location-template');

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

const closeTourModal = () => tourModal.classList.add('hidden');
if (tourModal) {
  tourModal.addEventListener('click', (e) => {
    if (e.target === tourModal) closeTourModal();
  });
}

if (openModalBtn) {
  openModalBtn.addEventListener('click', () => {
    tourForm.reset();
    document.getElementById('tour-id').value = '';
    if (locationsContainer) locationsContainer.innerHTML = '';
    document
      .querySelectorAll('.guide-checkbox')
      .forEach((cb) => (cb.checked = false));

    modalTitle.textContent = 'Create New Tour';
    tourModal.classList.remove('hidden');
  });
}

if (closeModalBtn) closeModalBtn.addEventListener('click', closeTourModal);

if (tourForm) {
  tourForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const tourId = document.getElementById('tour-id').value;
    const form = new FormData();

    form.append('name', document.getElementById('name').value);
    form.append('price', document.getElementById('price').value);
    form.append('maxGroupSize', document.getElementById('maxGroupSize').value);
    form.append('difficulty', document.getElementById('difficulty').value);
    form.append('duration', document.getElementById('duration').value);
    form.append('summary', document.getElementById('summary').value);
    form.append('description', document.getElementById('description').value);
    form.append('secretTour', document.getElementById('secretTour').checked);

    const coverInput = document.getElementById('imageCover');
    if (coverInput && coverInput.files[0]) {
      form.append('imageCover', coverInput.files[0]);
    }
    const imagesInput = document.getElementById('images');
    if (imagesInput && imagesInput.files.length > 0) {
      Array.from(imagesInput.files).forEach((file) => {
        form.append('images', file);
      });
    }
    const datesValue = document.getElementById('startDates').value;
    if (datesValue) {
      const datesArray = datesValue.split(',').map((date) => date.trim());
      form.append('startDates', JSON.stringify(datesArray));
    }
    const lng = parseFloat(document.getElementById('startLng').value);
    const lat = parseFloat(document.getElementById('startLat').value);
    const address = document.getElementById('startAddress').value;
    const description = document.getElementById('startDescription').value;

    if (!isNaN(lng) && !isNaN(lat)) {
      const startLocation = {
        type: 'Point',
        coordinates: [lng, lat],
        address,
        description,
      };
      form.append('startLocation', JSON.stringify(startLocation));
    }

    const checkedBoxes = document.querySelectorAll('.guide-checkbox:checked');
    const selectedGuides = Array.from(checkedBoxes).map((cb) => cb.value);

    if (selectedGuides.length > 0) {
      form.append('guides', JSON.stringify(selectedGuides));
    }

    const locationCards = document.querySelectorAll('.location-card');
    const locationsArray = [];

    locationCards.forEach((card) => {
      const day = parseInt(card.querySelector('.location-day').value, 10);
      const description = card.querySelector('.location-desc').value;
      const address = card.querySelector('.location-address').value;
      const coordsRaw = card.querySelector('.location-coords').value;

      if (coordsRaw && !isNaN(day)) {
        const coords = coordsRaw.split(',').map((c) => parseFloat(c.trim()));
        if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
          locationsArray.push({
            type: 'Point',
            coordinates: coords, // [lng, lat]
            address,
            description,
            day,
          });
        }
      }
    });

    if (locationsArray.length > 0) {
      form.append('locations', JSON.stringify(locationsArray));
    }
    saveTour(form, tourId);
  });
}

if (tableBody) {
  tableBody.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.btn-action--edit');
    const deleteBtn = e.target.closest('.btn-action--delete');

    if (editBtn) {
      const tour = JSON.parse(editBtn.dataset.tour);
      document.getElementById('tour-id').value = tour._id || tour.id;
      document.getElementById('name').value = tour.name;
      document.getElementById('price').value = tour.price;
      document.getElementById('maxGroupSize').value = tour.maxGroupSize;
      document.getElementById('difficulty').value = tour.difficulty;
      document.getElementById('duration').value = tour.duration || 1;
      document.getElementById('summary').value = tour.summary;
      document.getElementById('description').value = tour.description || '';
      document.getElementById('secretTour').checked = tour.secretTour || false;

      if (tour.startDates && Array.isArray(tour.startDates)) {
        document.getElementById('startDates').value = tour.startDates
          .map((d) => new Date(d).toISOString().split('T')[0])
          .join(', ');
      } else {
        document.getElementById('startDates').value = '';
      }

      if (tour.startLocation && tour.startLocation.coordinates) {
        document.getElementById('startLng').value =
          tour.startLocation.coordinates[0] || '';
        document.getElementById('startLat').value =
          tour.startLocation.coordinates[1] || '';
        document.getElementById('startAddress').value =
          tour.startLocation.address || '';
        document.getElementById('startDescription').value =
          tour.startLocation.description || '';
      }

      document
        .querySelectorAll('.guide-checkbox')
        .forEach((cb) => (cb.checked = false));

      if (tour.guides && Array.isArray(tour.guides)) {
        tour.guides.forEach((guide) => {
          const guideId =
            typeof guide === 'object' ? guide._id || guide.id : guide;
          const checkbox = document.getElementById(`guide-${guideId}`);
          if (checkbox) checkbox.checked = true;
        });
      }

      if (locationsContainer) locationsContainer.innerHTML = '';
      if (tour.locations && Array.isArray(tour.locations)) {
        tour.locations.forEach((loc) => createLocationCard(loc));
      }

      modalTitle.textContent = 'Edit Tour';
      tourModal.classList.remove('hidden');
    }

    if (deleteBtn) {
      const tourId = deleteBtn.dataset.id;
      if (confirm('Are you sure you want to delete this tour?')) {
        deleteTour(tourId);
      }
    }
  });
}

const createLocationCard = (location = {}) => {
  if (!locationTemplate || !locationsContainer) return;

  const clone = locationTemplate.content.cloneNode(true);
  const card = clone.querySelector('.location-card');

  if (location.day) card.querySelector('.location-day').value = location.day;
  if (location.description)
    card.querySelector('.location-desc').value = location.description;
  if (location.address)
    card.querySelector('.location-address').value = location.address;
  if (location.coordinates && Array.isArray(location.coordinates)) {
    card.querySelector('.location-coords').value =
      `${location.coordinates[0]}, ${location.coordinates[1]}`;
  }

  card.querySelector('.btn-remove-location').addEventListener('click', () => {
    card.remove();
  });

  locationsContainer.appendChild(card);
};

if (addLocationBtn) {
  addLocationBtn.addEventListener('click', () => createLocationCard());
}
