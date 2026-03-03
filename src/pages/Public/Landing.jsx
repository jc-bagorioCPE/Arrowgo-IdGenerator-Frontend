import { useEffect } from "react";
import Home from "../../components/LandingPage/Home";
import About from "../../components/LandingPage/About";
import Values from "../../components/LandingPage/Values";
import FAQ from "../../components/LandingPage/FAQ";
import Footer from "../../components/LandingPage/Footer";
import Steps from "../../components/LandingPage/Steps";

const Landing = () => {

  return (
    <>
      <div id="home"><Home /></div>
      <div id="about"><About /></div>
      <div id="steps"><Steps /></div>
      <div id="values"><Values /></div>
      <div id="faq"><FAQ /></div>
      <div id="footer"><Footer /></div>
    </>
  );
};

export default Landing;
