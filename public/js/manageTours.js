import axios from 'axios';
import { showAlert } from './alerts';

export const saveTour = async (data, tourId) => {
  try {
    const url = tourId ? `/api/v1/tours/${tourId}` : '/api/v1/tours';
    const method = tourId ? 'PATCH' : 'POST';
    console.log(data);
    const res = await axios({
      method,
      url,
      data,
    });

    if (res.data.status === 'success') {
      showAlert(
        'success',
        `Tour ${tourId ? 'updated' : 'created'} successfully!`,
      );
      window.setTimeout(() => location.reload(), 1500);
    }
  } catch (err) {
    showAlert(
      'error',
      (err.response && err.response.data && err.response.data.message) ||
        'Something went wrong!',
    );
  }
};

export const deleteTourByAdmin = async (tourId) => {
  try {
    const res = await axios({
      method: 'DELETE',
      url: `/api/v1/tours/${tourId}`,
    });

    showAlert('success', 'Tour deleted successfully!');
    window.setTimeout(() => location.reload(), 1500);
  } catch (err) {
    showAlert(
      'error',
      (err.response && err.response.data && err.response.data.message) ||
        'Could not delete tour.',
    );
  }
};
