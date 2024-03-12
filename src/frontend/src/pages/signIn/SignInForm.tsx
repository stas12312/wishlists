import React, {useState} from 'react';
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
import {useLocation} from "react-router-dom";
import SignButton from "../../components/SignButton";
import {FormHelperText} from "@mui/material";

function SignInForm() {
    const {state} = useLocation();

    const [email, setEmail] = useState<string>(state?.email || '');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState('');

    const handleError = (errorDetails: string) => {
        setError(errorDetails);
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
                            autoComplete: 'new-password',
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
                    {Boolean(error) && <FormHelperText id="my-helper-text" error>
                        {error}
                    </FormHelperText>}
                    <FormControlLabel
                        control={<Checkbox value="remember" color="primary"/>}
                        label="Запомнить меня"
                    />
                    <SignButton isSignUp={false}
                                buttonTitle="Войти"
                                email={email}
                                password={password}
                                handleError={handleError}/>
                    <Grid container>
                        <Grid item xs>
                            <Link href={"/auth/restore"} variant="body2">
                                Забыли пароль?
                            </Link>
                        </Grid>
                        <Grid item>
                            <Link href={"/auth/register"} variant="body2">
                                {"Нет аккаунта? Зарегистрируйтесь"}
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Container>
    );
}

export default observer(SignInForm);