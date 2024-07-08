import React, { useCallback, useEffect, useState } from 'react';
import { observer } from "mobx-react-lite";
import Grid from "@mui/material/Grid";
import CssBaseline from "@mui/material/CssBaseline";

function WishlistPreview(props: any) {

        
    return (
        <>
            <CssBaseline />
            <Grid item
                mt={2}
                xs={12}>
                Список 1
            </Grid>
        </>
    );
}

export default observer(WishlistPreview);