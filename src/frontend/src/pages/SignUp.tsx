import React, {useContext, useState} from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import {FormHelperText} from "@mui/material";

// Стили и шрифты
import '@fontsource/roboto/300.css';
import {Context} from "../index";
import {observer} from "mobx-react-lite";
import {Navigate} from "react-router-dom";
import SignButton from "../components/SignButton";

function Copyright(props: any) {

    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Copyright © '}
            <Link color="inherit" href="https://mui.com/">
                Your Website
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

function SignUp() {

    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState('');
    const {store} = useContext(Context);

    if (store.isAuth) {
        return (<Navigate replace to={"/wishlists"}/>)
    } else {
        const handleError = (errorMessage: string) => {
            setError(errorMessage);
        };

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
                        Регистрация
                    </Typography>
                    <Box component="form" noValidate sx={{mt: 1}}>
                        <TextField
                            onChange={e => setName(e.target.value)}
                            value={name}
                            margin="normal"
                            required
                            fullWidth
                            id="name"
                            label="Имя"
                            name="name"
                            autoComplete="name"
                            autoFocus
                        />
                        <TextField
                            onChange={e => setEmail(e.target.value)}
                            value={email}
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Почта"
                            name="email"
                            autoComplete="email"
                        />
                        <TextField
                            onChange={e => setPassword(e.target.value)}
                            value={password}
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Пароль"
                            type="password"
                            id="password"
                        />
                        {Boolean(error) && <FormHelperText id="my-helper-text" error>
                            {error}
                        </FormHelperText>}
                        <SignButton isSignUp={true}
                                    buttonTitle="Регистрация"
                                    name={name}
                                    email={email}
                                    password={password}
                                    handleError={handleError}/>
                    </Box>
                </Box>
                <Copyright sx={{mt: 8, mb: 4}}/>
            </Container>
        );
    }
}

export default observer(SignUp)
