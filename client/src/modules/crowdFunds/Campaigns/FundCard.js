import React, { useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useDispatch, useSelector } from "react-redux";
import { ethers } from "ethers";
import { adoptCampaign, donateToCampaign } from "../../../actions/auth";
import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { red, green } from "@material-ui/core/colors";
import { CampaignsContext } from "../../../context/CampaignsContext";
import SendIcon from "@material-ui/icons/Send";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import CircularProgress from "@material-ui/core/CircularProgress";
import Box from "@material-ui/core/Box";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Fade from "@material-ui/core/Fade";
import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import Chip from "@material-ui/core/Chip";
import {
  convertEth,
  getRemainingTime,
  convertBigNumber,
  convertToWei,
  getCampaignStatus,
} from "../../../utils/etherMethods";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

// STYLES START
const useStyles = makeStyles((theme) => ({
  container: {
    margin: "0.3rem",
    padding: "1rem",
    width: "100%",
    background: theme.background.default,
  },
  gridContainer: {
    // alignItems: 'center',
  },
  topItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "1rem",
  },
  details: {
    height: "100%",
  },
  ether: {
    margin: "0 0 0 auto",
  },
  donate: {
    display: "flex",
    justifyContent: "end",
  },
  title: {
    color: "#009e74",
    fontWeight: "600",
    letterSpacing: "0.12rem",
  },
  funded: {
    color: "#009e74",
    fontWeight: "500",
    marginRight: "1rem",
  },

  target: {
    color: theme.palette.text.darkHighlight,
    marginRight: "1rem",
  },

  remainingDays: {
    color: "#009e74",
    fontWeight: "600",
    margin: "0.2rem 0rem",
  },

  timeFinished: {
    color: "#d11212",
    fontWeight: "600",
    margin: "0.2rem 0rem",
  },
  description: {
    color: theme.palette.text.darkHighlight,
    fontWeight: "600",
    letterSpacing: "0.12rem",
  },
  progress: {
    minHeight: "100%",
    display: "flex",
    flexDirection: "column",
    padding: "0.4rem",
    alignItems: "start",
    justifyContent: "center",
  },
  expand: {
    transform: "rotate(0deg)",
    marginLeft: "auto",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: "rotate(180deg)",
  },
  fundOpenAvatar: {
    background: green[500],
  },
  fundClosedAvatar: {
    background: red[500],
  },
}));
// STYLES END

// CircularProgressWithLabel START

function CircularProgressWithLabel(props) {
  return (
    <Box position="relative" display="inline-flex">
      <CircularProgress variant="determinate" {...props} />
      <Box
        top={0}
        left={0}
        bottom={0}
        right={0}
        position="absolute"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography
          variant="caption"
          component="div"
          color="textSecondary"
        >{` ${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}

CircularProgressWithLabel.propTypes = {
  value: PropTypes.number.isRequired,
};

function Fund(props) {
  const { currentAccount, getContractBySigner, showError } =
    useContext(CampaignsContext);
  const dispatch = useDispatch();
  const { item, listProjects } = props;
  const history = useNavigate();
  const [adopted, setAdopted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [eth, setEth] = useState(0);
  const [error, setError] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const campaignStatus = item
    ? getCampaignStatus(
        item.active,
        item.endDate,
        item.raisedAmount,
        item.donationGoal
      )
    : "Undef";
  const handleClose = () => {
    setAnchorEl(null);
  };

  const classes = useStyles();

  function setProgressPercentage() {
    if (!item) return;
    const { donationGoal, raisedAmount } = item;
    const percentage = Math.min(
      Math.floor((convertEth(raisedAmount) / convertEth(donationGoal)) * 100),
      100
    );
    setProgress(percentage);
  }
  async function sendEther() {
    if (eth <= 0) {
      setError(true);
      setTimeout(() => {
        setError(false);
      }, 500);
      return;
    }
    let ethValue = eth.toString();
    let value = convertToWei(ethValue);
    let campaignID = parseInt(convertBigNumber(item.campaignID));
    try {
      let signerContract = getContractBySigner();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      let res = await signerContract.Donate(campaignID, {
        value,
      });
      const tx = await res.wait();
      let donationData = {
        ethValue: ethValue,
        from: tx.from,
        campaignId: campaignID,
      };
      dispatch(donateToCampaign(donationData));
      return listProjects();
    } catch (err) {
      console.log(err);
      showError("Error while funding Project");
    }
  }

  async function closeProject() {
    handleClose();
    try {
      let signerContract = getContractBySigner();
      await signerContract.closeCampaign(
        parseInt(convertBigNumber(item.campaignID))
      );
      return listProjects();
    } catch (err) {
      console.log(err);
      showError("Closing Project Unsuccessful");
    }
  }

  async function pullDonation() {
    handleClose();
    try {
      let signerContract = getContractBySigner();
      await signerContract.pullDonation(
        parseInt(convertBigNumber(item.campaignID))
      );
      return listProjects();
    } catch (err) {
      console.log(err);
      showError("Pulling Donation Unsuccessful");
    }
  }
  const handleAdopt = async () => {
    const projectId = parseInt(convertBigNumber(item.campaignID));
    dispatch(adoptCampaign(projectId));
    setAdopted((prev) => !prev);
  };

  const getStatusColor = () => {
    switch (campaignStatus) {
      case "Active":
        return "#009e74";
      case "Neglected":
        return "#e02323";
      case "Closed":
        return "#f50057";
      case "Goal reached":
        return "teal";
      case "Goal not reached":
        return "#b7a437";
    }
  };
  function goToDetails() {
    return history(`/fund/${item.campaignID}`);
  }

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("profile"));
    setAdopted(user.result.adopts.includes(String(item.campaignID)));
    setProgressPercentage();
  }, [item]);

  useEffect(setProgressPercentage, [item]);
  return (
    <Paper elevation={5} className={classes.container}>
      <Grid container className={classes.gridContainer} spacing={3}>
        <Grid item lg={3}>
          <Grid item xs={12} className={classes.topItem}>
            <Chip
              avatar={
                <Avatar aria-label="status" style={{ backgroundColor: "grey" }}>
                  {campaignStatus.charAt(0)}
                </Avatar>
              }
              style={{ backgroundColor: getStatusColor() }}
              label={campaignStatus}
              color="primary"
            />
          </Grid>
          <Grid item className={classes.progress}>
            <Box>
              <CircularProgressWithLabel
                variant="determinate"
                color="secondary"
                value={progress}
                size="8rem"
                thickness={2}
              />
            </Box>
          </Grid>
        </Grid>
        <Grid item lg={9} className={classes.details}>
          <Grid item xs={12} className={classes.topItem}>
            <Box>
              <Typography variant="h5" className={classes.title}>
                {item && item.campaignName ? item.campaignName : "N/A"}
              </Typography>
              <Typography variant="body1" className={classes.description}>
                {item && item.description ? item.description : "N/A"}
              </Typography>
            </Box>
            {item.ownerID.toLowerCase() === currentAccount && item.active && (
              <div>
                <IconButton
                  aria-label="more"
                  aria-controls="long-menu"
                  aria-haspopup="true"
                  onClick={handleClick}
                >
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  id="fade-menu"
                  anchorEl={anchorEl}
                  keepMounted
                  open={open}
                  onClose={handleClose}
                  TransitionComponent={Fade}
                >
                  <MenuItem onClick={() => closeProject()}>
                    Close Project{" "}
                  </MenuItem>

                  {/* <MenuItem onClick={() => goToDetails()}>View Contributors</MenuItem> */}
                </Menu>
              </div>
            )}
          </Grid>
          <div className="w-100 d-flex align-items-center ">
            <Typography
              variant="overline"
              component="p"
              className={classes.funded}
            >
              {item && item.raisedAmount
                ? `Funded: ${convertEth(item.raisedAmount)} ETH`
                : "N/A"}
            </Typography>
            <Typography
              variant="overline"
              color="textSecondary"
              component="p"
              className={classes.target}
            >
              {item && item.donationGoal
                ? `Target: ${convertEth(item.donationGoal)} ETH`
                : "N/A"}
            </Typography>
          </div>
          <br />
          <Typography variant="subtitle2">
            {item && getRemainingTime(item.endDate) > 0 ? (
              <div className={classes.remainingDays}>
                {getRemainingTime(item.endDate)} days to go!
              </div>
            ) : item && getRemainingTime(item.endDate) <= 0 ? (
              <div className={classes.timeFinished}>Time has finished!</div>
            ) : (
              "N/A"
            )}{" "}
          </Typography>
          <br />
          <Button
            variant="outlined"
            color="primary"
            onClick={() => goToDetails()}
          >
            Show
          </Button>
          &nbsp;
          <Button
            variant="outlined"
            color="primary"
            onClick={() => handleAdopt()}
          >
            {adopted ? "Unadopt" : "Adopt"}
          </Button>
        </Grid>
        <Grid item xs={12} lg={12} className={classes.donate}>
          {item && item.active ? (
            <Box className={classes.ether}>
              <FormControl>
                <InputLabel htmlFor="my-input">ETH</InputLabel>
                <Input
                  id="my-input"
                  aria-describedby="my-helper-text"
                  type="number"
                  value={eth ? eth : ""}
                  min={0}
                  onChange={(e) => setEth(e.target.value)}
                  error={error}
                />
                <FormHelperText id="my-input-helper-text" error={error}>
                  {!error ? "Enter ETH to fund." : "Incorrect Value Sent."}
                </FormHelperText>
              </FormControl>

              <IconButton
                aria-label="add to favorites"
                onClick={() => sendEther()}
              >
                <SendIcon />
              </IconButton>
            </Box>
          ) : (
            <Box className={classes.ether}>
              <FormControl>
                <InputLabel htmlFor="my-input">ETH</InputLabel>
                <Input
                  id="my-input"
                  aria-describedby="my-helper-text"
                  type="number"
                  disabled
                />
                <FormHelperText id="my-input-helper-text" error={error}>
                  Project Closed
                </FormHelperText>
              </FormControl>
            </Box>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
}

export default Fund;
