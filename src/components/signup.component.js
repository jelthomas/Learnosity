import React, { Component } from 'react';
import {api} from "../axios_api.js";
import { Link } from 'react-router-dom';
import Logo from "../images/LearnLogo.png"
import Form from "react-bootstrap/Form"
import Button from "react-bootstrap/Button"
export default class SignUp extends Component {
    constructor(props){
        super(props);

        this.onChange = this.onChange.bind(this);
        this.onDropdown = this.onDropdown.bind(this);
        this.handleRegister = this.handleRegister.bind(this);
        this.state = {
            username: '',
            email:'',
            password: '',
            confirmPassword:'',
            securityQuestion:'What was your first car?',
            securityAnswer:''
        }
    }

    onChange(e){
        this.setState({[e.target.name]: e.target.value})
        //console.log("TESTING " + e.target.name + " " + e.target.value)
    }

    onDropdown(e)
    {
        this.setState({securityQuestion: e.target.value})
        //console.log(e.target.value)
    }

    handleRegister(e)
    {
        e.preventDefault();
        console.log(this.state.username)
        const user={
            username: this.state.username,
            email: this.state.email,
            password: this.state.password,
            security_question: this.state.securityQuestion,
            security_answer:    this.state.securityAnswer
        }

        api.post('/user/signup',(user))
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
                                    <label style = {{color: "black"}}> Email:</label>
                                    <input type = "email" style = {{width: "90%", borderColor: "black"}} className = "form-control" name = "email" placeholder = "Email Address" value = {this.state.email} onChange = {this.onChange} required/>
                                </div>
                                <div className = "form-group" style={{marginLeft: "10%"}}>
                                    <label style = {{color: "black"}}> Password:</label>
                                    <input type = "password" style = {{width: "90%", borderColor: "black"}} className = "form-control" name = "password" placeholder = "Password" value = {this.state.password} onChange = {this.onChange} required/>
                                </div>
                                <div className = "form-group" style={{marginLeft: "10%"}}>
                                    <label style = {{color: "black"}}> Confirm Password:</label>
                                    <input type = "password" style = {{width: "90%", borderColor: "black"}} className = "form-control" name = "confirmPassword" placeholder = "Enter Password Again" value = {this.state.confirmPassword} onChange = {this.onChange} required/>
                                </div>
                                <Form style={{marginLeft: "10%"}}>
                                    <Form.Group controlId="exampleForm.ControlSelect1">
                                        <Form.Label>Security Question:</Form.Label>
                                        <Form.Control as="select" style = {{width: "90%", borderColor: "black"}} onChange={this.onDropdown}>
                                        <option>What was your first car?</option>
                                        <option>What was the name of your first pet?</option>
                                        <option>What was the street you lived on during your childhood?</option>
                                        </Form.Control>
                                    </Form.Group>
                                </Form>
                                <div className = "form-group" style={{marginLeft: "10%"}}>
                                    <label style = {{color: "black"}}> Security Answer:</label>
                                    <input type = "securityAnswer" style = {{width: "90%", borderColor: "black"}} className = "form-control" name = "securityAnswer" placeholder = "Security Answer" value = {this.state.securityAnswer} onChange = {this.onChange} required/>
                                </div>
                                <Button variant="light" style={{marginLeft: "40%"}} onClick={this.handleRegister}>Register</Button>
                                <div>
                                    <p>Have an account already?</p>
                                    <Link to="/login" style={{color: "limegreen", justifyContent: "center", display: "flex"}}>Login</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}