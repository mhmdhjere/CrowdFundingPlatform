import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import { CampaignsProvider } from "./context/CampaignsContext";
import { reducers } from "./reducers";
import App from "./App";
import "./index.css";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import { Container } from "@material-ui/core";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import NewNavbar from "./components/NavBar";

const store = createStore(reducers, compose(applyMiddleware(thunk)));
const theme = createTheme({
  palette: {
    primary: { 500: "#467fcf" },
    text: {
      default: "#FDF8F5",
      light: "#E8CEBF",
      dark: "#DDAF94",
      complementaryGreen: "#266150",
      darkHighlight: "#4F4846",
    },
  },
  background: {
    body: "#DADED4",
    default: "#FDF8F5",
    lightContainer: "#E8CEBF",
    darkContainer: "#DDAF94",
    complementaryGreen: "#266150",
    darkHighlight: "#4F4846",
    transparent: "rgba(255,255,255,0)",
  },
});

ReactDOM.render(
  <CampaignsProvider>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <Container maxWidth="lg">
            <NewNavbar />
            <App />
          </Container>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  </CampaignsProvider>,
  document.getElementById("root")
);
