import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';


const API_URL = 'http://89.39.121.224/';

export const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth?.accessToken;
    const lang = state.auth?.lang;

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    if (lang) {
      headers.set('Accept-Language', lang);
    }

    return headers;
  },
});





