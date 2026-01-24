import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { WritableDraft } from "immer";
import { RootState } from "@shared/store";

interface AppState {
  hideNavigation: boolean;
}

const initialState: AppState = {
  hideNavigation: true,
};

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setHideNavigation: (
      state: WritableDraft<AppState>,
      action: PayloadAction<boolean>,
    ) => {
      state.hideNavigation = action.payload;
      updateAppLocalStorage("hideNavigation", action.payload);
    },
    checkLSAppSettings: (state: WritableDraft<AppState>) => {
      const ls = localStorage.getItem("appSettings");
      if (ls) {
        const settings = JSON.parse(ls);
        if (settings) {
          state.hideNavigation = settings.hideNavigation;
        }
      }
    },
  },
});

export const { setHideNavigation, checkLSAppSettings } = appSlice.actions;

export default appSlice.reducer;

export const SelectHideNavigation = (state: RootState) =>
  state.app.hideNavigation;

const updateAppLocalStorage = (key: string, value: boolean) => {
  const ls = localStorage.getItem("appSettings");
  const settings = ls ? JSON.parse(ls) : {};
  settings[key] = value;
  localStorage.setItem("appSettings", JSON.stringify(settings));
};
