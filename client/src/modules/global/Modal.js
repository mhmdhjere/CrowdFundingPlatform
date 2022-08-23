import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";

const useStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    // padding: '0.4rem',
  },
  body: {
    marginTop: "0.6rem",
  },
  paper: {
    width: "20rem",
    padding: "0.5rem",
  },
}));

export default function TransitionsModal(props) {
  const { label, open, handleClose } = props;
  const classes = useStyles();

  return (
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      className={classes.modal}
      open={open}
      onClose={handleClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={open}>
        <Paper className={classes.paper}>
          <Box>
            <Typography style={{ textAlign: "center" }} variant="h6">
              {label ? label : "modal"}
            </Typography>
          </Box>
          <Box className={classes.body}>{props.children}</Box>
        </Paper>
      </Fade>
    </Modal>
  );
}
