import { makeStyles } from "@material-ui/core/styles";
import Image from "../../images/blockgif.gif";
export default makeStyles((theme) => ({
  appBar: {
    backgroundImage: `url(${Image})`,
    borderRadius: 15,
    margin: "30px 0",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 50px",
    height: "min-height",
  },
  heading: {
    color: "rgba(0,183,255, 1)",
    textDecoration: "none",
  },
  image: {
    marginLeft: "15px",
  },
  toolbar: {
    display: "flex",
    justifyContent: "flex-end",
    width: "800px",
  },
  profile: {
    display: "flex",
    justifyContent: "space-between",
    width: "max-width",
  },
  userName: {
    color: "#fff",
    display: "flex",
    alignItems: "center",
  },
  brandContainer: {
    display: "flex",
    alignItems: "right",
  },
  teal: {
    color: theme.palette.getContrastText("#15cdfc"),
    backgroundColor: "#15cdfc",
  },
}));
