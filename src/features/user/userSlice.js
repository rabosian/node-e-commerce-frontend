import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { showToastMessage } from "../common/uiSlice";
import api from "../../utils/api";
import { initialCart } from "../cart/cartSlice";

export const loginWithEmail = createAsyncThunk(
  "user/loginWithEmail",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post("/users/login", { email, password });
      if (response.status === 200) {
        // dispatch(
        //   showToastMessage({ message: "Login success!", status: "success" })
        // );
        sessionStorage.setItem("token", response.data.accessToken) 
        localStorage.setItem("refreshToken", response.data.refreshToken)
        return response.data;
      }
    } catch (err) {
      // dispatch(showToastMessage({ message: "Login failed. Please try again", status: "error" }))
      return rejectWithValue(err.error);
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  "user/loginWithGoogle",
  async (token, { rejectWithValue }) => {}
);

export const logout = () => (dispatch) => {};

export const registerUser = createAsyncThunk(
  "user/registerUser", // action name
  async (
    { email, name, password, navigate },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await api.post("/users/signup", {
        email,
        name,
        password,
      });
      if (response.status === 201) {
        dispatch(
          showToastMessage({ message: "Signup success!", status: "success" })
        );
        navigate("/login");
        return response.data.data;
      }
    } catch (err) {
      console.error(err);
      dispatch(
        showToastMessage({
          message: "Signup failed. Please try again",
          status: "error",
        })
      );

      return rejectWithValue(err.error);
    }
  }
);

export const loginWithToken = createAsyncThunk(
  "user/loginWithToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/users/auth")
      if (response.status === 200) {
        return response.data
      }
    } catch (err) {
      return rejectWithValue(err.error)
    }

  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    loading: false,
    loginError: null,
    registrationError: null,
    success: false,
  },
  reducers: {
    // sync
    clearErrors: (state) => {
      state.loginError = null;
      state.registrationError = null;
    },
  },
  extraReducers: (builder) => {
    // async
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.registrationError = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.registrationError = action.payload;
      })
      .addCase(loginWithEmail.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginWithEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.loginError = null;
        state.user = action.payload.user
      })
      .addCase(loginWithEmail.rejected, (state, action) => {
        state.loading = false;
        state.loginError = action.payload;
      })
      .addCase(loginWithToken.fulfilled, (state, action) => {
        state.user = action.payload.user
      })
  },
});
export const { clearErrors } = userSlice.actions;
export default userSlice.reducer;
