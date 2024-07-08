import React, { useCallback, useEffect, useState } from 'react';
import { observer } from "mobx-react-lite";
import Grid from "@mui/material/Grid";
import CssBaseline from "@mui/material/CssBaseline";
import WishCardService from '../../services/WishCardService';
import { Card, CardActionArea, CardContent, CardHeader, useTheme } from '@mui/material';

function WishesCardList(props: any) {
    const [lists, setLists] = useState<any>([]);

    useEffect(() => {
        WishCardService.list().then((res) => {
            setLists(res.data.data);
        });
    }, []);
        
    return (
        <>
            <CssBaseline />
            <Grid item
                mt={2}
                xs={12}>
                {lists.map((card: any) => {
                    return (
                        <WishCard card={card}
                                key={card.uuid}/>
                    )
                })}
            </Grid>
        </>
    );
}

function WishCard(props: {card: any}) {
    const {card} = props;
    const [shadow, setShadow] = useState(1);
    const theme = useTheme();
    return (
    <>
        <Grid item
              justifyContent="center"
              mt={2}
              xs={3}>
            <Card sx={{
                borderRadius: '16px',
                borderColor: 'background.paper',
                height: '100%',
                boxShadow: shadow ? 'none' : `0 0 10px ${shadow} ${theme.palette.text.secondary}`
            }}
                  onMouseOver={() => {
                      setShadow(0);
                  }}
                  onMouseOut={() => {
                      setShadow(1);
                  }}>
                
                    <CardContent>
                        {card.description}
                    </CardContent>
            </Card>
        </Grid>
    </>
    )
}

export default observer(WishesCardList);