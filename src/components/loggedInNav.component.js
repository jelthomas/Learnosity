import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Logo from "../images/LearnLogo.png"
import jwt from 'jsonwebtoken';
import jwt_decode from 'jwt-decode';
//import {api} from "../axios_api.js";
import Dropdown from "react-bootstrap/Dropdown"
import Penguin from "../images/Penguin.jpg"



export default class LoggedInNav extends Component {
  constructor(props){
    super(props);

    this.logOut = this.logOut.bind(this);

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

      <nav class="navbar navbar-light bg-light navbar-expand-lg" style={{height: "65px"}}>
    <div class="navbar-collapse w-100 order-1 order-md-0 dual-collapse2">
        
            <Link to="/" className="navbar-brand">
                <img width = {60} src = {Logo} alt =""/>
            </Link>
            <p class="font-weight-normal navbarDropdown" style={{padding: '5px',color:'#00db00',fontFamily:"Quando",fontSize:'25px', marginTop: '0px', marginBottom: '0px'}} > Learnosity</p>
        
    </div>
    <div class="mx-auto order-0">
      {/* <p class="font-weight-normal" style={{padding: '5px',color:'#00db00',fontFamily:"Quando",fontSize:'25px'}} > Learnosity</p> */}
    </div>
    <div class="navbar-collapse  w-100 order-3 dual-collapse2">
        <ul class="navbar-nav ml-auto">
          <div style={{display:'flex'}}>
            <li className="navbar-item">
              <Link to="/dashboard" className="nav-link navbarDropdown" style={{padding: '5px',color:'#00db00',fontFamily:"Quando",fontSize:'25px'}}>Create Platform</Link>
            </li>
            <li className="navbar-item">
              <Link to ="/dashboard" className="nav-link navbarDropdown"  style={{padding: '5px',color:'#00db00',fontFamily:"Quando",fontSize:'25px'}}  >Leaderboard</Link>
            </li>
            <li className="navbar-item">
              <Link to ="/dashboard" className="nav-link navbarDropdown"  style={{padding: '5px',color:'#00db00',fontFamily:"Quando",fontSize:'25px'}}  >My Platforms</Link>
            </li>
          </div>
            <Dropdown style={{marginTop:'.7%'}}>
              <Dropdown.Toggle className="navbarDropdown" variant="success" id="dropdown-basic" style= {{backgroundColor: "#FFFFFF", borderColor: "#000000", borderRadius: "50px", color: "#00DB00", fontSize: '18px'}}>
                        {this.state.loggedInUser}
                        <img className="thumbnail-image" 
                            src={Penguin} 
                            width = {30}
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