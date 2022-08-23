import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Avatar,
  Button,
  Paper,
  Grid,
  Typography,
  Container,
  CircularProgress,
} from "@material-ui/core";
import { useNavigate } from "react-router-dom";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";

import { signin, signup } from "../../actions/auth";
import useStyles from "./styles";
import Input from "./Input";

const initialState = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const Auth = () => {
  const { loading, errors } = useSelector((state) => state.auth);
  const [form, setForm] = useState(initialState);
  const [isSignup, setIsSignup] = useState(false);
  const [passwordDontMatch, setPasswordDontMatch] = useState(false);
  const [formDataChanged, setFormDataChanged] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const classes = useStyles();
  const [showPassword, setShowPassword] = useState(false);
  const handleShowPassword = () => setShowPassword(!showPassword);

  const switchMode = () => {
    setFormDataChanged(true);
    setPasswordDontMatch(false);
    setIsSignup((prevIsSignup) => !prevIsSignup);
    setShowPassword(false);
  };

  const handleSubmit = (e) => {
    setPasswordDontMatch(false);
    setFormDataChanged(false);
    e.preventDefault();
    if (isSignup) {
      if (form.confirmPassword == form.password) {
        dispatch(signup(form, navigate));
      } else {
        setPasswordDontMatch(true);
      }
    } else {
      dispatch(signin(form, navigate));
    }
  };

  const handleChange = (e) => {
    setFormDataChanged(true);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper className={classes.paper} elevation={3}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          {isSignup ? "Sign up" : "Sign in"}
        </Typography>
        <form className={classes.form} onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {isSignup && (
              <>
                <Input
                  name="firstName"
                  label="First Name"
                  handleChange={handleChange}
                  autoFocus
                  half
                />
                <Input
                  name="lastName"
                  label="Last Name"
                  handleChange={handleChange}
                  half
                />
              </>
            )}
            <Input
              name="email"
              label="Email Address"
              handleChange={handleChange}
              type="email"
            />
            <Input
              name="password"
              label="Password"
              handleChange={handleChange}
              type={showPassword ? "text" : "password"}
              handleShowPassword={handleShowPassword}
            />
            {isSignup && (
              <Input
                name="confirmPassword"
                label="Repeat Password"
                handleChange={handleChange}
                type="password"
              />
            )}
          </Grid>
          <Grid container justify="center">
            {loading ? (
              <CircularProgress style={{ margin: 5 }} />
            ) : (
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
              >
                {isSignup ? "Sign Up" : "Sign In"}
              </Button>
            )}
          </Grid>

          {errors && !formDataChanged && !loading && !passwordDontMatch && (
            <div style={{ color: "red" }}>Some error has happened!</div>
          )}
          {passwordDontMatch && isSignup && !formDataChanged && (
            <div style={{ color: "red" }}>Passwords don't match!</div>
          )}
          <Grid container justify="flex-end">
            <Grid item>
              <Button onClick={switchMode}>
                {isSignup
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Sign Up"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default Auth;
