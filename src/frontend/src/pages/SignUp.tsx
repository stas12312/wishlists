import React, {useContext, useState} from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import {createTheme, ThemeProvider} from '@mui/material/styles';

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

const defaultTheme = createTheme();

function SignUp(props: any) {

    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const {store} = useContext(Context);

    if (store.isAuth) {
        return (<Navigate replace to={"/profile"}/>)
    } else {
        return (
            <ThemeProvider theme={defaultTheme}>
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
                            Sign up
                        </Typography>
                        <Box component="form" noValidate sx={{mt: 1}}>
                            <TextField
                                onChange={e => setName(e.target.value)}
                                value={name}
                                margin="normal"
                                required
                                fullWidth
                                id="name"
                                label="Name"
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
                                label="Email Address"
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
                                label="Password"
                                type="password"
                                id="password"
                            />
                            <FormControlLabel
                                control={<Checkbox value="remember" color="primary"/>}
                                label="Remember me"
                            />
                            {/*<Button*/}
                            {/*    fullWidth*/}
                            {/*    variant="contained"*/}
                            {/*    sx={{mt: 3, mb: 2, bgcolor: '#d37089'}}*/}
                            {/*    onClick={async (event) => {*/}
                            {/*        event.preventDefault();*/}
                            {/*        await store.registration(name, email, password);*/}
                            {/*    }}*/}
                            {/*>*/}
                            {/*    Sign Up*/}
                            {/*</Button>*/}
                            <SignButton isSignUp={true}
                                        buttonTitle="Sign Up"
                                        name={name}
                                        email={email}
                                        password={password}/>
                        </Box>
                    </Box>
                    <Copyright sx={{mt: 8, mb: 4}}/>
                </Container>
            </ThemeProvider>
        );
    }
}

export default observer(SignUp)
