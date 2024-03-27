import * as React from 'react';
import {IconButton, useTheme} from '@mui/material';
import {Menu as MenuIcon} from '@mui/icons-material';
import {AppBar, Toolbar, Button} from "@mui/material";
import {Link as RouterLink} from 'react-router-dom';
import {observer} from "mobx-react-lite";
import {useContext} from "react";
import {Context} from "../index";
import Box from "@mui/material/Box";

function Navigation(props: any) {
    const {store} = useContext(Context);
    const theme = useTheme();
    return (
        <AppBar position="static" sx={{boxShadow: 0, bgcolor: theme.palette.background.default, mt: 1}}>
            <Toolbar sx={{display: 'flex', justifyContent: 'space-between', boxShadow: 0}}>
                <Button component={RouterLink}
                        sx={{borderRadius: '50%'}}
                        to="/">
                    <Box
                        component="img"
                        alt="gift"
                        src={`http://localhost:3000/img/constellation.png`}
                        height={48}
                    />
                </Button>
                <Box>
                    {!props.isAuth && <Button
                        sx={{mr: 1, justifyContent: 'flex-end'}}
                        component={RouterLink}
                        to="/auth/login">
                        Войти
                    </Button>}

                    {!props.isAuth && <Button
                        variant="outlined"
                        component={RouterLink}
                        onClick={() => {
                            store.setResetPage(true);
                        }}
                        to="/auth/register">
                        Регистрация
                    </Button>}

                    {props.isAuth && <Button
                        component={RouterLink}
                        to="/wishlists">
                        Профиль
                    </Button>}

                    {props.isAuth && <Button
                        variant="outlined"
                        onClick={async () => {
                            await store.logout();
                        }}
                        component={RouterLink}
                        to="/auth/login">
                        Выйти
                    </Button>}
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default observer(Navigation);
