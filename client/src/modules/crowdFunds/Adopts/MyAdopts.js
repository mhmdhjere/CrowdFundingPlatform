import React, { useContext, useState, useEffect, useCallback } from "react";
import { CampaignsContext } from "../../../context/CampaignsContext";
import { ethers } from "ethers";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import FundCard from "../Campaigns/FundCard";
import LinearProgress from "@material-ui/core/LinearProgress";
import { makeStyles } from "@material-ui/core/styles";
import { useSelector } from "react-redux";
import Paper from "@material-ui/core/Paper";
import Image from "../../../images/abstract.jpg";
import { Typography } from "@material-ui/core";
const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1),
    backgroundColor: "#4ee058",
  },
  loadingDiv: {
    width: "50%",
    height: "max-content",
    margin: "10rem auto",
  },
  listContainer: {
    justifyContent: "center",
    background: theme.background.darkContainer,
    padding: "2rem",
  },

  gridContainer: {
    justifyContent: "center",
  },
  inputStyles: {
    width: "100%",
  },
  formContainer: {
    padding: "0.4rem",
  },
}));

const styles = {
  paperContainer: {
    backgroundImage: `url(${Image})`,
  },

  buttonContainer: {
    textAlign: "center",
  },
  NoFunds: {
    letterSpacing: "0.12rem",
    textAlign: "center",
    color: "#fff",
  },
};

function MyAdopts() {
  const classes = useStyles();
  const { currentAccount, getContractByProvider, showError, connectWallet } =
    useContext(CampaignsContext);
  const [fundProjectList, setFundProjectList] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFundProjects = useCallback(async () => {
    let providerContract = getContractByProvider();
    try {
      setLoading(true);

      let projectCount = ethers.BigNumber.from(
        await providerContract.projectCount()
      ).toNumber();

      const projectLists = [];

      const user = JSON.parse(localStorage.getItem("profile"));
      const adoptList = user.result.adopts;
      for (let i = 0; i < projectCount; i++) {
        let {
          campaignID,
          campaignName,
          description,
          donationGoal,
          endDate,
          ownerID,
          raisedAmount,
          active,
        } = await providerContract.campaigns(i);
        if (adoptList.includes(String(campaignID))) {
          projectLists.push({
            campaignID,
            campaignName,
            description,
            donationGoal,
            endDate,
            ownerID,
            raisedAmount,
            active,
          });
        }
      }

      setFundProjectList(projectLists);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setFundProjectList([]);
      showError("Error while fetching Fund Projects");
    }
  }, [showError]);

  useEffect(() => {
    if (!currentAccount) return;
    fetchFundProjects();
  }, [currentAccount, fetchFundProjects]);

  return (
    <>
      <Paper
        elevation={1}
        className={classes.listContainer}
        style={styles.paperContainer}
      >
        {currentAccount ? (
          <>
            {loading ? (
              <Box className={classes.loadingDiv}>
                {" "}
                <LinearProgress color="secondary" />
              </Box>
            ) : fundProjectList && fundProjectList.length ? (
              <Grid container className={classes.gridContainer}>
                {fundProjectList.map((item, index) => (
                  <Grid item key={index} lg={8} xs={8}>
                    <FundCard
                      item={item}
                      index={index}
                      listProjects={fetchFundProjects}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="h5" style={styles.NoFunds}>
                NO ADOPTIONS YET
              </Typography>
            )}
          </>
        ) : (
          <div style={styles.buttonContainer}>
            <Button
              className={classes.button}
              onClick={connectWallet}
              color="success"
              variant="contained"
            >
              Please connect to meta mask
            </Button>
          </div>
        )}
      </Paper>
    </>
  );
}

export default MyAdopts;
