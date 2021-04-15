import React, { Component } from 'react';
import {api} from "../axios_api.js";
import Carousel from 'react-bootstrap/Carousel'
import Carousel1 from "../images/Carousel1.jpg"
import Carousel2 from "../images/LearnosityPage2.png"
import jwt_decode from 'jwt-decode'
import jwt from 'jsonwebtoken';
import loggedInNav from "./loggedInNav.component.js"
//import "bootstrap/dist/css/bootstrap.min.css";
// import 'bootstrap/js/dist/util';

export default class Home extends Component {
    constructor(props){
        super(props);

        this.onSubmit = this.onSubmit.bind(this);
        
        this.state = {
            username: '',
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
    }

    onSubmit(e){
        e.preventDefault();
        console.log("Here");
        api.get('/user')
            .then(res => console.log(res.data));
        // window.location = "/";
    }


    render() {
        return (
            <div>
            <loggedInNav/>
            <div class="container">
                {/* <div id="homeCarousel" class="carousel slide" data-bs-ride="carousel">
                    <div class="carousel-indicators">
                        <button type="button" data-bs-target="#homeCarousel" data-bs-slide-to="0" class="active" aria-current="true" aria-label="Slide 1"></button>
                        <button type="button" data-bs-target="#homeCarousel" data-bs-slide-to="1" aria-label="Slide 2"></button>
                        <button type="button" data-bs-target="#homeCarousel" data-bs-slide-to="2" aria-label="Slide 3"></button>
                    </div>
                    <div class="carousel-inner">
                        <div class= "carousel-item active">
                            <img src = {Carousel1} class="d-block w-100" alt ="homeCarousel"/>
                        </div>
                        <div class = "carousel-item">
                            <img src = {Logo} class="d-block w-100" alt ="homeCarousel"/>
                        </div>
                        <div class = "carousel-item">
                            <img src = {Penguin} class="d-block w-100" alt ="homeCarousel"/>
                        </div>
                    </div>
                <button class="carousel-control-prev" type="button" data-bs-target="#homeCarousel" data-bs-slide="prev">
                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Previous</span>
                </button>
                <button class="carousel-control-next" type="button" data-bs-target="#homeCarousel" data-bs-slide="next">
                    <span class="carousel-control-next-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Next</span>
                </button>
                </div>  */}

                <Carousel>
                <Carousel.Item>
                    <img
                    className="d-block w-100"
                    src={Carousel1}
                    alt="First slide"
                    />
                </Carousel.Item>
                <Carousel.Item>
                    <img
                    className="d-block w-100"
                    src={Carousel2}
                    alt="Second slide"
                    />
                </Carousel.Item>
                </Carousel>
            </div>
            </div>
        )
    }
}