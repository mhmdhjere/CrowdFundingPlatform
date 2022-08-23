import React, { useContext, useState, useEffect, useCallback } from "react";
import { CampaignsContext } from "../../../context/CampaignsContext";
import { ethers } from "ethers";
import { InputAdornment } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Chip from "@material-ui/core/Chip";
import Modal from "../../global/Modal";
import FormControl from "@material-ui/core/FormControl";
import { useDispatch } from "react-redux";
import Input from "@material-ui/core/Input";
import { Search } from "@material-ui/icons";
import { Done } from "@material-ui/icons";
import FundCard from "./FundCard";
import LinearProgress from "@material-ui/core/LinearProgress";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Footer from "../../footer";
import Image from "../../../images/abstract.jpg";
import { TextField, Typography } from "@material-ui/core";
import {
  convertBigNumber,
  getCampaignStatus,
} from "../../../utils/etherMethods";
import { createCampaign } from "../../../actions/auth";
const styles = {
  paperContainer: {
    backgroundImage: `url(${Image})`,
  },

  buttonContainer: {
    textAlign: "center",
  },

  NoFunds: {
    color: "#fff",
    letterSpacing: "0.12rem",
    textAlign: "center",
  },
};

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1),
    backgroundColor: "#4ee058",
  },

  textFieldClass: {
    width: "100%",
  },

  modalButton: {
    margin: theme.spacing(1),
  },
  loadingDiv: {
    width: "50%",
    height: "max-content",
    margin: "10rem auto",
  },
  listContainer: {
    background: theme.background.darkContainer,
    padding: "2rem",
  },
  gridContainer: {
    justifyContent: "center",
    margin: "1rem",
  },
  inputStyles: {
    padding: "0.8rem",
    width: "18rem",
  },
  formContainer: {
    padding: "0.4rem",
  },
}));

function List() {
  const dispatch = useDispatch();
  const [chipsStates, setChipsStates] = useState([
    true,
    true,
    true,
    true,
    true,
  ]);
  const classes = useStyles();
  const {
    currentAccount,
    getContractBySigner,
    getContractByProvider,
    connectWallet,
    showError,
  } = useContext(CampaignsContext);
  const [fundProjectList, setFundProjectList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const getCampaignStatusNum = (campaign) => {
    let status = getCampaignStatus(
      campaign.active,
      campaign.endDate,
      campaign.raisedAmount,
      campaign.donationGoal
    );
    switch (status) {
      case "Neglected":
        return 0;
      case "Active":
        return 1;
      case "Goal reached":
        return 2;
      case "Closed":
        return 3;
      case "Goal not reached":
        return 4;
    }
  };
  const dataFiltered = searchQuery.isEmpty
    ? fundProjectList
    : fundProjectList.filter(
        (d) =>
          d.campaignName.toLowerCase().includes(searchQuery.toLowerCase()) &&
          chipsStates[getCampaignStatusNum(d)]
      );
  const fetchFundProjects = useCallback(async () => {
    try {
      setLoading(true);
      let providerContract = getContractByProvider();
      let projectCount = ethers.BigNumber.from(
        await providerContract.projectCount()
      ).toNumber();

      const projectLists = [];

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
      setFundProjectList(projectLists);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setFundProjectList([]);
      console.log(err);
      showError("Error while fetching Fund Projects");
    }
  }, [showError]);
  const chipStateChange = (chipId) => {
    let newChipsState = [...chipsStates];
    newChipsState[chipId] = !newChipsState[chipId];
    setChipsStates(newChipsState);
  };
  const createProject = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    let name = formData.get("name");
    let desc = formData.get("description");
    let closingDate = formData.get("closingDate");
    closingDate = new Date(closingDate).valueOf();

    let target = formData.get("target");
    target = ethers.BigNumber.from(
      ethers.utils.parseEther(target.toString())
    ).toString();

    try {
      let signerContract = getContractBySigner();
      const res = await signerContract.createCampaign(
        name,
        desc,
        closingDate,
        target
      );
      const tx = await res.wait();
      let retEvent = tx.events.pop();
      let campaignId = convertBigNumber(retEvent.args[0]);
      dispatch(createCampaign(campaignId));
      handleClose();
      await fetchFundProjects();
    } catch (err) {
      setLoading(false);
      console.log(err);
      showError("Error while creating project");
    }
  };

  const [open, setOpen] = useState(false);
  function handleClose() {
    setOpen(!open);
  }

  useEffect(() => {
    if (!currentAccount) return;
    fetchFundProjects();
  }, [currentAccount]);

  return (
    <>
      <Paper
        elevation={1}
        className={classes.listContainer}
        style={styles.paperContainer}
      >
        {currentAccount ? (
          <>
            <Modal
              label="Create Campaign"
              open={open}
              setOpen={setOpen}
              handleClose={handleClose}
            >
              <form id="addNewProject" onSubmit={createProject}>
                <Grid container justify="start" spacing={3}>
                  <Grid item xs={6}>
                    <FormControl className={classes.inputStyles}>
                      <Input
                        id="projectName"
                        type="text"
                        name="name"
                        placeholder="Project Name"
                        required
                      />
                    </FormControl>
                    <FormControl className={classes.inputStyles}>
                      <Input
                        id="projectTarget"
                        type="number"
                        name="target"
                        placeholder="Target Amount (Eth)"
                        maxLength={9}
                        pattern="[+-]?\d+(?:[.,]\d+)?"
                        required
                      />
                    </FormControl>

                    <FormControl className={classes.inputStyles}>
                      <Input
                        id="closingDate"
                        name="closingDate"
                        type="datetime-local"
                        placeholder="Closing Date"
                        required
                      />
                    </FormControl>

                    <FormControl className={classes.inputStyles}>
                      <Input
                        id="projectDesc"
                        type="text"
                        name="description"
                        placeholder="Project Description"
                        required
                      />
                    </FormControl>
                  </Grid>
                </Grid>
                {/* <input className="btn btn-danger m-2" type="reset" value="Reset" /> */}
              </form>
              <Box style={{ textAlign: "center" }}>
                <Button
                  variant="contained"
                  color="secondary"
                  type="reset"
                  size="small"
                  className={classes.modalButton}
                >
                  Reset
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  form="addNewProject"
                  color="primary"
                  className={classes.modalButton}
                  size="small"
                >
                  Add Campaign
                </Button>
              </Box>
            </Modal>

            {loading ? (
              <Box className={classes.loadingDiv}>
                {" "}
                <LinearProgress color="secondary" />
              </Box>
            ) : fundProjectList && fundProjectList.length ? (
              <Grid>
                <Grid container className={classes.gridContainer}>
                  <Grid
                    xs={8}
                    lg={8}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Paper style={{ margin: "0.2rem", width: "100%" }}>
                      <TextField
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Search />
                            </InputAdornment>
                          ),
                        }}
                        className={classes.textFieldClass}
                        variant="outlined"
                        placeholder="Search for campaign"
                        onInput={(e) => {
                          setSearchQuery(e.target.value);
                        }}
                      ></TextField>
                    </Paper>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        padding: "10px",
                      }}
                    >
                      <Chip
                        style={{ marginRight: "5px" }}
                        label="Neglected"
                        onClick={() => {
                          chipStateChange(0);
                        }}
                        icon={chipsStates[0] ? <Done /> : <></>}
                        clickable
                      />
                      <Chip
                        style={{ marginRight: "5px" }}
                        label="Active"
                        onClick={() => {
                          chipStateChange(1);
                        }}
                        clickable
                        icon={chipsStates[1] ? <Done /> : <></>}
                      />
                      <Chip
                        style={{ marginRight: "5px" }}
                        label="Goal achieved"
                        onClick={() => {
                          chipStateChange(2);
                        }}
                        clickable
                        icon={chipsStates[2] ? <Done /> : <></>}
                      />
                      <Chip
                        style={{ marginRight: "5px" }}
                        label="Closed"
                        onClick={() => {
                          chipStateChange(3);
                        }}
                        clickable
                        icon={chipsStates[3] ? <Done /> : <></>}
                      />
                      <Chip
                        label="Goal not achieved"
                        onClick={() => {
                          chipStateChange(4);
                        }}
                        clickable
                        icon={chipsStates[4] ? <Done /> : <></>}
                      />
                    </div>
                  </Grid>
                </Grid>
                {dataFiltered.length > 0 ? (
                  <Grid container className={classes.gridContainer}>
                    {dataFiltered.map((item, index) => (
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
                    NO CAMPAIGNS FOUND
                  </Typography>
                )}
              </Grid>
            ) : (
              <Typography variant="h5" style={styles.NoFunds}>
                NO CAMPAIGNS AVAILABLE YET
              </Typography>
            )}

            <Footer toggleModal={handleClose} />
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

export default List;
