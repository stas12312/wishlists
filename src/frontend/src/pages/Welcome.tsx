import React, {useContext} from 'react';

import {createTheme} from '@mui/material/styles';
import {observer} from "mobx-react-lite";
import {Context} from "../index";
import {Link as RouterLink, Navigate} from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import {useTheme} from "@mui/material";

const defaultTheme = createTheme();

function Welcome() {
    const {store} = useContext(Context);
    const theme = useTheme();

    if (store.isAuth) {
        return (
            <Navigate replace to={"/wishlists"}/>
        )
    }

    return (
        <>
            <Grid container spacing={2}
                  columns={16}
                  rowSpacing={1}
                  columnSpacing={{xs: 1, sm: 2, md: 3}}>
                <Grid item
                      mt={10}
                      xs={8}>
                    <Typography id="modal-modal-title"
                                variant="h1"
                                sx={{
                                    fontWeight: 'bold',
                                    fontFamily: 'Amatic SC',
                                    color: 'text.secondary'
                                }}>
                        Создайте свой список вишлистов и поделитесь им с друзьями и близкими
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        component={RouterLink}
                        sx={{boxShadow: `0 0 30px 5px ${theme.palette.text.secondary}`}}
                        to="/auth/register">
                        <Typography id="modal-modal-title"
                                    variant="h3"
                                    sx={{
                                        fontWeight: 'bold',
                                        fontFamily: 'Amatic SC'
                                    }}>
                            Создать вишлист
                        </Typography>
                    </Button>
                </Grid>
                <Grid item
                      mt={10}
                      xs={8}>
                    <Box
                        component="img"
                        alt="gift"
                        src="./img/gift.png"
                    />
                </Grid>
            </Grid>
        </>

    );
}

export default observer(Welcome);