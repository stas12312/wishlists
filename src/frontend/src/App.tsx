// Pages
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Profile from "./pages/Profile";
import Navigation from "./components/Navigation";

import * as React from 'react';
import {Route, Routes, useLocation} from "react-router-dom";
import {useContext, useEffect} from "react";
import {Context} from "./index";
import {observer} from "mobx-react";
import ErrorBoundary from "./components/ErrorBoundary";
import Container from "@mui/material/Container";
import Welcome from "./pages/Welcome";
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";

function App() {

    const {store} = useContext(Context);
    const { search, pathname } = useLocation();

    const parameters = new URLSearchParams(search);

    useEffect(() => {
        if (localStorage.getItem('access_token') !== null) {
            store.checkAuth();
        } else if (pathname === '/auth/confirm' && parameters.size) {
            const uuid: string = parameters && parameters.get('uuid') as string;
            const key: string = parameters.get('key') as string;
            store.confirm(uuid, key, null, true).then((err) => {
                if (err) {
                    alert(err);
                }
            })
        }
    }, [])

    return (
        <Container maxWidth="xl"
                   sx={store.isAuth ? {
                       minWidth: 1760
                   } : {
                       minWidth: 'auto'
                   }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Navigation isAuth={store.isAuth}/>
                <Routes>
                    <Route
                        path="/"
                        element={<Welcome/>}
                        errorElement={<ErrorBoundary/>}
                    />
                    <Route path="/auth/login"
                           element={<SignIn/>}
                           errorElement={<ErrorBoundary/>}/>
                    <Route path="/auth/register"
                           element={<SignUp/>}
                           errorElement={<ErrorBoundary/>}/>
                    <Route path="/wishlists"
                           element={
                               <Profile
                                   name={'name'}
                                   isAuth={store.isAuth}/>}
                           errorElement={<ErrorBoundary/>}/>
                </Routes>
            </LocalizationProvider>
        </Container>
    );
}

export default observer(App);
