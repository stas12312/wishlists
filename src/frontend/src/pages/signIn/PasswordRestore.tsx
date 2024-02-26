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
import {AuthRestore} from "../../models/response/AuthResponse";

function PasswordRestore() {
    const {state} = useLocation();
    const {store} = useContext(Context);
    const navigate = useNavigate();

    const [email, setEmail] = useState<string>(state?.email || '');

    const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        const checkRestore = await store.checkRestore(email) as AuthRestore;
        if (checkRestore) {
            navigate('/auth/reset-password', {state: checkRestore});
        }
    }

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

export default observer(PasswordRestore);