import { NavLink, NavMenu } from "./NavbarElements";
import { Typography, AppBar, Avatar, Button } from "@material-ui/core";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import decode from "jwt-decode";
import * as actionType from "../../utils/actionTypes";
import useStyles from "./styles";

const NewNavbar = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("profile")));
  const [name, setName] = useState("Undefined");
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const classes = useStyles();

  const logout = () => {
    dispatch({ type: actionType.LOGOUT });
    navigate("/auth");
    setUser(null);
  };

  useEffect(() => {
    const token = user?.token;
    if (token) {
      const decodedToken = decode(token);
      if (decodedToken.exp * 1000 < new Date().getTime()) logout();
    }
    //if (!JSON.parse(localStorage.getItem("profile"))) {
    // logout();
    //}
    let profile = JSON.parse(localStorage.getItem("profile"));
    if (profile) {
      setName(profile.result.name);
      setUser(profile);
    }
  }, [location]);

  return (
    <>
      {user ? (
        <AppBar className={classes.appBar} position="static" color="inherit">
          <div className={classes.userName}>
            <Avatar className={classes.teal}>
              <div style={{ color: "#fff" }}>{name.charAt(0)}</div>
            </Avatar>
            &nbsp; &nbsp;
            <Typography className={classes.userName} variant="h6">
              {name}
            </Typography>
          </div>
          <NavMenu>
            <NavLink to="/" activeStyle>
              <Typography variant="subtitle2">Campaigns</Typography>
            </NavLink>
            <NavLink to="/adopts" activeStyle>
              <Typography variant="subtitle2">Adoptions</Typography>
            </NavLink>
            <NavLink to="/donations" activeStyle>
              <Typography variant="subtitle2">Donations</Typography>
            </NavLink>
            <NavLink to="/my-campaigns" activeStyle>
              <Typography variant="subtitle2">My Campaigns</Typography>
            </NavLink>
          </NavMenu>
          <NavMenu>
            <Button variant="contained" color="secondary" onClick={logout}>
              Logout
            </Button>
          </NavMenu>
        </AppBar>
      ) : (
        <></>
      )}
    </>
  );
};

export default NewNavbar;
