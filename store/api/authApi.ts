import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './customBaseQuery';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
}
interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQuery,
  endpoints: (builder) => ({
    mobileLogin: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: 'auth/login/mobile',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<any, RegisterRequest>({
      query: (user) => ({
        url: 'auth/register',
        method: 'POST',
        body: user,
      }),
    }),
    refresh: builder.mutation<LoginResponse, { refreshToken: string }>({
      query: ({ refreshToken }) => ({
        url: 'auth/refresh',
        method: 'POST',
        body: { refreshToken },
      }),
    }),
  }),
});

export const { useMobileLoginMutation, useRegisterMutation, useRefreshMutation } = authApi;





