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
            id: "",
            search: '',
            sort_by: '',
            privacy_filter: '',
            recent_platforms: [],
            all_platforms: [],
            paginate_rec_index: 0,
            paginate_all_index: 0
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

        //Token Validated
        //Grab data from backend

        //CHANGE THIS TO BEGIN GRABBING LEARNED PLATFORM DATA 

        // api.get('/user/getSecurityAnswer/'+this.state.identifier)
        // .then((response) => {
        //   console.log(response);
        //   if (response.data.length > 0){
        //     if (response.data[0].security_answer === this.state.security_answer) {
        //         api.put('/user/updatePassword/'+response.data[0]._id, {
        //             password: this.state.new_password
        //         })
        //         .then((response) => {
        //             console.log("HERE",response);
        //         }, (error) => {
        //             console.log("Here1234",error);
        //         })
        //     }
        //     else{
        //         this.setState({
        //             showAlert4: true
        //         })
        //     }
        //   }
        // }, (error) => {
        //     console.log(error);
        // });
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