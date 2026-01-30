
import { fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import { setTokens, logout } from '../auth.slice';
import { jwtDecode } from 'jwt-decode';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://89.39.121.224/';


interface JwtPayload {
  sub: string;        
  email: string;
  role: string;       
  exp: number;        
  iat: number;        
}

const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth?.accessToken;
    const lang = state.auth?.lang || 'ru';

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    headers.set('Accept-Language', lang);

    return headers;
  },
});

export const baseQuery = async (args: any, api: any, extraOptions: any): Promise<any> => {

  const state = api.getState() as RootState;
  const token = state.auth?.accessToken;
  
  let result = await baseQueryWithAuth(args, api, extraOptions);


  const retryAttempted = extraOptions?.retryAttempted;


  if (result.error?.status === 401 && !retryAttempted) {
  
    const state = api.getState() as RootState;
    const refreshToken = state.auth?.refreshToken;


    if (refreshToken && !isTokenExpired(refreshToken)) {
      try {
      
        const refreshQuery = fetchBaseQuery({
          baseUrl: API_URL,
          prepareHeaders: (headers) => {
            headers.set('Authorization', `Bearer ${refreshToken}`);
            return headers;
          },
        });

        const refreshResult = await refreshQuery(
          {
            url: 'auth/refresh',
            method: 'POST',
            body: { refreshToken },
          },
          api,
          extraOptions
        );

       

        if (refreshResult.data) {
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResult.data as any;
                
        
          api.dispatch(setTokens({ 
            accessToken: newAccessToken, 
            refreshToken: newRefreshToken || refreshToken 
          }));

      
          await new Promise(resolve => setTimeout(resolve, 100));

       
          const updatedState = api.getState() as RootState;
         
          
          result = await baseQueryWithAuth(args, api, { ...extraOptions, retryAttempted: true });
       
        } else {
          console.log('❌ Refresh не вернул данные:', refreshResult.error);
          api.dispatch(logout());
        }
      } catch (error) {
        console.error('❌ Ошибка при обновлении токена:', error);
        api.dispatch(logout());
      }
    } else {
      console.log('❌ Refresh токен истёк или отсутствует');
      api.dispatch(logout());
    }
  }

  return result;
};