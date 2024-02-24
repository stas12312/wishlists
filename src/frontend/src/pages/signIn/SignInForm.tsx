import React, {useContext, useState} from 'react';
import Avatar from '@mui/material/Avatar';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import {observer} from "mobx-react-lite";
import {Navigate, useLocation} from "react-router-dom";
import SignButton from "../../components/SignButton";
import {ReactJSXElement} from "@emotion/react/types/jsx-namespace";

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

function SignInForm(remindPassword: any) {
    const {state} = useLocation();

    const [email, setEmail] = useState<string>(state?.email || '');
    const [password, setPassword] = useState<string>('');

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
                <Avatar sx={{m: 1, bgcolor: '#d37089'}}>
                    <LockOutlinedIcon/>
                </Avatar>
                <Typography component="h1" variant="h5">
                    Войти
                </Typography>
                <Box component="form" noValidate sx={{mt: 1}}>
                    <TextField
                        onChange={e => setEmail(e.target.value)}
                        value={email}
                        defaultValue={email || ''}
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Почта"
                        name="email"
                        autoFocus
                    />
                    <TextField
                        onChange={e => setPassword(e.target.value)}
                        value={password}
                        inputProps={{
                            autocomplete: 'new-password',
                            form: {
                                autoComplete: 'off',
                            },
                        }}
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Пароль"
                        type="password"
                        id="password"
                    />
                    <FormControlLabel
                        control={<Checkbox value="remember" color="primary"/>}
                        label="Запомнить меня"
                    />
                    <SignButton isSignUp={false}
                                buttonTitle="Войти"
                                email={email}
                                password={password}/>
                    <Grid container>
                        <Grid item xs>
                            <Link href="/auth/restore" variant="body2">
                                Забыли пароль?
                            </Link>
                        </Grid>
                        <Grid item>
                            <Link href="/auth/register" variant="body2">
                                {"Нет аккаунта? Зарегистрируйтесь"}
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
            <Copyright sx={{mt: 8, mb: 4}}/>
        </Container>
    );
}

export default observer(SignInForm);