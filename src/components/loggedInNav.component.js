import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Logo from "../images/LearnLogo.png"
import jwt from 'jsonwebtoken';
import jwt_decode from 'jwt-decode';
import Dropdown from "react-bootstrap/Dropdown"
import { api } from '../axios_api';
import UserIcon from "../images/userIcon.png"
require('dotenv').config();


export default class LoggedInNav extends Component {
  constructor(props){
    super(props);

    this.logOut = this.logOut.bind(this);
    this.createPlatform = this.createPlatform.bind(this);

    this.state = {
        loggedInUser: '',
        profile_picture: ''
    }
  }

  createPlatform()
  {
      // console.log("CREATE PLATFORM CLICKED")

      // const createPlatFormat = {
      //     plat_name : "Untitled",
      //     owner : this.state.loggedInUser,
      //     is_public : true,
      //     privacy_password :"",
      //     cover_photo :"",
      //     pages : [],
      //     is_published : false
      // }

      // api.post("/platformFormat/add",createPlatFormat)
      // .then(response => {

      //   var platID = response.data._id

      //   console.log(response.data._id)

      //   this.props.props.history.push('/editPlatform/'+platID)
      // })
      // .catch(error => {
      //     console.log(error.response)
      // });
      


      // this.props.props.history.push('/editPlatform/')
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
        jwt.verify(token, process.env.REACT_APP_SECRET, function(err,res) {
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
        var profile_pic;
        api.get('/user/getSpecificUser/'+decoded._id)
          .then(response => {
            profile_pic = response.data.profile_picture;
            this.setState({loggedInUser:decoded.username, profile_picture: profile_pic})
          })
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
        
            <Link to="/dashboard" className="navbar-brand">
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
              <Link onClick={this.createPlatform} className="nav-link navbarDropdown" style={{padding: '5px',color:'#00db00',fontFamily:"Quando",fontSize:'25px', paddingRight: "55px"}}>Create Platform</Link>
            </li>
            <li className="navbar-item">
              <Link to ="/dashboard" className="nav-link navbarDropdown"  style={{padding: '5px',color:'#00db00',fontFamily:"Quando",fontSize:'25px', paddingRight: "55px"}}  >Leaderboard</Link>
            </li>
            <li className="navbar-item">
              <Link to ="/dashboard" className="nav-link navbarDropdown"  style={{padding: '5px',color:'#00db00',fontFamily:"Quando",fontSize:'25px', paddingRight: "55px"}}  >My Platforms</Link>
            </li>
          </div>
            <Dropdown style={{marginTop:'.7%'}}>
              <Dropdown.Toggle className="navbarDropdown" variant="success" id="dropdown-basic" style= {{backgroundColor: "#FFFFFF", borderColor: "#000000", borderRadius: "50px", color: "#00DB00", fontSize: '18px'}}>
                        {this.state.loggedInUser}
                        <img className="thumbnail-image" 
                            src={this.state.profile_picture === "" ? UserIcon : this.state.profile_picture} 
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