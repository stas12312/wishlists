import React, {useContext, useEffect, useRef, useState} from 'react';
import {observer} from "mobx-react-lite";
import Grid from "@mui/material/Grid";
import Typography from '@mui/material/Typography';
import {Context} from "../index";
import Wishlists from "./wishlist/Wishlists";
import {Button} from "@mui/material";
import {Navigate} from "react-router-dom";
import WishlistEditDialog from "./wishlist/WishlistEditDialog";
import EmptyWishlist from "./wishlist/EmptyWishlist";
import {IWish} from "../models/IWish";
import WishlistService from "../services/WishlistService";
import {Dayjs} from "dayjs";

function Profile(props: any) {

    const {store} = useContext(Context);
    const [open, setOpen] = useState(false);
    const [lists, setLists] = useState<IWish[]>([]);
    const shouldGetUserInfo = useRef(true);

    useEffect(() => {
        if (shouldGetUserInfo.current) {
            shouldGetUserInfo.current = false;
            const getList: Function = async () => {
                const listResponse = await WishlistService.list();
                setLists(listResponse.data.data);
            }
            getList();
        }
    }, [])

    const submitWindow = async (event: React.MouseEvent<HTMLButtonElement>, name: string, description: string, date: Dayjs | null) => {
        event.preventDefault();
        await WishlistService.create({name, description, date});
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
            <Grid container spacing={2}
                  columns={16}
                  rowSpacing={1}
                  columnSpacing={{xs: 1, sm: 2, md: 3}}>
                <Grid item
                      justifyContent="center"
                      mt={10}
                      xs={4}>
                    <Typography component="h5"
                                variant="h5"
                                color="text.secondary"
                                sx={{fontWeight: 700}}>
                        {store.user['name']}
                    </Typography>
                </Grid>
                <Grid item
                      mt={10}
                      xs={12}>
                    <Grid container alignItems="baseline" direction="row">
                        <Grid item
                              xs={4}>
                            <Typography component="h1"
                                        variant="h3"
                                        color="text.secondary"
                                        sx={{fontWeight: 900}}>
                                Мои вишлисты
                            </Typography>
                        </Grid>
                        <Grid item
                              xs={8}>
                            <React.Fragment>
                                <Button
                                    color="inherit"
                                    variant="outlined"
                                    onClick={handleClickOpen}
                                    sx={{borderColor: '#6d6faa'}}>
                                    <Typography color="text.secondary">
                                        Создать
                                    </Typography>
                                </Button>
                                <WishlistEditDialog open={open}
                                                    onClose={handleClose}
                                                    onSubmit={submitWindow}
                                                    dialogTitle="Создать вишлист"/>
                            </React.Fragment>
                        </Grid>
                    </Grid>
                    <Grid container>
                        <Grid item
                              xs={16}>
                            {wishlistTemplate}
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        );

    } else {
        return (<Navigate replace to={"/auth/login"}/>)
    }
}

export default observer(Profile);