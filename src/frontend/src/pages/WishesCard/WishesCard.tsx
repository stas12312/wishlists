import React, {useCallback, useEffect, useState} from 'react';
import {observer} from "mobx-react-lite";
import Grid from "@mui/material/Grid";
import Typography from '@mui/material/Typography';
import CssBaseline from "@mui/material/CssBaseline";
import {Button, IconButton} from "@mui/material";
import {useParams} from 'react-router-dom';
import {Link as RouterLink} from 'react-router-dom';
import WishlistService from "../../services/WishlistService";
import {ModeEdit} from "@mui/icons-material";
import {Dayjs} from "dayjs";
import EmptyWishesCard from "./EmptyWishesCard";
import WishlistEditDialog from "../Wishlist/WishlistEditDialog";
import Box from "@mui/material/Box";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

function WishesCard() {
    const {uuid} = useParams();
    const [name, setName] = useState('');
    const [id, setId] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = React.useState<Dayjs | null>(null);
    const [visible, setVisible] = React.useState(0);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [emptyView, setEmptyView] = useState(false);

    useEffect(() => {
        WishlistService.get(uuid as string).then((response) => {
            const data = response.data.data;
            setName(data.name);
            setVisible(data.visible);
            setId(data.uuid);
            setDescription(data.description)
        });

        WishlistService.get_wishes(uuid as string).then((responseWishes) => {
            const responseWishesData = responseWishes.data.data;
            if (!responseWishesData.length) {
                setEmptyView(true);
            }
        })
    }, []);

    const handleOpenEditDialog = (event: { stopPropagation: () => void; }) => {
        event.stopPropagation();
        setOpenEditDialog(true);
    }

    const handleCloseEditDialog = async () => {
        setOpenEditDialog(false);
    }

    const handleUpdateEditDialog = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>,
         name: string,
         description: string,
         date: Dayjs,
         visibleItem: number
        ) => {
            event.preventDefault();
            WishlistService.update({
                name,
                description,
                date,
                visible: visibleItem,
                uuid
            }).then(() => {

            });
            setOpenEditDialog(false);
        }, []);
    return (
        <>
            <CssBaseline/>
            <Grid item
                  mt={10}
                  xs={12}>
                <Button component={RouterLink} to="/wishlists">К списку вишлистов</Button>
                <Box display="flex" flexDirection="row" alignItems="center" justifyContent="space-between">
                    <Box display="flex" flexDirection="row" alignItems="center">
                        <Typography component="h1"
                                    variant="h3"
                                    sx={{fontWeight: 900}}
                                    mr={2}>
                            {name}
                        </Typography>
                        <Button component={RouterLink}
                                to={`/wishlists/${uuid}/wishes`}
                                variant="outlined">
                            Добавить подарок
                        </Button>
                    </Box>

                    <Box>
                        <IconButton
                            sx={{mr: 1}}
                            onClick={handleOpenEditDialog}
                        >
                            <ModeEdit/>
                        </IconButton>
                        <IconButton
                        >
                            <DeleteOutlineIcon/>
                        </IconButton>
                    </Box>
                </Box>
                <WishlistEditDialog open={openEditDialog}
                                    onClose={handleCloseEditDialog}
                                    onUpdate={handleUpdateEditDialog}
                                    dialogTitle="Редактирование вишлиста"
                                    wishlistName={name}
                                    wishlistUuid={id}
                                    wishlistDescription={description}
                                    wishlistDate={date}
                                    wishlistVisible={visible}
                />
                {Boolean(emptyView) && <EmptyWishesCard/>}
            </Grid>
        </>
    );
}

export default observer(WishesCard);