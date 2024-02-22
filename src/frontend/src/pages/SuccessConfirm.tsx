import React, {useContext, useState} from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

// Стили и шрифты
import '@fontsource/roboto/300.css';
import {Context} from "../index";
import {observer} from "mobx-react-lite";
import {Navigate} from "react-router-dom";
import SignButton from "../components/SignButton";

// TODO: Настроить подтверждение регистрации по ссылке
function SuccessConfirm(props: any) {

    const {store} = useContext(Context);

    if (store.isAuth) {
        return (<Navigate replace to={"/wishlists"}/>)
    } else {
        return (
            <Container component="main" maxWidth="xs" sx={{
                marginTop: 8,
                bgcolor: 'background.paper',
                borderRadius: 2,
                p: 2,
                minWidth: 300
            }}>
                <CssBaseline/>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}
                >
                    <Typography component="h1" variant="h5">
                        Данные успешно подтверждены!
                    </Typography>
                </Box>
            </Container>
        );
    }
}

export default observer(SuccessConfirm)
