import React, { Component } from 'react';
import {api} from "../axios_api.js";
import jwt from 'jsonwebtoken';
import jwt_decode from 'jwt-decode'
import "../format.css";
import Card from "react-bootstrap/Card"
import Penguin from "../images/Penguin.jpg"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

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
            jwt.verify(token, "jwt_key", function(err,res) {
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
                api.get('/user/'+ decoded._id)
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
                <div style={{display:"flex", marginLeft: "5%", marginRight: "5%"}}>
                    <div id="dash">Dashboard</div>
                    <div id="greeting">Welcome {this.state.username}!</div>
                </div>
                <div style={{marginLeft: "2.5%", marginRight: "2.5%"}} className="block">
                    <div className="top_block">
                        <div className="white_text">
                            Your Recent Platforms
                        </div>
                    </div>
                    <div style={{display: "flex"}}>
                        <Card className = "card_top">
                            <Card.Img variant="top" src={Penguin} className = "card_image"/>
                            <Card.Body className = "card_body">
                                <Card.Title className = "card_info">History of the NBA</Card.Title>
                                <Card.Text className = "card_info">
                                JBuckets
                                </Card.Text>
                                <button className = "favorite_button"><FontAwesomeIcon icon={faStar} /></button>
                            </Card.Body>
                        </Card>
                        <Card className = "card_top">
                            <Card.Img variant="top" src={Penguin} className = "card_image"/>
                            <Card.Body className = "card_body">
                                <Card.Title className = "card_info">History of the NBA</Card.Title>
                                <Card.Text className = "card_info">
                                JBuckets
                                </Card.Text>
                                <button className = "favorite_button"><FontAwesomeIcon icon={faStar} /></button>
                            </Card.Body>
                        </Card>
                        <Card className = "card_top">
                            <Card.Img variant="top" src={Penguin} className = "card_image"/>
                            <Card.Body className = "card_body">
                                <Card.Title className = "card_info">History of the NBA</Card.Title>
                                <Card.Text className = "card_info">
                                JBuckets
                                </Card.Text>
                                <button className = "favorite_button"><FontAwesomeIcon icon={faStar} /></button>
                            </Card.Body>
                        </Card>
                        <Card className = "card_top">
                            <Card.Img variant="top" src={Penguin} className = "card_image"/>
                            <Card.Body className = "card_body">
                                <Card.Title className = "card_info">History of the NBA</Card.Title>
                                <Card.Text className = "card_info">
                                JBuckets
                                </Card.Text>
                                <button className = "favorite_button"><FontAwesomeIcon icon={faStar} /></button>
                            </Card.Body>
                        </Card>
                        <Card className = "card_top">
                            <Card.Img variant="top" src={Penguin} className = "card_image"/>
                            <Card.Body className = "card_body">
                                <Card.Title className = "card_info">History of the NBA</Card.Title>
                                <Card.Text className = "card_info">
                                JBuckets
                                </Card.Text>
                                <button className = "favorite_button"><FontAwesomeIcon icon={faStar} /></button>
                            </Card.Body>
                        </Card>
                    </div>
                </div>
            </div>
        )
    }
}