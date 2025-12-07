import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { toolsApi } from './api/toolsApi';
import { authApi } from './api/authApi';
import { learningApi } from './api/learningApi';
import authSlice from './auth.slice';

export const store = configureStore({
  reducer: {
    [toolsApi.reducerPath]: toolsApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [learningApi.reducerPath]: learningApi.reducer,
    auth: authSlice,
    // добавьте другие редьюсеры здесь
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
  .concat(toolsApi.middleware)      
  .concat(authApi.middleware)
  .concat(learningApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
