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
import {FormHelperText, IconButton, InputAdornment, InputLabel} from "@mui/material";
import OutlinedInput from "@mui/material/OutlinedInput";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import FormControl from "@mui/material/FormControl";

function SignInForm() {
    const {state} = useLocation();

    const [email, setEmail] = useState<string>(state?.email || '');
    const [password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = React.useState(false);
    const [error, setError] = useState('');

    const handleError = (errorDetails: string) => {
        setError(errorDetails);
    };

    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
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
                    <FormControl fullWidth variant="outlined">
                        <InputLabel htmlFor="password">Пароль</InputLabel>
                        <OutlinedInput
                            sx={{mb: 2}}
                            onChange={e => {
                                setPassword(e.target.value);
                                if (error) {
                                    setError('');
                                }
                            }}
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            autoComplete="new-password"
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={handleClickShowPassword}
                                        onMouseDown={handleMouseDownPassword}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            }
                            required
                            fullWidth
                            label="Пароль"
                            id="password"
                            name="password"
                            autoFocus
                        />
                    </FormControl>
                    {Boolean(error) && <FormHelperText error sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        fontSize: 18
                    }}>
                        {error}
                    </FormHelperText>}
                    <FormControlLabel
                        control={<Checkbox value="remember" color="primary"/>}
                        label="Запомнить меня"
                    />
                    <SignButton isSignUp={false}
                                type="submit"
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