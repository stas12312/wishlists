import React from 'react';
import {observer} from "mobx-react-lite";
import Typography from '@mui/material/Typography';
import {IWish} from "../../models/IWish";
import Grid from "@mui/material/Grid";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import {
    Card,
    CardHeader,
    CardContent,
    IconButton
} from "@mui/material";
import MoreVertIcon from '@mui/icons-material/MoreVert';

function ActionList() {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleDelete = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <IconButton id="basic-button"
                        aria-controls={open ? 'basic-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                        onClick={handleClick}>
                <MoreVertIcon/>
            </IconButton>
            <Menu id="basic-menu"
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  MenuListProps={{
                      'aria-labelledby': 'basic-button',
                  }}
                  anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                  }}
                  transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                  }}
                  sx={{borderColor: '#6d6faa'}}>
                <MenuItem onClick={handleClose}>Редактировать</MenuItem>
                <MenuItem onClick={handleClose}>
                    Удалить
                </MenuItem>
            </Menu>
        </>
    )
}

function Wishes(props: IWish) {
    const {
        description,
        is_active,
        name,
        uuid,
        user_id,
        date,
        created_at
    } = props;
    return (
        <Grid item
              justifyContent="center"
              mt={10}
              xs={3}>
            <Card sx={{maxWidth: 345, borderRadius: '16px'}}>
                <CardHeader
                    action={
                        <ActionList/>
                    }
                    title={
                        <Typography variant="h6"
                                    color="text.secondary"
                                    sx={{fontWeight: 700}}>
                            {name}
                        </Typography>
                    }
                />
                <CardContent>
                {/* TODO: Заменить на контентную часть карточки вишлиста*/}
                </CardContent>
            </Card>
        </Grid>
    )
}

function Wishlists(props: any) {
    const {
        lists
    } = props;

    return (
        <>
            <Grid container spacing={2}
                  columns={16}
                  rowSpacing={1}
                  columnSpacing={{xs: 1, sm: 2, md: 3}}>
                {lists.map((wishlist: IWish) => {
                    return (
                        <Wishes description={wishlist.description}
                                is_active={wishlist.is_active}
                                name={wishlist.name}
                                uuid={wishlist.uuid}
                                user_id={wishlist.user_id}
                                date={wishlist.date}
                                created_at={wishlist.created_at}
                                key={wishlist.uuid}/>

                    )
                })}
            </Grid>
        </>
    );
}
export default observer(Wishlists);