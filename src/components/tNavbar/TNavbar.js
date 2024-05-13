import React from "react";
import classes from "./TNavbar.module.css";
import { NavLink } from "react-router-dom";
import profile from "../../assets/Profile.svg";
import home from "../../assets/home.svg";
import Oclass from "../../assets/class.svg";
import setting from "../../assets/setting.svg";
import { useSelector } from "react-redux";

const TNavbar = () => {
  const userId = useSelector((state) => state.userProfile.userId);

  return (
    <section className={classes.navlink}>
      <div className={classes.nav_cont}>
        <NavLink>
          <img alt="profile" src={profile} />
        </NavLink>
      </div>
      <div className={classes.nav_cont_other}>
        <NavLink to={`/teacher/${userId}`}>
          <img alt="home" src={home} />
        </NavLink>
      </div>
      <div className={classes.nav_cont_other}>
        <NavLink to={`class`}>
          <img alt="class" src={Oclass} />
        </NavLink>
      </div>
      <div className={classes.nav_cont_other}>
        <NavLink to={`setting`}>
          <img alt="setting" src={setting} />
        </NavLink>
      </div>
    </section>
  );
};

export default TNavbar;
