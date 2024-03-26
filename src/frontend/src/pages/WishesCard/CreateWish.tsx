import React, {useEffect} from 'react';
import {observer} from "mobx-react-lite";
import Grid from "@mui/material/Grid";
import Typography from '@mui/material/Typography';
import CssBaseline from "@mui/material/CssBaseline";
import {Link as RouterLink, useParams} from "react-router-dom";
import {Button} from "@mui/material";


function CreateWish(props: any) {
    const {uuid} = useParams();

    return (
        <>
            <CssBaseline/>
            <Grid item
                  mt={10}
                  xs={12}>
                <Button component={RouterLink} to={`/wishlists/${uuid}`}>Назад</Button>
                <Typography variant="h5"
                            sx={{fontWeight: 900}}>
                    Добавить подарок
                </Typography>
            </Grid>
        </>

    );
}

export default observer(CreateWish);