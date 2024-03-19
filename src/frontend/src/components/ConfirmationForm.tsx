import * as React from 'react';
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import {FormHelperText} from "@mui/material";

export default function ConfirmationForm(props: { handleConfirmation: Function, error?: string }) {
    const [code, setCode] = React.useState('');
    const handleConfirmation = (event: React.FormEvent) => {
        event.preventDefault();
        props.handleConfirmation(code);
    }

    return (
        <Box component="form"
             onSubmit={handleConfirmation}
             noValidate sx={{mt: 1}}>
            <Typography component="h1"
                        variant="h5"
                        align="center">
                Введите код подтверждения
            </Typography>
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
            {Boolean(props.error) && <FormHelperText error sx={{
                display: 'flex',
                justifyContent: 'center',
                fontSize: 18
            }}>
                {props.error}
            </FormHelperText>}
            <Button variant="contained"
                    type="submit"
                    fullWidth
                    sx={{mt: 3, mb: 2, bgcolor: '#d37089'}}>
                Отправить
            </Button>
        </Box>
    );
}