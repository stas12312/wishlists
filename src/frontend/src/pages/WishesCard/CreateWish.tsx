import React, { useCallback, useEffect, useState } from 'react';
import { observer } from "mobx-react-lite";
import Grid from "@mui/material/Grid";
import Typography from '@mui/material/Typography';
import CssBaseline from "@mui/material/CssBaseline";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { Box, Button, InputLabel, Paper, styled, TextField } from "@mui/material";
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import ImageUploader from '../../components/ImageUploader';
import WishCardService from '../../services/WishCardService';

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
  });

function CreateWish(props: any) {
const {
    onSubmit,
    onUpdate,
    description,
    date,
    visible,
    name
} = props;

    const { uuid } = useParams();
    const navigate = useNavigate();

    const [url, setUrl] = useState('');
    const [wishName, setWishName] = useState('');
    const [imgUrl, setImgUrl] = useState('');
    const [comment, setComment] = useState('');
    const [wishPrice, setWishPrice] = useState('');
    const [wishCurrency, setWishCurrency] = useState('rub');

    const currencyChange = (event: SelectChangeEvent) => {
        setWishCurrency(event.target.value);
    };

    const handleSubmitChanges = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        await WishCardService.create({name: wishName, wishlist_uuid: uuid as string, image: imgUrl, comment: comment, cost: Number(wishPrice)});
        navigate(`/wishlists/${uuid}`);
    };

    const getImgUrl = (url: string) => {
        setImgUrl(url);
    }
        
    return (
        <>
            <CssBaseline />
            <Grid item
                mt={2}
                xs={12}>
                <Button component={RouterLink} to={`/wishlists/${uuid}`}>Назад</Button>
                <Typography variant="h5"
                    sx={{ fontWeight: 900 }}>
                    Добавить подарок
                </Typography>
                <Grid container item
                    mt={2}
                    mb={2}>
                    <InputLabel htmlFor="url" required>
                        Ссылка, где можно купить подарок
                    </InputLabel>
                    <TextField
                        onChange={e => setUrl(e.target.value)}
                        value={url}
                        margin="dense"
                        required
                        fullWidth
                        id="url"
                        placeholder='Ссылка на подарок'
                        name="url"
                        autoComplete="new-url"
                    />
                </Grid>
                <Grid container item spacing={5}>
                    <Grid item
                        xs={5}>
                        <ImageUploader onGetImgUrl={getImgUrl}/>
                    </Grid>
                    <Grid item
                        xs={7}>
                        <InputLabel htmlFor="wishName" required>
                            Название
                        </InputLabel>
                        <TextField
                            sx={{ mb: 2 }}
                            onChange={e => setWishName(e.target.value)}
                            value={wishName}
                            margin="dense"
                            required
                            fullWidth
                            id="wishName"
                            placeholder='Например: airpods pro, телевизор'
                            name="wishName"
                            autoComplete="new-wishName"
                        />
                        <Grid container item spacing={2}>
                            <Grid item>
                                <InputLabel htmlFor="wishPrice">
                                    Цена
                                </InputLabel>
                                <TextField
                                    sx={{ mb: 2 }}
                                    onChange={e => setWishPrice(e.target.value)}
                                    value={wishPrice}
                                    margin="dense"
                                    id="wishPrice"
                                    name="wishPrice"
                                    autoComplete="new-wishPrice"
                                />
                            </Grid>
                            <Grid item>
                                <Select
                                    sx={{ mt: 4 }}
                                    id="currency"
                                    value={wishCurrency}
                                    onChange={currencyChange}
                                    autoWidth
                                    defaultValue={'rub'}>
                                    <MenuItem value={'rub'}>₽, RUB</MenuItem>
                                    <MenuItem value={'usd'}>$, USD</MenuItem>
                                    <MenuItem value={'kzt'}>₸, KZT</MenuItem>
                                </Select>
                            </Grid>
                        </Grid>

                        <InputLabel htmlFor="url">
                            Комментарий к подарку
                        </InputLabel>
                        <TextField
                            multiline
                            inputProps={{
                                maxLength: 300
                            }}
                            rows={4}
                            value={comment}
                            margin="dense"
                            fullWidth
                            id="url"
                            placeholder='Уточните детали к подарку'
                            name="url"
                            autoComplete="new-url"
                            onChange={e => setComment(e.target.value)}
                        />
                    </Grid>
                </Grid>
                <Button type="submit" 
                        variant="contained" 
                        onClick={handleSubmitChanges}
                        >Сохранить</Button>
            </Grid>
        </>
    );
}

export default observer(CreateWish);