import React from 'react';
import {observer} from "mobx-react-lite";
import Grid from "@mui/material/Grid";
import Typography from '@mui/material/Typography';
import dayjs from "dayjs";
import {Chip} from "@mui/material";
import relativeTime from "dayjs/plugin/relativeTime";


function WishlistFooter(props: {date: string}) {
    dayjs.extend(relativeTime);

    const getNoun = (number: number, two: string, several: string) => {
        let n = Math.abs(number);
        n %= 10;
        if (n >= 5 && n <= 20 || n === 0) {
            return several;
        }
        if (n >= 2 && n <= 4) {
            return two;
        }
        return several;
    }

    const dateToString: string = dayjs(props.date).format('DD.MM.YYYY');
    const daysLeft: number = dayjs(props.date).diff(dayjs(), 'day');
    const goalDateText: string = daysLeft === 0 ? 'Сегодня' :
        daysLeft === 1 ? 'Завтра' :
            daysLeft === 2 ? 'Послезавтра' :
                daysLeft > 2 ? `Через ${daysLeft} ${getNoun(daysLeft, 'дня', 'дней')}` :
                    'Прошло';

    return (
        <Grid container spacing={1}>
            <Grid item xs>
                <Typography variant="caption"
                            color="text.secondary"
                            sx={{fontWeight: 900}}>
                    {dateToString}
                </Typography>
            </Grid>
            <Grid item xs>
                <Chip color="warning"
                      size="small"
                      label={goalDateText}/>
            </Grid>
        </Grid>
    );
}

export default observer(WishlistFooter);