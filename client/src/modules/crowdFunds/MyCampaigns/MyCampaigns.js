import React, { useEffect, useState, useContext, useCallback } from "react";
import MaterialTable from "material-table";
import tableIcons from "../Donations/MaterialTableIcons";
import { useNavigate } from "react-router-dom";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import { MTableToolbar } from "material-table";
import { CampaignsContext } from "../../../context/CampaignsContext";
import { getUserCreatedCampaigns } from "../../../api";
import {
  convertBigNumber,
  getRemainingTime,
  getCampaignStatus,
  convertEth,
} from "../../../utils/etherMethods";
const useStyles = makeStyles((theme) => ({
  listContainer: {
    justifyContent: "center",
    alignContent: "center",
    background: theme.background.darkContainer,
  },
  container: {
    padding: "10rem",
  },
}));

const MyDonations = () => {
  const [data, setData] = useState([]);
  const history = useNavigate();
  const classes = useStyles();
  const { getContractBySigner, getContractByProvider, showError } =
    useContext(CampaignsContext);

  function goToDetails(campaignID) {
    return history(`/fund/${campaignID}`);
  }

  async function closeCampaign(campaignId) {
    try {
      let signerContract = getContractBySigner();
      await signerContract.closeCampaign(
        parseInt(convertBigNumber(campaignId))
      );
    } catch (err) {
      console.log(err);
      showError("Closing Project Unsuccessful");
    }
  }

  const fetchMyCampaigns = useCallback(async () => {
    try {
      let { data } = await getUserCreatedCampaigns();
      let myCampaigns = data.result;
      let providerContract = getContractByProvider();
      let tmpList = [];

      if (!myCampaigns || myCampaigns.length <= 0) {
        return;
      }

      for (let i = 0; i < myCampaigns.length; i++) {
        const res = await providerContract.campaigns(parseInt(myCampaigns[i]));
        let { donationGoal, endDate, raisedAmount, active, ownerID } = res;
        let campaignStatus = getCampaignStatus(
          active,
          endDate,
          raisedAmount,
          donationGoal
        );
        let remainingTime = Math.max(getRemainingTime(endDate), 0);
        let goal = convertEth(donationGoal);
        let raised = convertEth(raisedAmount);
        let remainingForGoal = Math.max(goal - raised, 0);
        tmpList[i] = {
          time: remainingTime,
          id: myCampaigns[i],
          owner: ownerID.toLowerCase(),
          status: campaignStatus,
          donation: remainingForGoal,
        };
      }
      setData(tmpList);
    } catch (err) {
      setData([]);
      console.log(err);
      showError("Could not fetch donations");
    }
  }, [showError]);

  useEffect(() => {
    fetchMyCampaigns();
  }, [fetchMyCampaigns]);

  const columns = [
    {
      title: "Owner",
      field: "owner",
      align: "center",
      cellStyle: { width: "30%" },
    },

    {
      title: "Campaign Id",
      field: "id",
      align: "center",
      cellStyle: { width: "15%" },
    },
    {
      title: "Funds Remaining (ETH)",
      field: "donation",
      align: "center",
      cellStyle: { width: "20%" },
    },
    {
      title: "Time Remaining (Days)",
      field: "time",
      align: "center",
      cellStyle: { width: "20%" },
    },
    {
      title: "Status",
      field: "status",
      align: "center",
      cellStyle: { width: "10%" },
    },
    {
      title: "Actions",
      align: "center",
      cellStyle: { width: "20%" },
      render: (rowData) => {
        let enabled = rowData.status == "Goal reached";
        const buttons = (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
            }}
          >
            <Button
              style={{
                backgroundColor: enabled ? "#4ee058" : "c9c9c9",
                color: enabled ? "#f2f2f2" : "#a6a6a6",
                marginRight: "5px",
              }}
              onClick={() => {
                closeCampaign(rowData.id);
              }}
              color="primary"
              variant="contained"
              disabled={!enabled}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                goToDetails(rowData.id);
              }}
              color="primary"
              variant="contained"
            >
              Show
            </Button>
          </div>
        );
        return buttons;
      },
    },
  ];

  return (
    <DonationsTable
      classes={classes}
      columns={columns}
      tableIcons={tableIcons}
      data={data}
    />
  );
};

function DonationsTable({ classes, columns, tableIcons, data }) {
  return (
    <>
      <Paper className={classes.listContainer}>
        <MaterialTable
          className={classes.container}
          columns={columns}
          icons={tableIcons}
          data={data}
          options={{ sorting: true, showTitle: false }}
          components={{
            Toolbar: (props) => (
              <div
                style={{
                  padding: "0px 10px",
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "left",
                }}
              >
                <MTableToolbar {...props} />
                <div
                  style={{
                    padding: "0px 10px",
                    alignItems: "right",
                    marginTop: 20,
                  }}
                ></div>
              </div>
            ),
          }}
        />
      </Paper>
    </>
  );
}
export default MyDonations;
