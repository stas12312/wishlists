import React from 'react';

import { createTheme } from '@mui/material/styles';
import {observer} from "mobx-react-lite";

const defaultTheme = createTheme();

function Welcome() {

    return (
        <div> Nothing here yet</div>
    );
}

export default observer(Welcome);