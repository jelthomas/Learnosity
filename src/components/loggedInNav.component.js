import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Logo from "../images/LearnLogo.png"
import jwt from 'jsonwebtoken';
import jwt_decode from 'jwt-decode';
import {api} from "../axios_api.js";
import Dropdown from "react-bootstrap/Dropdown"
import Penguin from "../images/Penguin.jpg"



export default class LoggedInNav extends Component {
  constructor(props){
    super(props);

    this.signOut = this.logOut.bind(this);

    this.state = {
        loggedInUser: '',
    }
  }

  logOut()
  {
    localStorage.removeItem('usertoken');
    this.props.props.history.push(`/`);
  }

  componentDidMount(){
    var token = localStorage.getItem('usertoken');
    var validToken = false;
    if(token){
        //Token in session storage
        jwt.verify(token, "jwt_key", function(err,res) {
            if(err){
                //Improper JWT format 
                //Remove token and redirect back to home
                localStorage.removeItem('usertoken');
            }
            else{
                //Properly formatted JWT
                validToken = true;
            }});
    }
    if(validToken){
        //Check if ID is in token and ID exists as a user
        const decoded = jwt_decode(token);
        this.setState({loggedInUser:decoded.username})
    }  
    else{
        //Not a Valid Token
        localStorage.removeItem('usertoken');
    }
}


  render() {
    return (

      <nav class="navbar navbar-light bg-light navbar-expand-lg">
    <div class="navbar-collapse w-100 order-1 order-md-0 dual-collapse2">
        <ul class="navbar-nav mr-auto">
            <Link to="/" className="navbar-brand">
                <img width = {60} src = {Logo} alt =""/>
            </Link>
            <p class="font-weight-normal" style={{padding: '5px',color:'#00db00',fontFamily:"Quando",fontSize:'25px'}} > Learnosity</p>
        </ul>
    </div>
    <div class="mx-auto order-0">
      {/* <p class="font-weight-normal" style={{padding: '5px',color:'#00db00',fontFamily:"Quando",fontSize:'25px'}} > Learnosity</p> */}
    </div>
    <div class="navbar-collapse  w-100 order-3 dual-collapse2">
        <ul class="navbar-nav ml-auto">
            <li className="navbar-item">
              <Link to="/signup" className="nav-link" style={{padding: '5px',color:'#00db00',fontFamily:"Quando",fontSize:'25px'}}>Sign Up</Link>
            </li>
            <li className="navbar-item">
              <Link to ="/login" className="nav-link"  style={{padding: '5px',color:'#00db00',fontFamily:"Quando",fontSize:'25px'}}  >Log In</Link>
            </li>
            <Dropdown>
              <Dropdown.Toggle variant="success" id="dropdown-basic">
                        {this.state.loggedInUser}
                        <img className="thumbnail-image" 
                            src={Penguin} 
                            width = {100}
                            alt="user pic"
                        />
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item >Settings</Dropdown.Item>
                <Dropdown.Item onClick ={this.logOut}>Log Out</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            {/* <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                Dropdown
              </a>
              <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                <a class="dropdown-item" href="">Action</a>
                <a class="dropdown-item" href="">Another action</a>
              </div>
            </li> */}
        </ul>
    </div>
</nav>
    );
  }
}