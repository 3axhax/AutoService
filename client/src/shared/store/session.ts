import { createAction } from "@reduxjs/toolkit";

// Reset this tab without removing the session saved by a different tab.
export const synchronizeSession = createAction("session/synchronize");
