import React, {useContext, useEffect, useRef, useState} from 'react';
import {observer} from "mobx-react-lite";
import Grid from "@mui/material/Grid";
import Typography from '@mui/material/Typography';
import {Context} from "../index";
import Wishlists from "./Wishlist/Wishlists";
import {Button} from "@mui/material";
import {Navigate} from "react-router-dom";
import WishlistEditDialog from "./Wishlist/WishlistEditDialog";
import EmptyWishlist from "./Wishlist/EmptyWishlist";
import {IWish} from "../models/IWish";
import WishlistService from "../services/WishlistService";
import {Dayjs} from "dayjs";

function Profile() {

    const {store} = useContext(Context);
    const [open, setOpen] = useState(false);
    const [lists, setLists] = useState<IWish[]>([]);
    const shouldGetUserInfo = useRef(true);

    useEffect(() => {
        if (shouldGetUserInfo.current) {
            shouldGetUserInfo.current = false;
            store.getUserInfo().then(() => {
                const getList: Function = async () => {
                    const listResponse = await WishlistService.list();
                    setLists(listResponse.data.data);
                }
                getList();
            });
        }
    }, [])

    const submitWindow = async (event: React.MouseEvent<HTMLButtonElement>, name: string, description: string, date: Dayjs | null, visible: number) => {
        event.preventDefault();
        await WishlistService.create({name, description, date, visible});
        const newList = await WishlistService.list();
        setLists(newList.data.data);
        setOpen(false);
    }
    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleItemsChange = async () => {
        const newList = await WishlistService.list();
        setLists(newList.data.data);
    }

    const wishlistTemplate = Boolean(lists.length) ?
        <Wishlists lists={lists}
                   onItemsChange={handleItemsChange}/> :
        <EmptyWishlist/>;

    if (store.isAuth) {
        return (
            <>
                <Grid item
                      mt={10}
                      xs={12}>
                    <Grid container alignItems="baseline" direction="row">
                        <Grid item
                              display="flex"
                              flexDirection="row">
                            <Typography component="h1"
                                        variant="h3"
                                        color="text.secondary"
                                        sx={{fontWeight: 900, fontFamily: 'Amatic SC'}}>
                                Мои вишлисты
                            </Typography>
                            <Button
                                color="inherit"
                                variant="outlined"
                                onClick={handleClickOpen}
                                sx={{borderColor: '#6d6faa', ml: 2}}>
                                <Typography color="text.secondary">
                                    Создать
                                </Typography>
                            </Button>
                            <WishlistEditDialog open={open}
                                                onClose={handleClose}
                                                onSubmit={submitWindow}
                                                dialogTitle="Создать вишлист"/>
                        </Grid>
                    </Grid>
                    <Grid container>
                        <Grid item
                              xs={16}>
                            {wishlistTemplate}
                        </Grid>
                    </Grid>
                </Grid>
            </>
        );

    } else {
        return (<Navigate replace to={"/auth/login"}/>)
    }
}

export default observer(Profile);