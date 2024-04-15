import React, { useEffect, useState } from 'react';
import { observer } from "mobx-react-lite";
import Grid from "@mui/material/Grid";
import Typography from '@mui/material/Typography';
import CssBaseline from "@mui/material/CssBaseline";
import { Link as RouterLink, useParams } from "react-router-dom";
import { Box, Button, InputLabel, TextField } from "@mui/material";

function CreateWish(props: any) {
    const { uuid } = useParams();

    const [url, setUrl] = useState('');
    const [wishName, setWishName] = useState('');
    const [wishImg, setWishImg] = useState('');
    const [wishPrice, setWishPrice] = useState('');

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
                        <InputLabel htmlFor="wishImg">
                            Изображение подарка
                        </InputLabel>
                        <Box component="section" sx={{ 
                            p: 2, 
                            border: '1px dashed grey', 
                            borderRadius: 16 
                        }}>
                            This Box renders as an HTML section element.
                        </Box>
                        <InputLabel htmlFor="wishImg">
                            Ссылка на изображение
                        </InputLabel>
                        <TextField
                            onChange={e => setWishImg(e.target.value)}
                            value={wishImg}
                            margin="dense"
                            fullWidth
                            id="wishImg"
                            placeholder='Ссылка'
                            name="wishImg"
                            autoComplete="new-wishImg"
                        />
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
                                    placeholder='Ссылка на подарок'
                                    name="wishPrice"
                                    autoComplete="new-wishPrice"
                                />
                            </Grid>
                            <Grid item>
                                <TextField
                                    sx={{ mt: 4 }}
                                    select
                                    onChange={e => setWishPrice(e.target.value)}
                                    value={wishPrice}
                                    margin="dense"
                                    id="wishPrice"
                                    placeholder='Ссылка на подарок'
                                    name="wishPrice"
                                    autoComplete="new-wishPrice"
                                />
                            </Grid>
                        </Grid>

                        <InputLabel htmlFor="url">
                            Комментарий к подарку
                        </InputLabel>
                        <TextField
                            onChange={e => setUrl(e.target.value)}
                            multiline
                            inputProps={{
                                maxLength: 300
                            }}
                            rows={4}
                            maxRows={6}
                            value={url}
                            margin="dense"
                            fullWidth
                            id="url"
                            placeholder='Уточните детали к подарку'
                            name="url"
                            autoComplete="new-url"
                        />
                    </Grid>
                </Grid>
            </Grid>
        </>
    );
}

export default observer(CreateWish);