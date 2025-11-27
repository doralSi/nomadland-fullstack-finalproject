import axiosInstance from './axiosInstance';

/**
 * Google Login API
 * Send Google credential to backend for verification
 */
export async function googleLogin(credential) {
  const response = await axiosInstance.post('/auth/google', { credential });
  return response.data;
}

export default {
  googleLogin
};
