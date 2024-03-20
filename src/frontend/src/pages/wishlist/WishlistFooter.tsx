import React from 'react';
import {observer} from "mobx-react-lite";
import Grid from "@mui/material/Grid";
import Typography from '@mui/material/Typography';
import dayjs from "dayjs";
import {Chip} from "@mui/material";
import relativeTime from "dayjs/plugin/relativeTime";
import {getNoun} from "../../helpers/Functions";


function WishlistFooter(props: {date: string}) {
    dayjs.extend(relativeTime);
    const dateToString: string = dayjs(props.date).format('DD.MM.YYYY');

    const getDaysLeft = () => {
        const daysLeft: number = dayjs(props.date).diff(dayjs(), 'day');

        if (daysLeft === 0) {
            return 'Сегодня';
        }

        if (daysLeft === 1) {
            return 'Завтра';
        }

        if (daysLeft === 2) {
            return 'Послезавтра';
        }

        if (daysLeft > 2) {
            return `Через ${daysLeft} ${getNoun(daysLeft, 'день', 'дня', 'дней')}`;
        }

        return 'Прошло';
    }

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
                      label={getDaysLeft()}/>
            </Grid>
        </Grid>
    );
}

export default observer(WishlistFooter);