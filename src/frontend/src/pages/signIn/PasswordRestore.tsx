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
import ConfirmationForm from "../../components/ConfirmationForm";
import AuthService from "../../services/AuthService";

function PasswordRestore() {
    const {state} = useLocation();
    const {store} = useContext(Context);
    const navigate = useNavigate();

    const [email, setEmail] = useState<string>(state?.email || '');
    const [confirmation, setConfirmation] = React.useState(false);
    const [resetInfo, setResetInfo] = React.useState({
        uuid: '',
        code: '',
        secret_key: ''
    });

    const handleConfirmation = async () => {
        const checkRestore = await store.checkReset(resetInfo);
        if (checkRestore) {
            navigate('/auth/reset-password', {state: checkRestore});
        }
    }

    const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        const restoreData = await AuthService.restore(email);
        if (restoreData) {
            setResetInfo({
                uuid: restoreData.data.uuid,
                code: restoreData.data.code,
                secret_key: restoreData.data.secret_key
            });
            setConfirmation(true);
            store.setResetPage(false);
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
            {Boolean(!confirmation) && store.reset && <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}
            >
                <Typography component="h1" variant="h5">
                    Восстановление пароля
                </Typography>
                <Typography variant="body1"
                            align="center"
                            sx={{mt: 1}}>
                    Введите email, на который будет выслано письмо для восстановления пароля
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
                        Восстановить
                    </Button>
                </Box>
            </Box>}

            {Boolean(confirmation) && !store.reset &&
                <ConfirmationForm handleConfirmation={handleConfirmation}/>}
        </Container>
    );
}

export default observer(PasswordRestore);