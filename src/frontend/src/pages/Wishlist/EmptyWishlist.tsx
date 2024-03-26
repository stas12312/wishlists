import React from 'react';
import {observer} from "mobx-react-lite";
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {Button} from "@mui/material";

function EmptyWishlist(props: any) {

    return (
        <Box mb={4}
             display="flex"
             justifyContent="center"
             flexDirection="column">
            <Typography variant="body1"
                        textAlign="center"
                        color="text.secondary">
                Пока что желаний нет
            </Typography>
            <Button variant="text">
                {'Добавить'}
            </Button>
        </Box>
    );
}

export default observer(EmptyWishlist);