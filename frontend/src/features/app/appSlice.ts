import { createSlice } from "@reduxjs/toolkit";

type AppState = {
  sidebarOpen: boolean;
  globalLoading: boolean;
};

const initialState: AppState = {
  sidebarOpen: true,
  globalLoading: false,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setGlobalLoading: (state, action) => {
      state.globalLoading = action.payload;
    },
  },
});

export const { toggleSidebar, setGlobalLoading } = appSlice.actions;
export default appSlice.reducer;