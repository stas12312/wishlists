import React, {useContext, useEffect} from 'react';
import {observer} from "mobx-react-lite";
import Grid from "@mui/material/Grid";
import Typography from '@mui/material/Typography';
import CssBaseline from "@mui/material/CssBaseline";
import {Context} from "../index";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import SettingsIcon from '@mui/icons-material/Settings';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import {useTheme} from "@mui/material";
import {Link as RouterLink} from 'react-router-dom';

function ItemText(props: {
    title: string;
    color: string;}) {
    return (
        <Typography variant="h4"
                    fontFamily="Amatic SC"
                    color={props.color}
                    sx={{fontWeight: 700}}>
            {props.title}
        </Typography>
    )
}

function Sidebar(props: any) {
    const {store} = useContext(Context);
    const [selectedIndex, setSelectedIndex] = React.useState(1);
    const theme = useTheme();
    const handleListItemClick = (
        index: number,
    ) => {
        setSelectedIndex(index);
    };
    return (
        <>
            <CssBaseline/>
            <Grid item
                  justifyContent="center"
                  mt={10}
                  xs={4}>
                <List component="nav">
                    <ListItem disablePadding>
                        <ListItemText sx={{fontWeight: 700}}
                                      primary={<ItemText title={store.user.name}
                                                         color="text.secondary"/>}/>

                    </ListItem>
                    <ListItemButton component={RouterLink}
                                    to="/wishlists"
                                    onClick={(event) => handleListItemClick(0)}>
                        <ListItemIcon>
                            <AutoAwesomeIcon color={selectedIndex === 0 ? 'primary' : 'disabled'}/>
                        </ListItemIcon>
                        <ListItemText color="text.secondary"
                                      sx={{fontWeight: 700}}
                                      primary={<ItemText title="Моя страница"
                                                         color={selectedIndex === 0 ? 'text.primary' : 'text.secondary'}/>}/>
                    </ListItemButton>
                    <ListItemButton onClick={(event) => handleListItemClick(1)}>
                        <ListItemIcon>
                            <SettingsIcon color={selectedIndex === 1 ? 'primary' : 'disabled'}/>
                        </ListItemIcon>
                        <ListItemText color="text.secondary"
                                      sx={{fontWeight: 700}}
                                      primary={<ItemText title="Настройки"
                                                         color={selectedIndex === 1 ? 'text.primary' : 'text.secondary'}/>}/>
                    </ListItemButton>
                </List>
            </Grid>
        </>
    );
}

export default observer(Sidebar);