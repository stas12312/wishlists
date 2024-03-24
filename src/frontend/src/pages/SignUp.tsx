import React, {useContext, useState} from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import {FormHelperText, IconButton, InputAdornment, InputLabel} from "@mui/material";

// Стили и шрифты
import '@fontsource/roboto/300.css';
import {Context} from "../index";
import {observer} from "mobx-react-lite";
import {Navigate, useNavigate} from "react-router-dom";
import SignButton from "../components/SignButton";
import ConfirmationForm from "../components/ConfirmationForm";
import {IRegResponse} from "../models/IUser";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import {Visibility, VisibilityOff} from "@mui/icons-material";

function SignUp() {

    const [showPassword, setShowPassword] = React.useState(false);
    const navigate = useNavigate();
    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState('');
    const [confirmError, setConfirmError] = useState('');
    const [confirmation, setConfirmation] = React.useState(false);
    const [stub, setStub] = React.useState(false);
    const [counter, setCounter] = React.useState(5000);
    const [userInfo, setUserInfo] = React.useState({
        uuid: '',
        secret_key: ''
    });
    const {store} = useContext(Context);

    if (store.isAuth) {
        return (<Navigate replace to={"/wishlists"}/>)
    } else {
        const handleError = (errorMessage: string) => {
            setError(errorMessage);
        };

        const handleConfirmation = async (code: string) => {
            const request = await store.confirm(userInfo.uuid, userInfo.secret_key, code);
            if (request?.message) {
                setConfirmError(request.message);
            } else {
                setStub(true);
                localStorage.setItem('access_token', request.access_token);
                localStorage.setItem('refresh_token', request.refresh_token);
                let timerId = setInterval(() => {
                    setCounter((counter) => counter - 1000)
                }, 1000);
                setTimeout(() => {
                    clearInterval(timerId);
                    store.setAuth(true);
                    navigate('/wishlists');
                }, counter);
            }
        }

        const handleSubmit = (request: IRegResponse) => {
            if (request) {
                setUserInfo({
                    uuid: request.data.uuid,
                    secret_key: request.data.secret_key
                });
                setConfirmation(true);
                store.setResetPage(false);
            }
        }

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
                minWidth: stub ? 700 : 300
            }}>
                <CssBaseline/>
                {(Boolean(!confirmation) || store.reset) && <Box
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
                            autoComplete="new-email"
                        />
                        <FormControl fullWidth variant="outlined"
                                     sx={{mt: 1}}>
                            <InputLabel required htmlFor="password">Пароль</InputLabel>
                            <OutlinedInput
                                onChange={e => setPassword(e.target.value)}
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
                        <SignButton isSignUp={true}
                                    buttonTitle="Регистрация"
                                    name={name}
                                    email={email}
                                    password={password}
                                    handleError={handleError}
                                    handleSubmit={handleSubmit}
                        />
                    </Box>
                </Box>}

                {(Boolean(confirmation) && !store.reset && !Boolean(stub)) &&
                <ConfirmationForm handleConfirmation={handleConfirmation}
                                  error={confirmError}/>}

                {(Boolean(stub) && !store.reset) && <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        minWidth: 600
                    }}
                >
                    <Typography component="h1" variant="h5">
                        Регистрация прошла успешно!
                    </Typography>
                    <Typography variant="h6" sx={{
                        alignItems: 'center'
                    }}>
                        Вы будете перенаправлены на главную страницу через {counter / 1000}...
                    </Typography>
                </Box>}
            </Container>
        );
    }
}

export default observer(SignUp)
