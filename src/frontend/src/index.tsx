import React, {createContext} from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {BrowserRouter} from "react-router-dom";
import Store from "./store/store";
import {createTheme, ThemeProvider, ThemeOptions} from "@mui/material/styles";

interface  State {
    store: Store
}
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const store = new Store();
const themeOptions: ThemeOptions = {
    palette: {
        mode: 'light',
        primary: {
            main: '#56569c',
            contrastText: '#eaebf3',
        },
        secondary: {
            main: '#56799c',
        },
        background: {
            default: '#c9cce2',
        },
        error: {
            main: '#e74444',
        },
        success: {
            main: '#569c79',
        },
        info: {
            main: '#9c569c',
        },
        text: {
            primary: '#56569c',
            secondary: '#6d6faa',
            disabled: '#504e93'
        },
    },
    shape: {
        borderRadius: 20
    }
};

const themeDefault = createTheme(themeOptions);

export const Context = createContext<State>({
    store
});

root.render(
  <React.StrictMode>
      <Context.Provider value={{
          store
      }}>
          <BrowserRouter>
              <ThemeProvider theme={themeDefault}>
                  <App />
              </ThemeProvider>
          </BrowserRouter>
      </Context.Provider>
  </React.StrictMode>
);
