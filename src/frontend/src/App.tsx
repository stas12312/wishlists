// Pages
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Profile from "./pages/Profile";
import Navigation from "./components/Navigation";

import * as React from 'react';
import {Route, Routes, useLocation, useNavigate} from "react-router-dom";
import {useContext, useEffect, useRef} from "react";
import {Context} from "./index";
import {observer} from "mobx-react";
import ErrorBoundary from "./components/ErrorBoundary";
import Container from "@mui/material/Container";
import Welcome from "./pages/Welcome";
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import Typography from "@mui/material/Typography";
import {Alert} from "@mui/lab";
import {Modal as BaseModal} from "@mui/material";
import PasswordRestore from "./pages/signIn/PasswordRestore";
import PasswordReset from "./pages/signIn/PasswordReset";

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
    const urlUnconfirmed = useRef(true);
    const shouldCheckAuth = useRef(true);

    useEffect(() => {
        if (pathname === '/auth/confirm' && parameters.size && urlUnconfirmed.current) {
            urlUnconfirmed.current = false;
            const uuid: string = parameters && parameters.get('uuid') as string;
            const key: string = parameters.get('key') as string;
            store.confirm(uuid, key, null, true).then((response) => {
                if (response.message) {
                    setOpen(true);
                    setError(response.message);
                } else {
                    localStorage.setItem('access_token', response.access_token);
                    localStorage.setItem('refresh_token', response.refresh_token);
                    store.setAuth(true);
                    navigate('/wishlists');
                }
            });
        }

        if (
            localStorage.getItem('access_token') !== null &&
            pathname !== '/auth/confirm' &&
            shouldCheckAuth.current
        ) {
            shouldCheckAuth.current = false;
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

    const handleReset = () => {

    }

    return (
        <Container maxWidth="xl"
                   sx={store.isAuth ? {
                       minWidth: 1760
                   } : {
                       minWidth: 'auto'
                   }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Navigation isAuth={store.isAuth}
                            onClick={handleReset}/>
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
                           element={<SignUp />}
                           errorElement={<ErrorBoundary/>}/>
                    <Route path="/wishlists"
                           element={
                               <Profile
                                   name={'name'}
                                   isAuth={store.isAuth}/>}
                           errorElement={<ErrorBoundary/>}/>
                    <Route path="/auth/restore"
                           element={<PasswordRestore/>}
                           errorElement={<ErrorBoundary/>}/>
                    <Route path="/auth/reset-password"
                           element={<PasswordReset/>}
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
