import React, { Component } from 'react';
import {api} from "../axios_api.js";
import jwt from 'jsonwebtoken';
import { Link } from 'react-router-dom';
import Logo from "../images/LearnLogo.png";
import jwt_decode from 'jwt-decode';
import "../format.css";
import { myObject } from "./forgot_password.component"
import Navbar from "./navbar.component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEyeSlash} from "@fortawesome/free-regular-svg-icons";
require('dotenv').config();

export default class Login extends Component {
    constructor(props){
        super(props);
        
        this.handleLogin = this.handleLogin.bind(this);
        this.onChange = this.onChange.bind(this);
        this.toggle_password_vis = this.toggle_password_vis.bind(this);

        this.state = {
            identifier: '',
            password: '',
            message: '',
            hidden: false
        }
    }

    toggle_password_vis(){
        this.setState({ hidden: !this.state.hidden });
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
            if (decoded._id){
                //ID exists in token
                //Check if ID exists as a user
                api.get('/user/getSpecificUser/'+ decoded._id)
                .then(response => {
                    if (response) {
                        //Valid user
                        this.props.history.push(`/dashboard`);
                    }
                    else{
                        //Fake ID...
                        localStorage.removeItem('usertoken');
                    }
                })
                .catch(err => console.log("User Error: " + err));
            }
        }  
        else{
            //Not a Valid Token
            localStorage.removeItem('usertoken');
        }
        if (myObject.value !== "") {
            this.setState({
                message: myObject.value
            })
        }
    }

    onChange(e){
        this.setState({[e.target.name]: e.target.value, message:''})
      }

    handleLogin(e){
        e.preventDefault();
        const user = {
            identifier: this.state.identifier,
            password: this.state.password
        }
        api.post('/user/login', user)
            .then(res => {
                if(res.data.payload){
                    //Successfully logged in
                    let user_token = jwt.sign(res.data.payload, process.env.REACT_APP_SECRET, {
                        algorithm: "HS256"
                    })      
                    localStorage.setItem('usertoken', user_token);
                    this.props.history.push(`/dashboard`);
                }
                else{
                    localStorage.removeItem('usertoken');
                    this.setState({identifier: "", password: "", message: "Login failed. Incorrect username or password"});
                }
            })
            .catch(err => {
                localStorage.removeItem('usertoken');
                this.props.history.push('/login');
            });
        // window.location = "/";
    }


    render() {
        return (
            <div>
                <Navbar/>
            <div className ="custom_container" style={{background: "rgb(59, 59, 59)"}}>
                <div className = "custom_col mt-5 mx-auto">
                    <form onSubmit={this.handleLogin} style = {{backgroundColor: "white", padding: "0px 20px 20px 20px", borderStyle: "solid", borderRadius: "28px"}}> 
                        <Link to="/" className="navbar-brand">
                            <img width = {60} src = {Logo} alt =""/>
                        </Link>
                        <div style = {{textAlign: "center", color: 'rgb(0, 219, 0)', width: "max-content", margin: "auto", fontSize: "55px", padding: "3px", marginTop:"-75px"}}>
                            Learnosity
                        </div>
                        <div style = {{color: "red", textAlign: "center", fontSize: "25px"}}>{this.state.message}</div>
                        <div className = "form-group" style={{marginLeft: "10%"}}>
                            <label style = {{color: "black"}}> Username:</label>
                            <input style = {{width: "90%", borderColor: "black"}} className = "form-control" name = "identifier" placeholder = "Email address or username" value = {this.state.identifier} onChange = {this.onChange} required/>
                        </div>
                        <div className = "form-group" style={{marginLeft: "10%"}}>
                            <label style = {{color: "black"}}> Password:</label>
                            <div style={{display: "flex"}}>
                                <input type={this.state.hidden ? 'text' : 'password'} style = {{width: "90%", borderColor: "black"}} className = "form-control" name = "password" placeholder = "Password" value = {this.state.password} onChange = {this.onChange} required/>
                                <button type="button" onClick = {this.toggle_password_vis} style={{border: "transparent", background: "transparent", transform: "translate(-35px)"}}><FontAwesomeIcon icon={faEyeSlash} /></button>
                            </div>
                        </div>
                        <Link to="/forgot" style={{color: "blue", justifyContent: "center", display: "flex"}}>Forgot Password?</Link>
                        <button type= "submit" style = {{margin: "auto", marginTop: "10px", display: "block", backgroundColor: "limegreen", fontSize: "25px", borderStyle: "solid", borderRadius: "20px", borderColor: "grey", borderWidth: "1px", width: "45%", paddingBottom: "1.5%", paddingTop: "0.5%", color: "white"}}>
                            Login
                        </button>
                        <div style = {{color: "black", textAlign: "center", fontSize: "15px", marginTop: "10px"}} className = "form-group">
                            Don't have an account?
                        </div>
                        <Link to="/signup" className="btn btn-primary" style = {{justifyContent: "center", display: "flex", color: "black", background: "white", width: "45%", borderStyle: "solid", borderRadius: "20px", margin: "auto", fontSize: "18px", borderColor: "grey"}}>Sign Up</Link>
                    </form>
                </div>
            </div>
            </div>
        );
    }
}