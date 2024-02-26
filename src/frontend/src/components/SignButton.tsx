import * as React from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import {useContext} from "react";
import {Context} from "../index";
import {Dialog, DialogActions, DialogContent, DialogTitle, Modal as BaseModal} from "@mui/material";
import {Alert} from "@mui/lab";
import TextField from "@mui/material/TextField";

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    borderRadius: '16px',
    boxShadow: 24,
    p: 4
};

interface IRegResponse {
    details: string;
    message?: string;
    data: {
        uuid: string;
        secret_key: string;
    }
}

export default function SignButton(props: any) {
    const {
        isSignUp,
        buttonTitle,
        name,
        email,
        password,
        handleError
    } = props;

    const {store} = useContext(Context);
    const [open, setOpen] = React.useState(false);
    const [confirmation, setConfirmation] = React.useState(false);
    const [userInfo, setUserInfo] = React.useState({
        uuid: '',
        secret_key: ''
    });
    const [code, setCode] = React.useState('');
    const [error, setError] = React.useState('');

    const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        const request: IRegResponse = isSignUp ? await store.registration(name, email, password) : await store.login(email, password);

        if (request?.message) {
            setError(request.message);
            handleError(request.message)
            return;
        }
        if (isSignUp) {
            setUserInfo({
                uuid: request.data.uuid,
                secret_key: request.data.secret_key
            });
            setConfirmation(true);
        }
    };

    const handleClose = () => {
        if (open) {
            setOpen(false);
        }

        if (confirmation) {
            setConfirmation(false);
        }

        setError('');
    };

    const handleConfirmation = async () => {
        const request = await store.confirm(userInfo.uuid, code, userInfo.secret_key);
        if (request?.message) {
            setError(request.message);
            setOpen(true);
        }
    }

    return (
        <div>
            <Button variant="contained"
                    type="submit"
                    fullWidth
                    sx={{mt: 3, mb: 2, bgcolor: '#d37089'}}
                    onClick={handleClick}>
                {buttonTitle}
            </Button>
            <BaseModal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Alert severity="error" sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Ошибка!
                    </Typography>
                    <Typography id="modal-modal-description" sx={{mt: 2}}>
                        {error}
                    </Typography>
                </Alert>
            </BaseModal>
            <Dialog
                open={confirmation}
                onClose={handleClose}
                PaperProps={{
                    component: 'form',
                    onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                        event.preventDefault();
                        handleConfirmation();
                        handleClose();
                    },
                }}
            >
                <DialogTitle>Введите код подтверждения</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        name="code"
                        label="Код подтверждения"
                        fullWidth
                        variant="standard"
                        onChange={e => setCode(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button type="submit">Отправить</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}