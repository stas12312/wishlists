import React from 'react';

import { createTheme } from '@mui/material/styles';
import {observer} from "mobx-react-lite";

const defaultTheme = createTheme();

function Welcome() {

    return (
        <div> {process.env.REACT_APP_API_URL}</div>
    );
}

export default observer(Welcome);