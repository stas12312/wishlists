import React, {useContext, useState} from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import {observer} from "mobx-react-lite";
import {useLocation, useNavigate} from "react-router-dom";
import Button from "@mui/material/Button";
import {Context} from "../../index";
import AuthService from "../../services/AuthService";

function PasswordReset() {
    const {state} = useLocation();
    const {store} = useContext(Context);
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [success, setSuccess] = useState(false);

    const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        await AuthService.reset_password({
            uuid: state.uuid,
            code: state.code,
            secret_key: state.secret_key,
            password
        }).then(() => {
            setSuccess(true);
        })
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
                        Войти
                    </Typography>
                    <Box component="form" noValidate sx={{mt: 1}}>
                        <TextField
                            onChange={e => setPassword(e.target.value)}
                            value={password}
                            margin="normal"
                            required
                            fullWidth
                            id="newPassword"
                            label="Новый пароль"
                            name="newPassword"
                            autoFocus
                        />
                        <Button variant="contained"
                                type="submit"
                                fullWidth
                                sx={{mt: 3, mb: 2, bgcolor: '#d37089'}}
                                onClick={handleClick}>
                            Войти
                        </Button>
                    </Box>
                </Box>
            </Container>
        );
    }
}

export default observer(PasswordReset);