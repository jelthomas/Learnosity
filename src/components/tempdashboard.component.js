import React, { Component } from 'react';
import {api} from "../axios_api.js";
import jwt from 'jsonwebtoken';
import jwt_decode from 'jwt-decode'
import "../format.css";
// import Card from "react-bootstrap/Card"
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faStar, faPlay, faAngleRight, faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import LoggedInNav from "./loggedInNav.component";
import DefaultCoverPhoto from "../images/defaultCoverPhoto.png"
require('dotenv').config();


export default class TempDashboard extends Component {
    constructor(props){
        super(props);

        this.state = {
            username: "",
            id: ""
        }

    }
    
    
    componentDidMount() {
        var token = localStorage.getItem('usertoken');
        var validToken = false;
        if(token){
            //Token in session storage
            jwt.verify(token, process.env.REACT_APP_SECRET, function(err,res) {
                if(err){
                    //Improper JWT format 
                    //Remove token and redirect back to home
                    localStorage.removeItem('usertoken');
                    this.props.history.push(`/`);
                }
                else{
                    //Properly formatted JWT
                    validToken = true;
                }});
        }
        if(validToken){
            //Check if ID is in token and ID exists as a user
            const decoded = jwt_decode(token);
            if (decoded._id){
                //ID exists in token
                //Check if ID exists as a user
                api.get('/user/getSpecificUser/'+ decoded._id)
                .then(response => {
                    if (response) {
                        //Valid user
                        this.setState({username: response.data.username, id: decoded._id });
                        
                    }
                    else{
                        //Fake ID...
                        localStorage.removeItem('usertoken');
                        this.props.history.push(`/`);
                    }
                })
                .catch(err => {
                    //Fake ID...
                    localStorage.removeItem('usertoken');
                    this.props.history.push(`/`);
                });
            }
        }  
        else{
            //Not a Valid Token
            localStorage.removeItem('usertoken');
            this.props.history.push(`/`);
        }

    }
    render() {
        
        return (
            <div>
                <LoggedInNav props={this.props}/>
                <div style={{display:"flex", marginLeft: "5%", marginRight: "5%", paddingTop: "15px"}}>
                    <div id="dash">Dashboard</div>
                    <div id="greeting">Welcome {this.state.username}!</div>
                </div>
            </div>
        )
    }
}