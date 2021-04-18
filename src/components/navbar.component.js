import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Logo from "../images/LearnLogo.png"

export default class Navbar extends Component {

  render() {
    return (

      <nav class="navbar navbar-light bg-light navbar-expand-lg">
    <div class="navbar-collapse w-100 order-1 order-md-0 dual-collapse2">
        <ul class="navbar-nav mr-auto">
            <Link to="/" className="navbar-brand">
                <img width = {60} src = {Logo} alt =""/>
            </Link>
        </ul>
    </div>
    <div class="mx-auto order-0">
      <p class="font-weight-normal navbarDropdown" style={{padding: '5px',color:'#00db00',fontFamily:"Quando",fontSize:'35px', marginTop: '0px', marginBottom: '0px'}} > Learnosity</p>
    </div>
    <div class="navbar-collapse w-100 order-3 dual-collapse2">
        <ul class="navbar-nav ml-auto">
            <li className="navbar-item">
              <Link to="/signup" className="nav-link navbarDropdown" style={{padding: '5px',color:'#00db00',fontFamily:"Quando",fontSize:'25px'}}>Sign Up</Link>
            </li>
            <li className="navbar-item">
              <Link to ="/login" className="nav-link navbarDropdown"  style={{padding: '5px',color:'#00db00',fontFamily:"Quando",fontSize:'25px'}}  >Log In</Link>
            </li>
        </ul>
    </div>
</nav>
    );
  }
}