import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// Retrieve initial user from localStorage if present
const storedUser = localStorage.getItem('minibank_user') 
  ? JSON.parse(localStorage.getItem('minibank_user')) 
  : null;
const storedToken = localStorage.getItem('minibank_token') || null;

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('minibank_token', res.data.token);
      localStorage.setItem('minibank_user', JSON.stringify(res.data.user));
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      return rejectWithValue(msg);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('minibank_token', res.data.token);
      localStorage.setItem('minibank_user', JSON.stringify(res.data.user));
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      return rejectWithValue(msg);
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/auth/me');
      localStorage.setItem('minibank_user', JSON.stringify(res.data.user));
      return res.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch user');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedUser,
    token: storedToken,
    isAuthenticated: !!storedToken,
    loading: false,
    error: null,
    successMessage: null
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('minibank_token');
      localStorage.removeItem('minibank_user');
    },
    clearAuthError(state) {
      state.error = null;
      state.successMessage = null;
    },
    updateLocalBalance(state, action) {
      if (state.user) {
        state.user.balance = action.payload;
        localStorage.setItem('minibank_user', JSON.stringify(state.user));
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch me
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  }
});

export const { logout, clearAuthError, updateLocalBalance } = authSlice.actions;
export default authSlice.reducer