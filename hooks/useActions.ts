import { bindActionCreators } from "@reduxjs/toolkit";
import { useAppDispatch } from "./reduxHooks";
import { setTokens, setRefreshToken, logout, setLang, checkAuth } from "../store/auth.slice";



const allActions = {
    setTokens,
    setRefreshToken,
    logout,
    setLang,
    checkAuth,
};

export const useActions = () => {
    const dispatch = useAppDispatch();
    return bindActionCreators(allActions, dispatch);
};
