import React, { Component } from 'react';
import {api} from "../axios_api.js";
import jwt from 'jsonwebtoken';
import jwt_decode from 'jwt-decode'
import "../format.css";
// import Card from "react-bootstrap/Card"
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faStar, faPlay, faAngleRight, faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import DefaultCoverPhoto from "../images/defaultCoverPhoto.png"
require('dotenv').config();


export default class EditCategory extends Component {
    constructor(props){
        super(props);

        this.state = {
            username: "",
            id: "",
            categoryFormat: ""
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

                        //grab the id of the platform 
                        var category_format_id = this.props.location.pathname.substring(39);

                        console.log(category_format_id)

                        //get specific category format
                        api.get('/categoryFormat/getSpecificCategoryFormat/'+category_format_id)
                        .then(response => {
                            console.log(response.data)
							this.setState({categoryFormat:response.data[0]})

                        })
                        .catch(error => {
                            console.log(error.response)
                        });
                        
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
                <p>TESTING EDIT CATEGORY</p>
                <p>{this.state.categoryFormat.category_name}</p>
            </div>
        )
    }
}