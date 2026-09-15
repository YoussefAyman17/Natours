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

// ########### manage users #####################

import { saveUser, toggleUserStatusByAdmin } from './manageUsers';
const userModal = document.getElementById('user-modal');
const userModalTitle = document.getElementById('user-modal-title');
const userForm = document.getElementById('form-user');
const openUserModalBtn = document.getElementById('btn-open-user-modal');
const closeUserModalBtn = document.getElementById('btn-close-user-modal');
const usersTableBody = document.getElementById('users-table-body');

const closeUserModal = () => userModal && userModal.classList.add('hidden');

if (openUserModalBtn) {
  openUserModalBtn.addEventListener('click', () => {
    userForm.reset();
    document.getElementById('user-id').value = '';
    document.getElementById('user-photo-preview').src =
      '/img/users/default.jpg';
    document.getElementById('form-password').style.display = '';
    document.getElementById('form-password-confirm').style.display = '';
    userModalTitle.textContent = 'Add New User';
    userModal.classList.remove('hidden');
  });
}

if (closeUserModalBtn)
  closeUserModalBtn.addEventListener('click', closeUserModal);

if (userModal) {
  userModal.addEventListener('click', (e) => {
    if (e.target === userModal) closeUserModal();
  });
}

// Table Event Delegation (Edit / Delete)
if (usersTableBody) {
  usersTableBody.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.btn-action--edit');
    const toggleBtn = e.target.closest('.btn-toggle-status');

    if (editBtn) {
      const user = JSON.parse(editBtn.dataset.user);
      document.getElementById('user-id').value = user._id || user.id;
      document.getElementById('user-name').value = user.name;
      document.getElementById('user-email').value = user.email;
      document.getElementById('user-role').value = user.role;
      document.getElementById('form-password').style.display = 'none';
      document.getElementById('form-password-confirm').style.display = 'none';
      document.getElementById('user-photo-preview').src =
        `${user.photo.startsWith('http') ? user.photo : '/img/users/' + user.photo}`;

      userModalTitle.textContent = 'Edit User';
      userModal.classList.remove('hidden');
    }

    if (toggleBtn) {
      const userId = toggleBtn.dataset.id;
      const currentActiveState = toggleBtn.dataset.active === 'true';
      const newActiveState = !currentActiveState;
      toggleUserStatusByAdmin(userId, { active: newActiveState });
    }
  });
}

// User Form Submission
if (userForm) {
  userForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const userId = document.getElementById('user-id').value;
    const form = new FormData();

    form.append('name', document.getElementById('user-name').value);
    form.append('email', document.getElementById('user-email').value);
    form.append('role', document.getElementById('user-role').value);
    if (document.getElementById('create-password').value) {
      form.append('password', document.getElementById('create-password').value);
      form.append(
        'passwordConfirm',
        document.getElementById('create-password-confirm').value,
      );
    }

    const photoInput = document.getElementById('user-photo');
    // console.log('Selected file:', photoInput.files[0]);
    if (photoInput && photoInput.files[0]) {
      form.append('photo', photoInput.files[0]);
    }
    // console.log(document.getElementById('user-name').value);
    saveUser(form, userId);
  });
}

import { fetchFilteredUsers } from './manageUsers';

const searchUsersInput = document.getElementById('search-users');
const filterRoleSelect = document.getElementById('filter-role');
const filterStatusSelect = document.getElementById('filter-status');
// const usersTableBody = document.getElementById('users-table-body');

const renderUsersTable = (users) => {
  if (!usersTableBody) return;

  usersTableBody.innerHTML = users
    .map(
      (user) => `
    <tr>
      <td>
        <img class="user-avatar" src=${user.photo.startsWith('http') ? user.photo : 'img/users/' + user.photo} alt="${user.name}">
      </td>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td><span class="badge badge--${user.role}">${user.role}</span></td>
      <td>
        <span class="badge ${user.active !== false ? 'badge--active' : 'badge--inactive'}">
          ${user.active !== false ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td>
        <div class="table-actions">
          <button class="btn-action btn-action--edit" data-user='${JSON.stringify(user)}'>Edit</button>
          <button class="btn-action btn-toggle-status ${user.active ? 'btn-action--deactivate' : 'btn-action--activate'}" data-id="${user._id || user.id}" ata-active='${user.active}'>${user.active ? 'Deactivate' : 'Activate'}</button>
        </div>
      </td>
    </tr>
  `,
    )
    .join('');
};

let debounceTimer;
const handleFilterChange = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    const query = searchUsersInput ? searchUsersInput.value.trim() : '';
    const role = filterRoleSelect ? filterRoleSelect.value : 'all';
    const status = filterStatusSelect ? filterStatusSelect.value : 'all';

    const users = await fetchFilteredUsers(query, role, status);
    if (users) renderUsersTable(users);
  }, 350);
};

if (searchUsersInput)
  searchUsersInput.addEventListener('input', handleFilterChange);
if (filterRoleSelect)
  filterRoleSelect.addEventListener('change', handleFilterChange);
if (filterStatusSelect)
  filterStatusSelect.addEventListener('change', handleFilterChange);
// ----------- manage users -----------------------

// ######### manage reviews ####################
import {
  fetchFilteredReviews,
  // updateReviewByAdmin,
  // deleteReviewByAdmin,
} from './manageReviews';
// const reviewModal = document.getElementById('modal-edit-review');
// const editReviewForm = document.getElementById('form-review');
// const closeReviewModalBtn = document.getElementById('btn-close-review-modal');
// const closeReviewModal = () =>
//   reviewModal && reviewModal.classList.add('hidden');

// if (closeReviewModalBtn)
//   closeReviewModalBtn.addEventListener('click', closeReviewModal);

// if (reviewModal) {
//   reviewModal.addEventListener('click', (e) => {
//     if (e.target === reviewModal) closeReviewModal();
//   });
// }

// if (editReviewForm) {
//   editReviewForm.addEventListener('submit', (e) => {
//     e.preventDefault();

//     const reviewId = document.getElementById('edit-review-id').value;
//     const payload = {
//       rating: Number(document.getElementById('edit-review-rating').value),
//       review: document.getElementById('edit-review-text').value.trim(),
//     };

//     updateReviewByAdmin(reviewId, payload);
//   });
// }

// const searchReviewsInput = document.getElementById('search-reviews');
const filterRatingSelect = document.getElementById('filter-rating');
const reviewsTableBody = document.getElementById('reviews-table-body');

// Dynamic Re-render Table
const renderReviewsTable = (reviews) => {
  if (!reviewsTableBody) return;
  reviewsTableBody.innerHTML = reviews
    .map(
      (rev) => `
    <tr data-id="${rev._id || rev.id}">
      <td>
        <div class="table-user-info">
          <img class="user-avatar" src="${rev.user.photo.startsWith('http') ? rev.user.photo : '/img/users/' + rev.user.photo}" alt="${rev.user ? rev.user.name : 'User'}">
          <span>${rev.user ? rev.user.name : 'Deleted User'}</span>
        </div>
      </td>
      <td>${rev.tour ? rev.tour.name : 'N/A'}</td>
      <td><span class="badge badge--rating">⭐ ${rev.rating}</span></td>
      <td class="cell-review-text">${rev.review}</td>
      <td>${new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
    </tr>
  `,
    )
    .join('');
};

// Event Delegation for Table Buttons
// if (reviewsTableBody) {
//   reviewsTableBody.addEventListener('click', (e) => {
//     if (e.target.classList.contains('btn-delete-review')) {
//       const id = e.target.dataset.id;
//       if (confirm('Are you sure you want to delete this review?')) {
//         deleteReviewByAdmin(id);
//       }
//     }

//     if (e.target.classList.contains('btn-edit-review')) {
//       const review = JSON.parse(e.target.dataset.review);
//       document.getElementById('edit-review-id').value = review._id || review.id;
//       document.getElementById('edit-review-rating').value = review.rating;
//       document.getElementById('edit-review-text').value = review.review;
//       document.getElementById('modal-edit-review').classList.remove('hidden');
//     }
//   });
// }

// Search / Rating Filter Debounce
let reviewDebounce;
const handleReviewFilterChange = () => {
  clearTimeout(reviewDebounce);
  reviewDebounce = setTimeout(async () => {
    const rating = filterRatingSelect ? filterRatingSelect.value : 'all';
    const reviews = await fetchFilteredReviews(rating);
    if (reviews) renderReviewsTable(reviews);
  }, 350);
};

if (filterRatingSelect)
  filterRatingSelect.addEventListener('change', handleReviewFilterChange);

// ------------------- manage reviews ------------------------

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
