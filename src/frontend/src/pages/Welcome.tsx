import React, {useContext} from 'react';

import {createTheme} from '@mui/material/styles';
import {observer} from "mobx-react-lite";
import {Context} from "../index";
import {Navigate} from "react-router-dom";

const defaultTheme = createTheme();

function Welcome() {
    const {store} = useContext(Context);

    if (store.isAuth) {
        return (
            <Navigate replace to={"/wishlists"}/>
        )
    }

    return (
        <div> {process.env.REACT_APP_API_URL}</div>
    );
}

export default observer(Welcome);