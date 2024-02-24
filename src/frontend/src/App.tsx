// Pages
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Profile from "./pages/Profile";
import Navigation from "./components/Navigation";

import * as React from 'react';
import {redirect, Route, Routes, useLocation, useNavigate} from "react-router-dom";
import {useContext, useEffect} from "react";
import {Context} from "./index";
import {observer} from "mobx-react";
import ErrorBoundary from "./components/ErrorBoundary";
import Container from "@mui/material/Container";
import Welcome from "./pages/Welcome";
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {response} from "express";
import {Simulate} from "react-dom/test-utils";
import error = Simulate.error;
import Typography from "@mui/material/Typography";
import {Alert} from "@mui/lab";
import {Modal as BaseModal} from "@mui/material";

const errorStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    borderRadius: '16px',
    boxShadow: 24,
    p: 4
};

function App() {

    const {store} = useContext(Context);
    const { search, pathname } = useLocation();
    const navigate = useNavigate();

    const parameters = new URLSearchParams(search);
    const [open, setOpen] = React.useState(false);
    const [error, setError] = React.useState('');

    useEffect(() => {
        if (pathname === '/auth/confirm' && parameters.size) {
            const uuid: string = parameters && parameters.get('uuid') as string;
            const key: string = parameters.get('key') as string;
            store.confirm(uuid, key, null, true).then((response) => {
                if (response.message) {
                    setOpen(true);
                    setError(response.message);
                } else {
                    navigate('/auth/login', { state: { email: response?.email }});
                }
            });
        }

        if (localStorage.getItem('access_token') !== null && pathname !== '/auth/confirm') {
            store.checkAuth();
        }
    }, [])

    const handleClose = () => {
        if (open) {
            setOpen(false);
        }

        setError('');
        navigate('/auth/register');
    };

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
                <BaseModal
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Alert severity="error" sx={errorStyle}>
                        <Typography id="modal-modal-title" variant="h6" component="h2">
                            Ошибка!
                        </Typography>
                        <Typography id="modal-modal-description" sx={{mt: 2}}>
                            {error}
                        </Typography>
                    </Alert>
                </BaseModal>
            </LocalizationProvider>
        </Container>
    );
}

export default observer(App);
