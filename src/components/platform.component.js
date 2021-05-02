import React, { Component } from 'react';
import {api} from "../axios_api.js";
import jwt from 'jsonwebtoken';
import jwt_decode from 'jwt-decode'
import "../format.css";
import Card from "react-bootstrap/Card"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faPlay, faAngleRight, faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import DefaultCoverPhoto from "../images/defaultCoverPhoto.png"
require('dotenv').config();


export default class Platform extends Component {
    constructor(props){
        super(props);

        this.clickUseCategory = this.clickUseCategory.bind(this);

        this.state = {
            username: "",
            id: "",
            platformFormat: "",
            categoriesFormats:[]
        }

    }

    clickUseCategory(cat_id) {

        var platform_format_id = this.props.location.pathname.substring(10);


        this.props.history.push("/usecategory/"+platform_format_id+"/"+cat_id);
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
                        var platform_format_id = this.props.location.pathname.substring(10);

                        console.log(platform_format_id)

                        
                        api.get('/platformFormat/getSpecificPlatformFormat/'+platform_format_id)
                        .then(response => {
                            console.log(response.data)
                            console.log(response.data[0].categories)
							//this.setState({platformFormat:response.data[0]})

                            const catFormatInfo = {
                                categories_id : response.data[0].categories
                            }

                            //gets every category format inside of categories array
                            api.post('/categoryFormat/getAllCategories/',catFormatInfo)
                            .then(res => {
                                this.setState({platformFormat:response.data[0],categoriesFormats:res.data})
                            })
                            .catch(err => {
                                console.log(err.response)
                            })

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
                <p>TESTING PLAT</p>
                <p>{this.state.platformFormat.plat_name}</p>
                {this.state.categoriesFormats.map((category, index) => (
                    <Card className = "card_top itemsContainer">
                    <FontAwesomeIcon className="play_button" icon={faPlay} />
                    <Card.Img variant="top" onClick={() => this.clickUseCategory(category._id)} src={category.category_photo === "" ? DefaultCoverPhoto : category.category_photo} className = "card_image"/>
                        <Card.Body className = "card_body">
                            <Card.Title className = "card_info">{category.category_name}</Card.Title>
                            {/* <Card.Text className = "card_info">
                            {category.owner}
                            </Card.Text> */}
                            {/* <div style={{width: "fit-content"}} onClick={() => this.toggleFavoriteAll(index)}>
                                <FavoriteButton isfavorited={platform.is_favorited}/>
                            </div> */}
                        </Card.Body>
                    </Card>
                ))}
            </div>
        )
    }
}