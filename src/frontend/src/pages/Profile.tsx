import React, {useContext, useEffect, useState} from 'react';
import {observer} from "mobx-react-lite";
import Grid from "@mui/material/Grid";
import Typography from '@mui/material/Typography';
import UserService from "../services/UserService";
import {AxiosResponse} from "axios";
import {IUser} from "../models/IUser";
import {Context} from "../index";
import Wishlists from "./wishlist/Wishlists";
import {Link as RouterLink} from "react-router-dom";
import {Button} from "@mui/material";

function Profile(props: any) {

    const name: string = 'new wishlist';
    const description: string = 'new desription';


    const {store} = useContext(Context);
    useEffect(() => {
        store.getUserInfo();
    }, [])

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
                                    sx={{fontWeight: 900}}>
                            Мои вишлисты
                        </Typography>
                    </Grid>
                    <Grid item
                          xs={8}>
                        <Button
                            color="inherit"
                            variant="outlined"
                            onClick={async () => {
                                await store.createNewWishlist(name, description );
                            }}>
                            Make Wishlist
                        </Button>
                    </Grid>
                </Grid>
                <Grid container
                      xs={12}>
                    <Wishlists/>
                </Grid>
            </Grid>
        </Grid>
    );
}

export default observer(Profile);