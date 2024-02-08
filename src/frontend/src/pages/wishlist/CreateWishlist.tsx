import React, {useState} from 'react';
import {observer} from "mobx-react-lite";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button, IconButton
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import {DatePicker} from "@mui/x-date-pickers";
import dayjs, { Dayjs } from 'dayjs';


function CreateWishlist(props: any) {
    const {
        open,
        onClose,
        onSubmit
    } = props;

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = React.useState<Dayjs | null>(dayjs(null));

    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                component: 'form'
            }}
        >
            <DialogTitle>Создать вишлист</DialogTitle>
            <IconButton
                aria-label="close"
                onClick={onClose}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                }}
            >
                <CloseIcon/>
            </IconButton>
            <DialogContent>
                <TextField
                    required
                    onChange={e => setName(e.target.value)}
                    value={name}
                    id="wishlist-name"
                    margin="dense"
                    label="Название"
                    fullWidth
                />
                <TextField
                    onChange={e => setDescription(e.target.value)}
                    name={description}
                    id="wishlist-description"
                    margin="dense"
                    label="Описание"
                    fullWidth
                />
                <DatePicker
                    onChange={(value) => setDate(value)}
                    label="Дата события"
                    value={date}
                    slotProps={{
                        actionBar: {
                            actions: ['clear'],
                        },
                    }}
                    sx={{
                        marginTop: 1
                    }}
                    format="DD.MM.YYYY"/>
            </DialogContent>
            <DialogActions>
                <Button type="submit" onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                    event.preventDefault();
                    onSubmit(event, name, description, date);
                }}>Сохранить</Button>
            </DialogActions>
        </Dialog>
    );
}

export default observer(CreateWishlist);