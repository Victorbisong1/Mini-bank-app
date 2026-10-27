import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// Retrieve initial user from localStorage if present and set KYC defaults
const rawUser = localStorage.getItem('minibank_user') 
  ? JSON.parse(localStorage.getItem('minibank_user')) 
  : null;

const storedUser = rawUser ? {
  ...rawUser,
  kycTier: rawUser.kycTier || 1,
  dailyLimit: rawUser.dailyLimit || (rawUser.kycTier === 2 ? 200000 : rawUser.kycTier === 3 ? 5000000 : 50000)
} : null;

const storedToken = localStorage.getItem('minibank_token') || null;

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      
      const userWithKyc = {
        ...res.data.user,
        kycTier: res.data.user.kycTier || 1,
        dailyLimit: res.data.user.dailyLimit || 50000
      };

      localStorage.setItem('minibank_token', res.data.token);
      localStorage.setItem('minibank_user', JSON.stringify(userWithKyc));
      return { ...res.data, user: userWithKyc };
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
      
      const userWithKyc = {
        ...res.data.user,
        kycTier: 1,
        dailyLimit: 50000
      };

      localStorage.setItem('minibank_token', res.data.token);
      localStorage.setItem('minibank_user', JSON.stringify(userWithKyc));
      return { ...res.data, user: userWithKyc };
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
      
      const userWithKyc = {
        ...res.data.user,
        kycTier: res.data.user.kycTier || 1,
        dailyLimit: res.data.user.dailyLimit || (res.data.user.kycTier === 2 ? 200000 : res.data.user.kycTier === 3 ? 5000000 : 50000)
      };

      localStorage.setItem('minibank_user', JSON.stringify(userWithKyc));
      return userWithKyc;
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
    },
    // Action to upgrade KYC Tier (1 -> 2 or 2 -> 3)
    upgradeKycTier(state, action) {
      if (state.user) {
        const nextTier = action.payload; // 2 or 3
        state.user.kycTier = nextTier;
        state.user.dailyLimit = nextTier === 2 ? 200000 : 5000000;
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

export const { logout, clearAuthError, updateLocalBalance, upgradeKycTier } = authSlice.actions;
export default authSlice.reducer;