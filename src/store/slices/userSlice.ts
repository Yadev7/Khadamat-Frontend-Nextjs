import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// 1. Define the shape of your user profile data
interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  photo?: {
    path: string;
  };
}

// 2. Define the state structure
interface UserState {
  profile: UserProfile | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// 3. Initialize ALL fields defined in UserState to avoid TS errors
const initialState: UserState = {
  profile: null,
  status: 'idle',
  error: null,
};

// 4. Corrected Async thunk
export const fetchUser = createAsyncThunk<
  UserProfile, // Success return type
  void,        // Input argument type (none)
  { rejectValue: string } // Type for rejectWithValue
>('user/fetchUser', async (_, { rejectWithValue }) => {
  try {
    const response = await fetch('/api/v1/auth/me');

    if (!response.ok) {
      const errorData = await response.json();
      return rejectWithValue(errorData.message || 'Session not found or invalid');
    }

    const userData = await response.json();
    return userData.data as UserProfile; // Adjust based on your API nesting (e.g., userData.data)
  } catch (error) {
    // FIX: Avoid 'any'. Check if error is an instance of Error
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('A network error occurred');
  }
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUser: (state) => {
      state.profile = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.status = 'succeeded';
        state.profile = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.status = 'failed';
        state.profile = null;
        // action.payload is now correctly typed as string | undefined
        state.error = action.payload ?? 'An unknown error occurred';
      });
  },
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;

export const selectUserProfile = (state: { user: UserState }) => state.user.profile;
export const selectUserStatus = (state: { user: UserState }) => state.user.status;