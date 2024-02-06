import * as React from 'react';
import {IconButton} from '@mui/material';
import {Menu as MenuIcon} from '@mui/icons-material';
import {AppBar, Toolbar, Button} from "@mui/material";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {Link as RouterLink} from 'react-router-dom';
import {observer} from "mobx-react-lite";
import {useContext} from "react";
import {Context} from "../index";

const defaultTheme = createTheme();

function Navigation(props: any) {
    const {store} = useContext(Context);

    return (
        <ThemeProvider theme={defaultTheme}>
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
                            to="/api/auth/login">
                            Sign In
                        </Button>}

                        {!props.isAuth && <Button
                            color="inherit"
                            variant="outlined"
                            component={RouterLink}
                            to="/api/auth/register">
                            Sign Up
                        </Button>}

                        {props.isAuth && <Button
                            color="inherit"
                            onClick={async () => {
                                await store.logout();
                            }}
                            component={RouterLink}
                            to="/api/user/me">
                            Profile
                        </Button>}

                        {props.isAuth && <Button
                            color="inherit"
                            variant="outlined"
                            onClick={async () => {
                                await store.logout();
                            }}
                            component={RouterLink}
                            to="/api/auth/login">
                            Log Out
                        </Button>}
                    </div>

                </Toolbar>
            </AppBar>
        </ThemeProvider>
    );
}

export default observer(Navigation);
