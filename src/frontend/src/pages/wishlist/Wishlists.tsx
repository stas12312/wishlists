import React, {useCallback, useState} from 'react';
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
    IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button
} from "@mui/material";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import WishlistService from "../../services/WishlistService";
import WishlistEditDialog from "./WishlistEditDialog";
import {Dayjs} from "dayjs";
import WishlistFooter from "./WishlistFooter";

interface IWishLists extends IWish {
    onItemsChange: Function
}

function ActionList(props: IWishLists) {
    const {
        uuid,
        name,
        description,
        date,
        visible,
        onItemsChange
    } = props;
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openWarningDialog, setOpenWarningDialog] = useState(false);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleDelete = () => {
        setOpenWarningDialog(true);
    }

    const handleOpenEditDialog = () => {
        setOpenEditDialog(true);
    }

    const handleCloseEditDialog = async () => {
        setOpenEditDialog(false);
    }

    const handleSubmitDelete =  useCallback(
        () => {
            WishlistService.delete(uuid).then(() => {
                onItemsChange();
                setOpenWarningDialog(false);
            });
        }, [onItemsChange]);

    const handleCloseWarning = async () => {
        setOpenWarningDialog(false);
    }

    const handleUpdateEditDialog = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>,
         name: string,
         description: string,
         date: Dayjs,
         visibleItem: number
        ) => {
            event.preventDefault();
            WishlistService.update({
                name,
                description,
                date,
                visible: visibleItem,
                uuid
            }).then(() => {
                onItemsChange()
            });
            setOpenEditDialog(false);
            setAnchorEl(null);
        }, [onItemsChange]);

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
                <MenuItem onClick={handleOpenEditDialog}>Редактировать</MenuItem>
                <WishlistEditDialog open={openEditDialog}
                                    onClose={handleCloseEditDialog}
                                    onUpdate={handleUpdateEditDialog}
                                    dialogTitle="Создать вишлист"
                                    wishlistName={name}
                                    wishlistUuid={uuid}
                                    wishlistDescription={description}
                                    wishlistDate={date}
                                    wishlistVisible={visible}
                />
                <MenuItem onClick={handleDelete}>
                    Удалить
                </MenuItem>
                <Dialog
                    open={openWarningDialog}
                    onClose={handleCloseWarning}
                >
                    <DialogTitle>Вы уверены что хотите удалить список желаний?</DialogTitle>
                    <DialogContent>
                        Восстановить его будет невозможно
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseWarning}>Отмена</Button>
                        <Button type="submit" onClick={handleSubmitDelete}>Удалить</Button>
                    </DialogActions>
                </Dialog>
            </Menu>
        </>
    )
}

function Wishes(props: IWishLists) {
    const {
        description,
        name,
        uuid,
        user_id,
        date,
        visible,
        onItemsChange
    } = props;
    return (
        <Grid item
              justifyContent="center"
              mt={10}
              xs={3}>
            <Card sx={{borderRadius: '16px'}}>
                <CardHeader
                    action={
                        <ActionList uuid={uuid}
                                    name={name}
                                    description={description}
                                    date={date}
                                    user_id={user_id}
                                    visible={visible}
                                    onItemsChange={onItemsChange}
                        />
                    }
                    title={
                        <Typography variant="subtitle1"
                                    sx={{fontWeight: 700,
                                        overflow: 'hidden',
                                        display: '-webkit-box',
                                        textOverflow: 'ellipsis',
                                        WebkitLineClamp: '1',
                                        WebkitBoxOrient: 'vertical'}}>
                            {name}
                        </Typography>
                    }
                />
                <CardContent>
                    {/* TODO: Заменить на контентную часть карточки вишлиста*/}
                    {Boolean(date) && <WishlistFooter date={date}/>}
                </CardContent>
            </Card>
        </Grid>
    )
}

interface IWishList {
    lists: IWish[];
    onItemsChange: Function;
}

function Wishlists(props: IWishList) {
    const {
        lists,
        onItemsChange
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
                                key={wishlist.uuid}
                                visible={wishlist.visible}
                                onItemsChange={onItemsChange}/>

                    )
                })}
            </Grid>
        </>
    );
}

export default observer(Wishlists);