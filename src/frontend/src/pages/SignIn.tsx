import React, {useContext, useState} from 'react';
import {Context} from "../index";
import {observer} from "mobx-react-lite";
import {Navigate, useLocation} from "react-router-dom";
import SignInForm from "./signIn/SignInForm";

function SignIn() {
    const {store} = useContext(Context);

    if (store.isAuth) {
        return (
            <Navigate replace to={"/wishlists"}/>
        )
    } else {
        return (
            <SignInForm />
        );
    }
}

export default observer(SignIn);