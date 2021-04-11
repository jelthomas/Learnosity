import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Logo from "../images/LearnLogo.png"

export default class Navbar extends Component {

  render() {
    return (
      <nav className="navbar navbar-light bg-light navbar-expand-lg">
        <Link to="/" className="navbar-brand">
            <img width = {60} src = {Logo} alt =""/>
        </Link>
        <div className="collpase navbar-collapse ">
        <ul className="navbar-nav mr-auto"> 
          <li className="navbar-item">
            <p class="font-weight-normal" style={{padding: '5px',color:'#00db00',fontFamily:"Quando",fontSize:'25px',paddingLeft:'750px',paddingRight:'770px'}} > Learnosity</p>
          </li>
          <li className="navbar-item">
            <Link to="/signup" className="nav-link" style={{padding: '5px',color:'#00db00',fontFamily:"Quando",fontSize:'25px'}}>Sign Up</Link>
          </li>
          <li className="navbar-item">
            <Link to ="/login" className="nav-link"  style={{padding: '5px',color:'#00db00',fontFamily:"Quando",fontSize:'25px'}}  >Log In</Link>
          </li>
        </ul>
        </div>
      </nav>
    );
  }
}