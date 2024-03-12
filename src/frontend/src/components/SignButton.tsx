import * as React from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import {useContext} from "react";
import {Context} from "../index";
import {Modal as BaseModal} from "@mui/material";
import {Alert} from "@mui/lab";
import {IRegResponse} from "../models/IUser";

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

export default function SignButton(props: any) {
    const {
        isSignUp,
        buttonTitle,
        name,
        email,
        password,
        handleError,
        handleSubmit
    } = props;

    const {store} = useContext(Context);
    const [open, setOpen] = React.useState(false);
    const [error, setError] = React.useState('');

    const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        if (name) {
            const request: IRegResponse = isSignUp ? await store.registration(name, email, password) : await store.login(email, password);

            if (request?.message) {
                setError(request.message);
                handleError(request.message)
                return;
            }
            if (isSignUp) {
                handleSubmit(request);
            }
        } else {
            handleError('Некорректо заполнены поля');
        }
    };

    const handleClose = () => {
        if (open) {
            setOpen(false);
        }

        setError('');
    };

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

        </div>
    );
}