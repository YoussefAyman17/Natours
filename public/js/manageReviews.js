import axios from 'axios';
import { showAlert } from './alerts';

// 1. Fetch filtered reviews from API
export const fetchFilteredReviews = async (rating) => {
  try {
    const params = new URLSearchParams();
    if (rating && rating !== 'all') params.append('rating', rating);

    const res = await axios({
      method: 'GET',
      url: `/api/v1/reviews?${params.toString()}`,
    });

    if (res.data.status === 'success') {
      return res.data.data.data;
    }
  } catch (err) {
    showAlert('error', 'Failed to fetch reviews');
  }
};

// // 2. Update existing review
// export const updateReviewByAdmin = async (reviewId, data) => {
//   try {
//     const res = await axios({
//       method: 'PATCH',
//       url: `/api/v1/reviews/${reviewId}`,
//       data,
//     });

//     if (res.data.status === 'success') {
//       showAlert('success', 'Review updated successfully');
//       window.setTimeout(() => {
//         location.reload(true);
//       }, 1500);
//     }
//   } catch (err) {
//     showAlert('error', err.response.data.message || 'Error updating review');
//   }
// };

// // 3. Delete review
// export const deleteReviewByAdmin = async (reviewId) => {
//   try {
//     const res = await axios({
//       method: 'DELETE',
//       url: `/api/v1/reviews/${reviewId}`,
//     });

//     if (res.status === 204) {
//       showAlert('success', 'Review deleted successfully');
//       window.setTimeout(() => {
//         location.reload(true);
//       }, 1500);
//     }
//   } catch (err) {
//     showAlert('error', 'Error deleting review');
//   }
// };
