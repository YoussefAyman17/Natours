import axios from 'axios';
import { showAlert } from './alerts';

export const fetchFilteredUsers = async (searchQuery, role, status) => {
  try {
    const params = new URLSearchParams();

    // Send role parameter (e.g., ?role=admin)
    if (role && role !== 'all') {
      params.append('role', role);
    }

    if (status && status !== 'all') {
      params.append('active', status === 'active');
    }

    // Send search parameter (e.g., ?search=john)
    if (searchQuery) {
      params.append('search', searchQuery);
    }

    const res = await axios({
      method: 'GET',
      url: `/api/v1/users?${params.toString()}`,
    });

    if (res.data.status === 'success') {
      // Access the array from res.data.data.data
      return res.data.data.data;
    }
  } catch (err) {
    showAlert('error', 'Failed to fetch users');
  }
};

export const saveUser = async (data, id) => {
  try {
    const url = id ? `/api/v1/users/${id}` : '/api/v1/users';
    const method = id ? 'PATCH' : 'POST';

    const res = await axios({
      method,
      url,
      data,
    });

    if (res.data.status === 'success') {
      showAlert('success', `User ${id ? 'updated' : 'created'} successfully!`);
      window.setTimeout(() => {
        location.reload(true);
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const toggleUserStatusByAdmin = async (id, data) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/users/${id}`,
      data,
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Account Stautus Updated successfully!');
      window.setTimeout(() => {
        location.reload(true);
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
