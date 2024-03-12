import * as React from 'react';
import {IconButton} from '@mui/material';
import {Menu as MenuIcon} from '@mui/icons-material';
import {AppBar, Toolbar, Button} from "@mui/material";
import {Link as RouterLink} from 'react-router-dom';
import {observer} from "mobx-react-lite";
import {useContext} from "react";
import {Context} from "../index";

function Navigation(props: any) {
    const {store} = useContext(Context);

    return (
        <AppBar position="static" sx={{boxShadow: 0}}>
            <Toolbar sx={{display: 'flex', justifyContent: 'space-between', boxShadow: 0}}>
                <IconButton
                    size="large"
                    edge="start"
                    aria-label="menu"
                    sx={{mr: 2}}
                >
                    <MenuIcon/>
                </IconButton>

                <div>
                    {!props.isAuth && <Button
                        color="inherit"
                        sx={{mr: 1, justifyContent: 'flex-end'}}
                        component={RouterLink}
                        to="/auth/login">
                        Войти
                    </Button>}

                    {!props.isAuth && <Button
                        color="inherit"
                        variant="outlined"
                        component={RouterLink}
                        onClick={() => {
                            store.setResetPage(true);
                        }}
                        to="/auth/register">
                        Регистрация
                    </Button>}

                    {props.isAuth && <Button
                        color="inherit"
                        component={RouterLink}
                        to="/wishlists">
                        Профиль
                    </Button>}

                    {props.isAuth && <Button
                        color="inherit"
                        variant="outlined"
                        onClick={async () => {
                            await store.logout();
                        }}
                        component={RouterLink}
                        to="/auth/login">
                        Выйти
                    </Button>}
                </div>

            </Toolbar>
        </AppBar>
    );
}

export default observer(Navigation);
