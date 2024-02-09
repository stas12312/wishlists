// Pages
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Profile from "./pages/Profile";
import Navigation from "./components/Navigation";

import * as React from 'react';
import {Route, Routes} from "react-router-dom";
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

    useEffect(() => {
        if (localStorage.getItem('access_token') !== null) {
            store.checkAuth();
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
