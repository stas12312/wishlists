import React from 'react';
import {observer} from "mobx-react-lite";
import Grid from "@mui/material/Grid";
import Typography from '@mui/material/Typography';
import CssBaseline from "@mui/material/CssBaseline";


function EmptyWishesCard(props: any) {

    return (
        <>
            <CssBaseline/>
            <Grid container spacing={2}
                  columns={16}>
                <Grid item
                      mt={10}
                      xs={12}>
                    <Typography component="h1"
                                variant="h3"
                                sx={{fontWeight: 900}}>
                        Пока что желаний нет
                    </Typography>
                </Grid>
            </Grid>
        </>

    );
}

export default observer(EmptyWishesCard);