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


function WishlistEditDialog(props: any) {
    const {
        open,
        onClose,
        onSubmit,
        dialogTitle,
        wishlistName,
        wishlistDescription,
        wishlistDate,
        onUpdate
    } = props;

    const [name, setName] = useState(wishlistName || '');
    const [description, setDescription] = useState(wishlistDescription || '');
    const [date, setDate] = React.useState<Dayjs | null>(dayjs(wishlistDate || null));

    const handleSubmitChanges = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        if (onSubmit) {
            onSubmit(event, name, description, date);
        } else if (onUpdate) {
            onUpdate(event, name, description, date)
        }
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                component: 'form'
            }}
        >
            <DialogTitle>{dialogTitle}</DialogTitle>
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
                    value={description}
                    id="wishlist-description"
                    margin="dense"
                    label="Описание"
                    fullWidth
                />
                <DatePicker
                    onChange={(value) => setDate(value)}
                    minDate={dayjs()}
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
                <Button type="submit" onClick={handleSubmitChanges}>Сохранить</Button>
            </DialogActions>
        </Dialog>
    );
}

export default observer(WishlistEditDialog);