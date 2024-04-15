import React from 'react';
import {observer} from "mobx-react-lite";
import Grid from "@mui/material/Grid";
import Typography from '@mui/material/Typography';
import CssBaseline from "@mui/material/CssBaseline";
import { Box } from '@mui/material';


function EmptyWishesCard(props: any) {

    return (
        <>
            <CssBaseline/>
            <Grid container item
            justifyContent="center"
            alignItems="center"
            flexDirection="column"
                  mt={5}
                  xs={12}>
                    <Box
                        component="img"
                        alt="gift"
                        src={`http://localhost:3000/img/cat_gifts.png`}
                        height={250}
                        marginBottom={2}
                    />
                <Typography variant="h5"
                            sx={{fontWeight: 900}}>
                    У тебя еще нет ни одного подарка
                </Typography>
            </Grid>
        </>

    );
}

export default observer(EmptyWishesCard);