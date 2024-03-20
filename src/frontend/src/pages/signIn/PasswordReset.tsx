import React, {useContext, useState} from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import OutlinedInput from '@mui/material/OutlinedInput';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import {observer} from "mobx-react-lite";
import {useLocation, useNavigate} from "react-router-dom";
import Button from "@mui/material/Button";
import {Context} from "../../index";
import AuthService from "../../services/AuthService";
import {FormHelperText, IconButton, InputAdornment} from "@mui/material";
import {Visibility, VisibilityOff} from "@mui/icons-material";

function PasswordReset() {
    const {state} = useLocation();
    const {store} = useContext(Context);
    const navigate = useNavigate();

    const [password, setPassword] = useState(' f');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
    const [counter, setCounter] = React.useState(5000);

    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        if (password === confirmPassword) {
            await AuthService.reset_password({
                uuid: state.uuid,
                code: state.code,
                secret_key: state.secret_key,
                password
            }).then((result) => {
                if (result) {
                    setSuccess(true);
                    let timerId = setInterval(() => {
                        setCounter((counter) => counter - 1000)
                    }, 1000);
                    setTimeout(() => {
                        clearInterval(timerId);
                        localStorage.setItem('access_token', result.data.access_token);
                        localStorage.setItem('refresh_token', result.data.refresh_token);
                        store.setAuth(true);
                        navigate('/wishlists');
                    }, counter);

                }
            }).catch((result) => {
                const errorMessage: string = result.response.data.fields ? result.response.data.fields.at(0).message :
                    result.response.data.message;
                setError(errorMessage);
            })
        } else {
            setError('Введенные пароли не совпадают!')
        }
    }

    if (success) {
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
                        Пароль успешно обновлен!
                    </Typography>
                    <Typography variant="h6" sx={{
                        alignItems: 'center'
                    }}>
                        Вы будете перенаправлены на главную страницу через {counter / 1000}...
                    </Typography>
                </Box>
            </Container>
        );
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
                        Сброс пароля
                    </Typography>
                    <Box component="form" noValidate sx={{mt: 1}}>
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
                            id="newPassword"
                            label="Новый пароль"
                            name="newPassword"
                            autoFocus
                        />
                        <OutlinedInput
                            onChange={e => {
                                setConfirmPassword(e.target.value)
                                if (error) {
                                    setError('');
                                }
                            }}
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={handleClickShowConfirmPassword}
                                        onMouseDown={handleMouseDownPassword}
                                        edge="end"
                                    >
                                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            }
                            required
                            fullWidth
                            id="confirmNewPassword"
                            label="Повторите пароль"
                            name="confirmNewPassword"
                        />
                        {Boolean(error) && <FormHelperText error sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            fontSize: 18
                        }}>
                            {error}
                        </FormHelperText>}
                        <Button variant="contained"
                                type="submit"
                                fullWidth
                                sx={{mt: 3, mb: 2, bgcolor: '#d37089'}}
                                onClick={handleClick}>
                            Отправить
                        </Button>
                    </Box>
                </Box>
            </Container>
        );
    }
}

export default observer(PasswordReset);