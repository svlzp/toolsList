import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { toolsApi } from './api/toolsApi';
import { authApi } from './api/authApi';
import { learningApi } from './api/learningApi';
import { machineCncApi } from './api/machineCncApi';
import { workOvernightApi } from './api/workOvernightApi';
import authSlice from './auth.slice';

export const store = configureStore({
  reducer: {
    [toolsApi.reducerPath]: toolsApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [learningApi.reducerPath]: learningApi.reducer,
    [machineCncApi.reducerPath]: machineCncApi.reducer,
    [workOvernightApi.reducerPath]: workOvernightApi.reducer,
    auth: authSlice,
    
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(toolsApi.middleware)
      .concat(authApi.middleware)
      .concat(learningApi.middleware)
      .concat(machineCncApi.middleware)
      .concat(workOvernightApi.middleware),
});
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

