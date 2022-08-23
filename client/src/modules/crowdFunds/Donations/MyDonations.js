import React, { useEffect, useState, useContext, useCallback } from "react";
import MaterialTable from "material-table";
import tableIcons from "./MaterialTableIcons";
import { useDispatch, useSelector } from "react-redux";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import { Chip } from "@material-ui/core";
import { MTableToolbar } from "material-table";
import { CampaignsContext } from "../../../context/CampaignsContext";
import {
  convertBigNumber,
  convertToWei,
  getCampaignStatus,
} from "../../../utils/etherMethods";
import { pullDonationFromCampaign } from "../../../actions/auth";
import { ethers } from "ethers";
import * as api from "../../../api";

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
  const dispatch = useDispatch();
  const [data, setData] = useState([]);
  const [data2, setData2] = useState([]);
  const classes = useStyles();
  const {
    currentAccount,
    getContractBySigner,
    getContractByProvider,
    showError,
  } = useContext(CampaignsContext);

  async function pullDonation(campaignID, key, donationValue) {
    try {
      if (key != currentAccount) {
        return showError("Please choose the right account!");
      }
      let signerContract = getContractBySigner();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      let res = await signerContract.pullDonation(
        parseInt(convertBigNumber(campaignID)),
        convertToWei(donationValue)
      );

      const tx = await res.wait();
      let pullData = {
        from: tx.from.toLowerCase(),
        campaignId: campaignID,
      };
      dispatch(pullDonationFromCampaign(pullData));
    } catch (err) {
      console.log(err);
      showError("Pulling Donation Unsuccessful");
    }
  }

  const columns = (withAccounts) => {
    let accounts = withAccounts
      ? [
          {
            title: "Account",
            field: "account",
            align: "center",
            cellStyle: { width: "30%" },
          },
        ]
      : [];
    let actions = withAccounts
      ? [
          {
            title: "Actions",
            align: "center",
            cellStyle: { width: "20%" },
            render: (rowData) => {
              let disabled =
                rowData.status == "Goal reached" || rowData.status == "Closed";
              const button = (
                <Button
                  style={{
                    backgroundColor: disabled ? "c9c9c9" : "#4ee058",
                    color: disabled ? "#a6a6a6" : "#f2f2f2",
                  }}
                  onClick={() => {
                    withAccounts
                      ? pullDonation(
                          rowData.id,
                          rowData.account,
                          rowData.donation.toString()
                        )
                      : showError("Bro please");
                  }}
                  color="success"
                  variant="contained"
                  disabled={disabled}
                >
                  Pull donation
                </Button>
              );
              return button;
            },
          },
        ]
      : [];
    return accounts
      .concat([
        {
          title: "Campaign Id",
          field: "id",
          align: "center",
          cellStyle: { width: "15%" },
        },
        {
          title: "Contribution (ETH)",
          field: "donation",
          align: "center",
          cellStyle: { width: "15%" },
        },
        {
          title: "Status",
          field: "status",
          align: "center",
          cellStyle: { width: "20%" },
        },
      ])
      .concat(actions);
  };

  const fetchDonations = useCallback(async () => {
    try {
      let tmpList = [];
      const tmpList2 = [];
      let providerContract = getContractByProvider();
      let i = 0;
      const { data } = await api.getUserDonations();
      const donationsMap = new Map();
      data.result.forEach((object) => {
        donationsMap.set(object._id, object);
      });
      donationsMap.forEach((value, k) => {
        const { id, account, contribution } = value;
        tmpList[i] = {
          id: id,
          account: account,
          donation: contribution,
        };
        i++;
      });

      for (let i = 0; i < tmpList.length; i++) {
        const res = await providerContract.campaigns(parseInt(tmpList[i].id));
        let { donationGoal, endDate, raisedAmount, active } = res;
        let campaignStatus = getCampaignStatus(
          active,
          endDate,
          raisedAmount,
          donationGoal
        );
        tmpList[i].status = campaignStatus;
      }
      tmpList.forEach((row) => {
        const obj = tmpList2.find((o) => o.id === row.id);
        if (obj) {
          obj.donation = obj.donation + row.donation;
        } else {
          tmpList2.push({
            status: row.status,
            donation: row.donation,
            id: row.id,
          });
        }
      });
      setData(tmpList);
      setData2(tmpList2);
    } catch (err) {
      setData([]);
      setData2([]);
      console.log(err);
      showError("Could not fetch donations");
    }
  }, [showError]);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  return (
    <DonationsTable
      classes={classes}
      columns={columns}
      tableIcons={tableIcons}
      data={data}
      data2={data2}
    />
  );
};

function DonationsTable(props) {
  const { classes, columns, tableIcons, data, data2 } = props;
  const [withAccounts, setWithAccounts] = useState(true);
  return (
    <>
      <Paper className={classes.listContainer}>
        <MaterialTable
          className={classes.container}
          columns={columns(withAccounts)}
          icons={tableIcons}
          data={withAccounts ? data : data2}
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
                >
                  <Chip
                    clickable
                    label="By Campaign ID"
                    style={{ marginRight: 5 }}
                    onClick={() => {
                      setWithAccounts((withAccounts) => !withAccounts);
                    }}
                  />
                </div>
              </div>
            ),
          }}
        />
      </Paper>
      <div>Hello</div>
    </>
  );
}
export default MyDonations;
