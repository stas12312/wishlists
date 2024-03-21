import React, {useEffect, useState} from 'react';
import {observer} from "mobx-react-lite";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    IconButton,
    InputLabel
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from "@mui/material/MenuItem";
import FormControl from '@mui/material/FormControl';


function WishlistEditDialog(props: any) {
    const {
        open,
        onClose,
        onSubmit,
        dialogTitle,
        wishlistName,
        wishlistDescription,
        wishlistDate,
        wishlistVisible,
        onUpdate
    } = props;

    const [name, setName] = useState(wishlistName || '');
    const [description, setDescription] = useState(wishlistDescription || '');
    const [date, setDate] = React.useState<Dayjs | null>(wishlistDate ? dayjs(wishlistDate) : null);
    const [cleared, setCleared] = React.useState<boolean>(false);
    const [visible, setVisible] = React.useState(0);

    useEffect(() => {
        if (cleared) {
            const timeout = setTimeout(() => {
                setCleared(false);
            }, 1500);

            return () => clearTimeout(timeout);
        }
        return () => {};
    }, [cleared]);

    const handleChange = (event: SelectChangeEvent) => {
        const visibleItem = Number(event.target.value);
        setVisible(visibleItem);
    };

    const handleSubmitChanges = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        if (onSubmit) {
            onSubmit(event, name, description, date, visible);
        } else if (onUpdate) {
            onUpdate(event, name, description, date, visible)
        }
    }

    const handleClose = () => {
        setDate(null);
        onClose();
    }

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            PaperProps={{
                component: 'form'
            }}
        >
            <DialogTitle>{dialogTitle}</DialogTitle>
            <IconButton
                aria-label="close"
                onClick={handleClose}
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
                    disablePast
                    label="Дата события"
                    value={date}
                    slotProps={{
                        field: { clearable: true, onClear: () => setCleared(true) }
                    }}
                    sx={{
                        marginTop: 1,
                        marginBottom: 2
                    }}
                    format="DD.MM.YYYY"/>
                <FormControl size="small" sx={{
                    display: 'flex',
                    width: '250px'
                }}>
                    <InputLabel htmlFor="uncontrolled-native">
                        Доступен
                    </InputLabel>
                    <Select
                        label='Доступен'
                        defaultValue={wishlistVisible || '0'}
                        onChange={handleChange}
                    >
                        <MenuItem value={'0'}>Только мне</MenuItem>
                        <MenuItem value={'1'}>Всем у кого есть ссылка</MenuItem>
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button type="submit" onClick={handleSubmitChanges}>Сохранить</Button>
            </DialogActions>
        </Dialog>
    );
}

export default observer(WishlistEditDialog);