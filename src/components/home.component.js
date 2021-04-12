import React, { Component } from 'react';
import axios from 'axios';
import {api} from "../axios_api.js";
import Carousel1 from "../images/Carousel1.jpg"
import Logo from "../images/LearnLogo.png"
import Penguin from "../images/Penguin.jpg"
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

    onSubmit(e){
        e.preventDefault();
        console.log("Here");
        api.get('/user')
            .then(res => console.log(res.data));
        // window.location = "/";
    }


    render() {
        return (
            // <div id="carouselExampleControls" class="carousel slide" data-bs-ride="carousel">
            //     <div class="carousel-inner">
            //         <div class="carousel-item active">
            //         <img src={Carousel1} class="d-block w-100" alt="..."/>
            //         </div>
            //         <div class="carousel-item">
            //         <img src={Logo} class="d-block w-100" alt="..."/>
            //         </div>
            //         <div class="carousel-item">
            //         <img src={Penguin}class="d-block w-100" alt="..."/>
            //         </div>
            //     </div>
            //     <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleControls" data-bs-slide="prev">
            //         <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            //         <span class="visually-hidden">Previous</span>
            //     </button>
            //     <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleControls" data-bs-slide="next">
            //         <span class="carousel-control-next-icon" aria-hidden="true"></span>
            //         <span class="visually-hidden">Next</span>
            //     </button>
            // </div>
        //     <div id="carouselExampleIndicators" class="carousel slide" data-bs-ride="carousel">
        //     <div class="carousel-indicators">
        //       <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="0" class="active" aria-current="true" aria-label="Slide 1"></button>
        //       <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="1" aria-label="Slide 2"></button>
        //       <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="2" aria-label="Slide 3"></button>
        //     </div>
        //     <div class="carousel-inner">
        //       <div class="carousel-item active">
        //         <img src={Carousel1} class="d-block w-100" alt="..."/>
        //       </div>
        //       <div class="carousel-item">
        //         <img src={Logo} class="d-block w-100" alt="..."/>
        //       </div>
        //       <div class="carousel-item">
        //         <img src={Logo} class="d-block w-100" alt="..."/>
        //       </div>
        //     </div>
        //     <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev">
        //       <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        //       <span class="visually-hidden">Previous</span>
        //     </button>
        //     <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next">
        //       <span class="carousel-control-next-icon" aria-hidden="true"></span>
        //       <span class="visually-hidden">Next</span>
        //     </button>
        //   </div>
            <div class="container">
                <div id="homeCarousel" class="carousel slide" data-bs-ride="carousel">
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
                </div> 
            </div>
        )
    }
}