import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";


interface JwtPayload {
  sub: string;        
  email: string;
  role: string;       
  exp: number;        
  iat: number;        
}

interface User {
  id: string | number;
  email: string;
  name?: string;
  role: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  lang: string | null;
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  lang: 'ru',
};


const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};


const getUserFromToken = (token: string): User | null => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };
  } catch {
    return null;
  }
};

const AuthSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTokens(state, action: PayloadAction<{ accessToken: string; refreshToken?: string; user?: User }>) {
      const { accessToken, refreshToken, user } = action.payload;
      state.accessToken = accessToken;
      if (refreshToken) {
        state.refreshToken = refreshToken;
      }
   
      state.user = user || getUserFromToken(accessToken);
      state.isAuthenticated = !isTokenExpired(accessToken);
    },
    setRefreshToken(state, action: PayloadAction<string>) {
      state.refreshToken = action.payload;
    },
    logout(state) {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      state.isAuthenticated = false;
    },
    setLang(state, action: PayloadAction<string>) {
      state.lang = action.payload;
    },
  
    checkAuth(state) {
      if (state.accessToken && !isTokenExpired(state.accessToken)) {
        state.isAuthenticated = true;
        state.user = getUserFromToken(state.accessToken);
      } else {
        state.isAuthenticated = false;
        state.user = null;
      }
    },
  },
});

export const { setTokens, setRefreshToken, logout, setLang, checkAuth } = AuthSlice.actions;
export const authAction = AuthSlice.actions;

export default AuthSlice.reducer; 