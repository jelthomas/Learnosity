import React, { Component } from 'react';
//import {api} from "../axios_api.js";
import { Link } from 'react-router-dom';
import Logo from "../images/LearnLogo.png"
import Form from "react-bootstrap/Form"
export default class SignUp extends Component {
    constructor(props){
        super(props);

        this.onChange = this.onChange.bind(this);
        this.state = {
            username: '',
            email:'',
            password: '',
            confirmPassword:''
        }
    }

    onChange(e){
        this.setState({[e.target.name]: e.target.value})
        console.log("TESTING " + e.target.name + " " + e.target.value)
    }


    render() {
        return (
                <div style={{background: "rgb(59, 59, 59)"}}>
                
                <div className ="container">
                    <div className = "row">
                        <div className = "col-md-6 mt-5 mx-auto">
                            <div style = {{backgroundColor: "white", padding: "0px 20px 20px 20px", borderStyle: "solid", borderRadius: "28px"}}> 
                                <div style = {{textAlign: "center", color: 'rgb(0, 219, 0)', width: "max-content", margin: "auto", fontSize: "55px", padding: "3px"}}>
                                    <Link to="/" className="navbar-brand">
                                        <img width = {60} src = {Logo} alt =""/>
                                    </Link>
                                    Learnosity
                                </div>
                                <div className = "form-group" style={{marginLeft: "10%"}}>
                                    <label style = {{color: "black"}}> Username:</label>
                                    <input type = "username" style = {{width: "90%", borderColor: "black"}} className = "form-control" name = "username" placeholder = "Username" value = {this.state.username} onChange = {this.onChange} required/>
                                </div>
                                <div className = "form-group" style={{marginLeft: "10%"}}>
                                    <label style = {{color: "black"}}> Password:</label>
                                    <input type = "password" style = {{width: "90%", borderColor: "black"}} className = "form-control" name = "password" placeholder = "Password" value = {this.state.password} onChange = {this.onChange} required/>
                                </div>
                                <div className = "form-group" style={{marginLeft: "10%"}}>
                                    <label style = {{color: "black"}}> Confirm Password:</label>
                                    <input type = "password" style = {{width: "90%", borderColor: "black"}} className = "form-control" name = "confirmPassword" placeholder = "Enter Password Again" value = {this.state.confirmPassword} onChange = {this.onChange} required/>
                                </div>
                                <Form style={{marginLeft: "10%",marginRight: "10%"}}>
                                    <Form.Group controlId="exampleForm.ControlSelect1">
                                        <Form.Label>Security Question</Form.Label>
                                        <Form.Control as="select">
                                        <option>What was your first car?</option>
                                        <option>What was the name of your first pet?</option>
                                        </Form.Control>
                                    </Form.Group>
                                </Form>
                                {/* <div className = "form-group" style={{marginLeft: "10%"}}>
                                    <label style = {{color: "black"}}> Username:</label>
                                    <input type = "email" style = {{width: "90%", borderColor: "black"}} className = "form-control" name = "identifier" placeholder = "Email address or username" value = {this.state.identifier} onChange = {this.onChange} required/>
                                </div>
                                <div className = "form-group" style={{marginLeft: "10%"}}>
                                    <label style = {{color: "black"}}> Password:</label>
                                    <input type = "password" style = {{width: "90%", borderColor: "black"}} className = "form-control" name = "password" placeholder = "Password" value = {this.state.password} onChange = {this.onChange} required/>
                                </div>
                                <Link to="/forgot" style={{color: "blue", justifyContent: "center", display: "flex"}}>Forgot Password?</Link>
                                <button onClick={this.handleLogin} style = {{margin: "auto", marginTop: "10px", display: "block", backgroundColor: "limegreen", fontSize: "25px", borderStyle: "solid", borderRadius: "20px", borderColor: "grey", borderWidth: "1px", width: "45%", paddingBottom: "1.5%", paddingTop: "0.5%", color: "white"}}>
                                    Login
                                </button>
                                <div style = {{color: "black", textAlign: "center", fontSize: "15px", marginTop: "10px"}} className = "form-group">
                                    Don't have an account?
                                </div>
                                <Link to="/signup" className="btn btn-primary" style = {{justifyContent: "center", display: "flex", color: "black", background: "white", width: "45%", borderStyle: "solid", borderRadius: "20px", margin: "auto", fontSize: "18px", borderColor: "grey"}}>Sign Up</Link> */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}