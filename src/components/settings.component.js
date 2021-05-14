import React, { Component } from 'react';
import {api} from "../axios_api.js";
import jwt from 'jsonwebtoken';
import jwt_decode from 'jwt-decode'
import "../format.css";
import Card from "react-bootstrap/Card"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faPlay, faAngleRight, faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import LoggedInNav from "./loggedInNav.component";
import DefaultProfilePicture from "../images/userIcon.png"
require('dotenv').config();


export default class Settings extends Component {
    constructor(props){
        super(props);
        this.setUserProfilePicture = this.setUserProfilePicture.bind(this);
        this.deleteAccount = this.deleteAccount.bind(this);
        

        this.state = {
            userFormat: ""
        }

    }

    deleteAccount() {
        console.log("delete")
    }

    setUserProfilePicture() {
            const file = document.getElementById('inputGroupFile01').files
            //checks if file is properly defined
            if(file[0] === undefined) {
                console.log("File is Undefined")
                return
            }
            //checks if file size is greater then 10 MB
            if(file[0].size > 10000000) {
                console.log("File Size is bigger then 10 MB")
                return
            }
    
            //checks the type of file
            if(file[0].type !== "image/png" && file[0].type !== "image/jpeg")
            {
                console.log(file[0].type)
                console.log("Invalid Page Type")
                return
            }
    
            console.log("Gets Pasts Checks For Image")
    
            const data = new FormData()
            console.log(file[0])
            data.append('image', file[0]);
    
            var config = {
                method: 'post',
                url: 'https://api.imgur.com/3/image',
                headers: {
                  'Authorization': 'Client-ID 06ca9bca2100479'
                },
                data : data
              };
        
            //var platID = this.state.platformFormat._id
            var tempUser = this.state.userFormat
            api(config)
            .then(response =>{
                console.log((response.data.data.link));
                tempUser.profile_picture = response.data.data.link;
                this.setState({userFormat : tempUser})
            })
            .catch(function (error) {
                console.log(error);
            });
    
            document.getElementById('inputGroupFile01').value = ""
    
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
                        //Begin getting platforms for display

                        this.setState({userFormat:response.data})

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
                <p>Settings Page</p>
                <img  
                src={this.state.userFormat.profile_picture === "" ? DefaultProfilePicture : this.state.userFormat.profile_picture} 
                width = {200}
                alt="profilepicture"
                />
                <div className="input-group mb-3">
                    <div className="custom-file">
                    <input
                        type="file"
                        id="inputGroupFile01"
                        accept="image/*"
                        onChange={this.setUserProfilePicture}
                    />
                    {/* <label className="custom-file-label" htmlFor="inputGroupFile01">
                        {this.state.fileName === "" ? "Choose an image file" : this.state.fileName}
                    </label> */}
                    </div>
                </div>
                <button onClick={this.deleteAccount()} class="btn btn-danger">Delete Account</button>
            </div>
        )
    }
}