import React, { useState, useEffect, useContext, useCallback } from "react";
import { CampaignsContext } from "../../../context/CampaignsContext";
import { useDispatch } from "react-redux";
import {
  convertEth,
  convertBigNumber,
  unixToLocaleDate,
  getCampaignStatus,
} from "../../../utils/etherMethods";
import { Avatar, CircularProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import grey from "@material-ui/core/colors/grey";
import Typography from "@material-ui/core/Typography";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Divider from "@material-ui/core/Divider";
import ListItemText from "@material-ui/core/ListItemText";
import Button from "@material-ui/core/Button";
import {
  pullDonationFromExternal,
  pullAllCampaignDonations,
} from "../../../actions/auth";
import { getCampaignAdopters } from "../../../api";

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1),
  },
  paperCard: {
    width: "100%",
    padding: "0.7rem",
  },
  projectContainer: {
    padding: "0.5rem",
  },

  usersInfoContainer: {
    display: "block",
    alignContent: "center",
    padding: "0.5rem",
  },

  kinderBueno: {
    justifyContent: "space-between",
    display: "flex",
  },

  donationVal: {
    display: "flex",
    flexDirection: "row",
  },
  infoContainer: {
    margin: "0 0.4rem 0 0.4rem",
  },
  projectHeaders: {
    fontSize: "1.4rem",
    fontWeight: "600",
    color: grey[600],
    opacity: 0.9,
    marginBottom: "0.5rem",
  },
  list: {
    backgroundColor: theme.palette.background.paper,
  },
  inline: {
    display: "inline",
  },
}));
function Details(props) {
  const dispatch = useDispatch();
  const { id } = props;
  const classes = useStyles();
  const { getContractByProvider, showError, getContractBySigner } =
    useContext(CampaignsContext);
  const [projectInfo, setProjectInfo] = useState(null);
  const [contributionInfo, setContributionsInfo] = useState(null);
  const [adopters, setAdopters] = useState([]);
  const [refunding, setRefunding] = useState(false);
  const [refunded, setRefunded] = useState(false);

  const getAdopters = useCallback(async () => {
    if (!id) return;
    try {
      // const adoptersList = await axios.get("/campaign/" + id + "/getAdopters");
      const adoptersList = await getCampaignAdopters(id);
      setAdopters(adoptersList.data);
    } catch (err) {
      console.log(err);
    }
  }, [id]);

  const getContributions = useCallback(async () => {
    if (!id) return;
    let providerContract = getContractByProvider();
    try {
      let totalContributors = await providerContract.getNumberOfDonaters(
        parseInt(id)
      );
      totalContributors = parseInt(convertBigNumber(totalContributors));

      const contributorAddresses = [];
      for (let i = 0; i < totalContributors; i++) {
        let address = await providerContract.getDonatorAddress(id, i);
        if (!contributorAddresses.includes(address)) {
          contributorAddresses.push(address);
        }
      }
      const contributionInfos = await Promise.all(
        contributorAddresses.map(async (item) => {
          let contributedAmount = convertEth(
            await providerContract.getDonatorDonation(id, item)
          );
          return { amount: contributedAmount, address: item };
        })
      );
      setContributionsInfo(contributionInfos);
    } catch (err) {
      console.log(err);
      showError("Error while loading contributions");
    }
  }, [id, showError]);
  const fetchDetails = useCallback(async () => {
    if (!id) return;
    let providerContract = getContractByProvider();
    try {
      const res = await providerContract.campaigns(id);
      let {
        campaignName,
        description,
        donationGoal,
        endDate,
        ownerID,
        raisedAmount,
        active,
      } = res;
      donationGoal = convertEth(donationGoal);
      endDate = Number(convertBigNumber(endDate));
      raisedAmount = convertEth(raisedAmount);
      const campaignStatus = getCampaignStatus(
        res.active,
        res.endDate,
        res.raisedAmount,
        res.donationGoal
      );

      setProjectInfo({
        campaignName,
        description,
        donationGoal,
        endDate,
        ownerID,
        raisedAmount,
        active,
        campaignStatus,
      });
    } catch (err) {
      console.log(err);
      showError("Error while loading project info");
    }
  }, [id, showError]);
  const pullAllDonations = useCallback(async () => {
    try {
      setRefunding(true);
      let signerContract = getContractBySigner();
      let res = await signerContract.pullAllCampaignDonations(id);
      await res.wait();
      setRefunded(true);
      setRefunding(false);
      dispatch(pullAllCampaignDonations({ campaignId: id }));
    } catch (err) {
      setRefunding(false);
      console.log(err);
      showError("Pulling Donation Unsuccessful");
    }
  }, [id, showError]);

  const pullSingleDonation = useCallback(
    async (address) => {
      try {
        let signerContract = getContractBySigner();
        let res = await signerContract.pullDonationExternal(id, address);
        const tx = await res.wait();
        let pullData = {
          from: address.toLowerCase(),
          campaignId: id,
        };
        dispatch(pullDonationFromExternal(pullData));
      } catch (err) {
        console.log(err);
        showError("Pulling Donation Unsuccessful");
      }
    },
    [id, showError]
  );

  useEffect(() => {
    getAdopters();
  }, [id, getAdopters]);

  useEffect(() => {
    getContributions();
  }, [id, getContributions]);

  useEffect(() => {
    fetchDetails();
  }, [id, fetchDetails]);

  return (
    <Box>
      <Paper
        elevation={3}
        className={classes.paperCard}
        children={
          <DetailContainer
            projectInfo={projectInfo}
            contributionInfo={contributionInfo}
            classes={classes}
            adopters={adopters}
            pullDonationsCallback={pullAllDonations}
            pullSingleDonationCallback={pullSingleDonation}
            refunding={refunding}
            refunded={refunded}
          />
        }
      />
    </Box>
  );
}

function DetailContainer(props) {
  const {
    contributionInfo,
    projectInfo,
    classes,
    adopters,
    pullDonationsCallback,
    pullSingleDonationCallback,
    refunding,
    refunded,
  } = props;
  let disabled = projectInfo
    ? projectInfo.campaignStatus == "Goal reached" ||
      projectInfo.campaignStatus == "Closed" ||
      projectInfo.campaignStatus == "Active"
    : "";
  let donationsExist = contributionInfo && contributionInfo.length;
  return (
    <Box className={classes.container}>
      <Grid container>
        <Grid item xs={12} className={classes.projectContainer}>
          <Typography vairant="overline" className={classes.projectHeaders}>
            Campaign Information
          </Typography>

          <Grid item style={{ display: "flex" }}>
            <Box style={{ flex: 2 }} className={classes.infoContainer}>
              <Typography variant="overline" color="textSecondary">
                Name
              </Typography>
              <Typography variant="subtitle1" component="h2" color="primary">
                {projectInfo && projectInfo.campaignName
                  ? projectInfo.campaignName
                  : ""}
              </Typography>
            </Box>
            <Box style={{ flex: 2 }} className={classes.infoContainer}>
              <Typography variant="overline" color="textSecondary">
                Total Funded
              </Typography>
              <Typography variant="subtitle1" component="h2">
                {projectInfo && projectInfo.raisedAmount
                  ? projectInfo.raisedAmount
                  : ""}{" "}
                ETH
              </Typography>
            </Box>
            <Box style={{ flex: 2 }} className={classes.infoContainer}>
              <Typography variant="overline" color="textSecondary">
                Target Fund
              </Typography>
              <Typography variant="subtitle1" component="h2">
                {projectInfo && projectInfo.donationGoal
                  ? projectInfo.donationGoal
                  : ""}{" "}
                ETH
              </Typography>
            </Box>
            <Box style={{ flex: 3 }} className={classes.infoContainer}>
              <Typography variant="overline" color="textSecondary">
                Expiry Date
              </Typography>
              <Typography variant="subtitle1" component="h2">
                {projectInfo && projectInfo.endDate
                  ? unixToLocaleDate(projectInfo.endDate)
                  : ""}
              </Typography>
            </Box>
            <Box style={{ flex: 2 }} className={classes.infoContainer}>
              <Typography variant="overline" color="textSecondary">
                Status
              </Typography>
              <Typography variant="subtitle1" component="h2">
                {projectInfo ? projectInfo.campaignStatus : ""}
              </Typography>
            </Box>
            <Box style={{ flex: 3 }}>
              {!donationsExist ? (
                <></>
              ) : !disabled && !refunding && !refunded ? (
                <>
                  <Button
                    style={{
                      backgroundColor: "#4ee058",
                      color: "#f2f2f2",
                      display: "block",
                      textAlign: "left",
                    }}
                    onClick={() => {
                      pullDonationsCallback();
                    }}
                    color="success"
                    variant="contained"
                  >
                    <Typography>Refund all</Typography>
                    <Typography>donations</Typography>
                  </Button>
                </>
              ) : !disabled && refunding && !refunded ? (
                <>
                  <CircularProgress style={{ color: "#4ee058" }} />
                </>
              ) : !disabled && !refunding && refunded ? (
                <div
                  style={{
                    color: "#4ee058",
                  }}
                >
                  <Typography variant="overline">SUCESSFULLY </Typography>
                  <br />
                  <Typography variant="overline">REFUNDED</Typography>
                </div>
              ) : (
                <></>
              )}
            </Box>
          </Grid>
        </Grid>
        <Divider style={{ width: "90%", marginLeft: "0.4rem" }} />
        <Grid item lg={8} className={classes.kinderBueno}>
          <Grid item lg={8} className={classes.usersInfoContainer}>
            <Box>
              <Typography vairant="overline" className={classes.projectHeaders}>
                Contributions
              </Typography>{" "}
              {contributionInfo && contributionInfo.length ? (
                contributionInfo.map((item, index) => (
                  <List className={classes.list} key={index}>
                    <>
                      <ListItem alignItems="flex-start">
                        <ListItemText
                          primary={
                            <div className={classes.donationVal}>
                              <Typography>{item.amount} ETH</Typography>
                              {!disabled && (
                                <Button
                                  style={{
                                    backgroundColor: "#4ee058",
                                    color: "#f2f2f2",
                                    padding: 0,
                                    margin: "5px",
                                  }}
                                  onClick={() => {
                                    pullSingleDonationCallback(item.address);
                                  }}
                                  color="success"
                                  variant="contained"
                                >
                                  <Typography style={{ fontSize: 12 }}>
                                    Refund
                                  </Typography>
                                </Button>
                              )}
                            </div>
                          }
                          secondary={
                            <React.Fragment>
                              <Typography
                                component="span"
                                variant="body2"
                                className={classes.inline}
                                color="textPrimary"
                              >
                                Donated By: {item.address}
                              </Typography>
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                      <Divider component="li" />
                    </>
                  </List>
                ))
              ) : (
                <List className={classes.list}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary=" No Contributions Yet !!!
                  "
                    />
                  </ListItem>
                </List>
              )}
            </Box>
          </Grid>
          <Grid item className={classes.usersInfoContainer}>
            <Box>
              <Typography className={classes.projectHeaders}>
                Adopters
              </Typography>
              {adopters && adopters.length ? (
                adopters.map((item, index) => (
                  <ListItem alignContent="center" key={index}>
                    <Avatar className={classes.purple}>
                      {item.name.charAt(0)}
                    </Avatar>
                    &nbsp;
                    <Typography className={classes.userName} variant="h6">
                      {item.name}
                    </Typography>
                  </ListItem>
                ))
              ) : (
                <List className={classes.list}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary=" No Adopters Yet !!!
                              "
                    />
                  </ListItem>
                </List>
              )}
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Details;
