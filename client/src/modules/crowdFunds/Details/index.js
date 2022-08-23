import React from "react";
import { useParams } from "react-router-dom";
import Details from "./Details";

function Index() {
  const { id } = useParams();
  return <Details id={id} />;
}

export default Index;
