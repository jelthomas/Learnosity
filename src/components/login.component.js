import React, { Component } from 'react';
import {api} from "../axios_api.js";
import jwt from 'jsonwebtoken';
import { Link } from 'react-router-dom';
import Logo from "../images/LearnLogo.png";
import jwt_decode from 'jwt-decode';
import "../format.css";

export default class Login extends Component {
    constructor(props){
        super(props);
        
        this.handleLogin = this.handleLogin.bind(this);
        this.onChange = this.onChange.bind(this);

        this.state = {
            identifier: '',
            password: '',
            message: ''
        }
    }

    componentDidMount(){
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
                        this.props.history.push(`/dashboard`);
                    }
                    else{
                        //Fake ID...
                        console.log("Fake ID");
                        localStorage.removeItem('usertoken');
                    }
                })
                .catch(err => console.log("User Error: " + err));
            }
        }  
        else{
            //Not a Valid Token
            console.log("Not valid token");
            localStorage.removeItem('usertoken');
        }
        console.log(this.props.value)
        if (this.props.value !== null) {
            
            this.setState({
                message: this.props.value
            })
        }
    }

    onChange(e){
        this.setState({[e.target.name]: e.target.value, message:''})
      }

    handleLogin(e){
        e.preventDefault();
        const user = {
            identifier: this.state.identifier.toLowerCase(),
            password: this.state.password
        }
        api.post('/user/login', user)
            .then(res => {
                if(res.data.payload){
                    //Successfully logged in
                    console.log(res.data.payload);
                    console.log(process.env.SECRET_KEY);
                    let user_token = jwt.sign(res.data.payload, "jwt_key", {
                        algorithm: "HS256"
                    })      
                    localStorage.setItem('usertoken', user_token);
                    this.props.history.push(`/dashboard`);
                }
                else{
                    console.log("No user found...");
                    console.log(res);
                    localStorage.removeItem('usertoken');
                    this.setState({identifier: "", password: "", message: "Login failed. Incorrect username or password"});
                }
            })
            .catch(err => {
                console.log("Login error: " + err);
                localStorage.removeItem('usertoken');
                this.props.history.push('/login');
            });
        // window.location = "/";
    }


    render() {
        return (
            <div className ="custom_container" style={{background: "rgb(59, 59, 59)"}}>
                <div className = "custom_col mt-5 mx-auto">
                    <form onSubmit={this.handleLogin} style = {{backgroundColor: "white", padding: "0px 20px 20px 20px", borderStyle: "solid", borderRadius: "28px"}}> 
                        <Link to="/" className="navbar-brand" id="image">
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
                            <input type = "password" style = {{width: "90%", borderColor: "black"}} className = "form-control" name = "password" placeholder = "Password" value = {this.state.password} onChange = {this.onChange} required/>
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
        );
    }
}