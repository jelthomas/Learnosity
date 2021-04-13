import React, { Component } from 'react';
import {api} from "../axios_api.js";
import jwt from 'jsonwebtoken';
import jwt_decode from 'jwt-decode'

export default class Dashboard extends Component {
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
            console.log("Token found");
            jwt.verify(token, "jwt_key", function(err,res) {
                if(err){
                    //Improper JWT format 
                    //Remove token and redirect back to home
                    console.log("Improper format");
                    localStorage.removeItem('usertoken');
                    this.props.history.push(`/`);
                }
                else{
                    //Properly formatted JWT
                    console.log("Proper format");
                    validToken = true;
                }});
        }
        if(validToken){
            //Check if ID is in token and ID exists as a user
            const decoded = jwt_decode(token);
            if (decoded._id){
                //ID exists in token
                //Check if ID exists as a user
                console.log("ID exists");
                console.log(decoded);
                api.get('/user/'+ decoded._id)
                .then(response => {
                    console.log(response.data);
                    if (response) {
                        //Valid user
                        this.setState({username: response.data.username, id: decoded._id });
                    }
                    else{
                        //Fake ID...
                        console.log("Fake ID");
                        localStorage.removeItem('usertoken');
                        this.props.history.push(`/`);
                    }
                })
                .catch(err => {
                    //Fake ID...
                    console.log("Fake ID");
                    localStorage.removeItem('usertoken');
                    this.props.history.push(`/`);
                });
            }
        }  
        else{
            //Not a Valid Token
            console.log("Not valid token");
            localStorage.removeItem('usertoken');
            this.props.history.push(`/`);
        }
    }

    render() {
        return (
            <div>

                <div>Dashboard Screen</div>
                <div>Hello {this.state.username}</div>
            </div>
        )
    }
}