import React, { Component } from 'react';
import {api} from "../axios_api.js";
import jwt from 'jsonwebtoken';
import jwt_decode from 'jwt-decode'
import "../format.css";
import Card from "react-bootstrap/Card"
import Penguin from "../images/Penguin.jpg"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faAngleLeft, faAngleRight, faAngleDown, faAngleUp } from "@fortawesome/free-solid-svg-icons";
import LoggedInNav from "./loggedInNav.component";
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
            get_recent: true,
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

    }

    componentDidUpdate() {
        //If statement to avoid infinite loop
        if(this.state.get_recent){
            //First grab user's learned platforms
            api.get('/user/getLearnedPlatforms/' + this.state.id)
            .then(response => {
                var learned_plats_ids = response.data; 
                learned_plats_ids = response.data;
                //Received array of learned platformData IDs

                //Now (if the array isn't empty) use these IDs to find the recent learned platforms
                if(learned_plats_ids.length > 0){
                    api.post('/platformData/getRecentPlatforms', {platformDatas_id: learned_plats_ids, user_id: this.state.id})
                    .then(recent_plats => {
                        var recent_platforms = recent_plats.data;
                        var platform_format_ids = [];
                        var index_dict = {};
                        for(var i = 0; i < recent_platforms.length; i++){
                            var specific_id = recent_platforms[i].platform_id;
                            index_dict[specific_id] = i;
                            platform_format_ids.push(specific_id);
                        }
                        console.log(recent_platforms);
                        //Received array of {completed_pages, is_favorited, platform_id}
                        //For every platform_id, we need to get the platformFormat information (pages, is_published, plat_name, owner, is_public, cover_photo, privacy_password)
                        api.post('/platformFormat/getRecentPlatformFormatData', {platformFormat_ids: platform_format_ids})
                        .then(recent_platformformats_info => {
                            var recent_platforms_platFormat = recent_platformformats_info.data;
                            //Received array of {pages, is_published, plat_name, owner, is_public, cover_photo, privacy_password, _id}
                            for(var i = 0; i < recent_platforms_platFormat.length; i++){
                                var specific_platform_format_id = recent_platforms_platFormat[i]._id;
                                var correct_index = index_dict[specific_platform_format_id];
                                recent_platforms[correct_index].pages = recent_platforms_platFormat[i].pages;
                                recent_platforms[correct_index].is_published = recent_platforms_platFormat[i].is_published;
                                recent_platforms[correct_index].plat_name = recent_platforms_platFormat[i].plat_name;
                                recent_platforms[correct_index].owner = recent_platforms_platFormat[i].owner;
                                recent_platforms[correct_index].is_public = recent_platforms_platFormat[i].is_public;
                                recent_platforms[correct_index].cover_photo = recent_platforms_platFormat[i].cover_photo;
                                recent_platforms[correct_index].privacy_password = recent_platforms_platFormat[i].privacy_password;
                            }
                            
                            this.setState({recent_platforms: recent_platforms, get_recent: false});
                        });
                    })
                }
            });
        }
        else{
            console.log("Second update: " + this.state.recent_platforms)
        }
    }

    render() {
        return (
            <div>
                <LoggedInNav props={this.props}/>
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
                        
                        {this.state.recent_platforms.map((platform, index) => (
                            <Card className = "card_top">
                            <Card.Img variant="top" src={platform.cover_photo} className = "card_image"/>
                                <Card.Body className = "card_body">
                                    <Card.Title className = "card_info">{platform.plat_name}</Card.Title>
                                    <Card.Text className = "card_info">
                                    {platform.owner}
                                    </Card.Text>
                                    <button className = "favorite_button"><FontAwesomeIcon icon={faStar} /></button>
                                </Card.Body>
                            </Card>
                        ))}
                    </div>
                </div>
                <div style={{marginLeft: "2.5%", marginRight: "2.5%"}} className="block">
                    <div className="top_block">
                        <div className="white_text">
                            Explore All Learning Platforms
                        </div>
                    </div>
                    <div style={{display: "flex", marginLeft: "3%", marginBottom: "2%"}}>
                        <div className="dashboard_sort" style={{width: "26%"}}>
                           <input type="text" placeholder="Search By Title or Creator" style={{borderRadius: "10px", background: "white", borderColor: "transparent", width: "100%", outline: "none", height: '31px', paddingBottom: "6px"}}></input>
                        </div>
                        <div className="dashboard_sort">
                            
                            <div>
                                Sort By:
                                <select style={{width: "70%", marginLeft: "6px", border: "transparent", borderRadius: "7px", outline:"none"}}>
                                    <option value="volvo">Favorited</option>
                                    <option value="saab">Recently Created</option>
                                    <option value="opel">Most Popular</option>
                                </select>
                            </div>
                         </div>
                        <div className="dashboard_sort" style={{width: "12.5%"}}>
                            <div>
                                <select style={{width: "93%", marginLeft: "6px", border: "transparent", borderRadius: "7px", outline:"none"}}>
                                    <option value="volvo">Public Only</option>
                                    <option value="saab">Private Only</option>
                                    <option value="opel">Public and Private</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div>
                            <div style={{display: "flex"}}>
                                {this.state.recent_platforms.map((platform, index) => (
                                    <Card className = "card_top">
                                    <Card.Img variant="top" src={platform.cover_photo} className = "card_image"/>
                                        <Card.Body className = "card_body">
                                            <Card.Title className = "card_info">{platform.plat_name}</Card.Title>
                                            <Card.Text className = "card_info">
                                            {platform.owner}
                                            </Card.Text>
                                            <button className = "favorite_button"><FontAwesomeIcon icon={faStar} /></button>
                                        </Card.Body>
                                    </Card>
                                ))}
                                <Card className = "card_top">
                                <Card.Img variant="top" src={Penguin} className = "card_image"/>
                                    <Card.Body className = "card_body">
                                        <Card.Title className = "card_info">This is a Test Platform</Card.Title>
                                        <Card.Text className = "card_info">
                                        iAmDummyData
                                        </Card.Text>
                                        <button className = "favorite_button"><FontAwesomeIcon icon={faStar} /></button>
                                    </Card.Body>
                                </Card>
                                <Card className = "card_top">
                                <Card.Img variant="top" src={Penguin} className = "card_image"/>
                                    <Card.Body className = "card_body">
                                        <Card.Title className = "card_info">This is a Test Platform</Card.Title>
                                        <Card.Text className = "card_info">
                                        iAmDummyData
                                        </Card.Text>
                                        <button className = "favorite_button"><FontAwesomeIcon icon={faStar} /></button>
                                    </Card.Body>
                                </Card>
                            </div>
                        </div>
                </div>
            </div>
        )
    }
}