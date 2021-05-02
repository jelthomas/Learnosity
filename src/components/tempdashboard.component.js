import React, { Component } from 'react';
import {api} from "../axios_api.js";
import jwt from 'jsonwebtoken';
import jwt_decode from 'jwt-decode'
import "../format.css";
import Card from "react-bootstrap/Card"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faPlay, faAngleRight, faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import LoggedInNav from "./loggedInNav.component";
import DefaultCoverPhoto from "../images/defaultCoverPhoto.png"
require('dotenv').config();


function FavoriteButton(props) {
    const isfavorited = props.isfavorited;
    if (isfavorited) {
      return <button className = "favorite_button_favorited"><FontAwesomeIcon icon={faStar} /></button>
    }
    return <button className = "favorite_button"><FontAwesomeIcon icon={faStar} /></button>
  }

export default class TempDashboard extends Component {
    constructor(props){
        super(props);

        this.leftAllPlatforms = this.leftAllPlatforms.bind(this);
        this.rightAllPlatforms = this.rightAllPlatforms.bind(this);
        this.retrieveAllPlatforms = this.retrieveAllPlatforms.bind(this);
        this.onChangeSortBy = this.onChangeSortBy.bind(this);
        this.onChangeFilterBy = this.onChangeFilterBy.bind(this);
        this.searchPlatforms = this.searchPlatforms.bind(this);

        this.state = {
            username: "",
            id: "",
            users_favorite_platforms: [],
            recent_platforms: [],
            all_platforms: [],
            paginate_rec_index: 0,
            paginate_all_index: 0,
            argumentForAllPlatforms: {
                "plat_name": "asc"
            },
            filterBy: true,
            searchBy: "",
            canPaginateRightRecent: true,
            canPaginateRightAll: true
        }

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
                        
                        //Begin getting platforms for display
                        var favorite_platforms = response.data.favorited_platforms;
                        var user_recent_platforms = response.data.recently_played;
                        api.post('/platformFormat/getNonUserPlatforms/'+ response.data.username, {index: this.state.paginate_all_index, max: 21, argumentForAllPlatforms: this.state.argumentForAllPlatforms, filterBy: this.state.filterBy, userSearch: this.state.searchBy})
                        .then(all_plat_ids => {
                            var platform_formats
                            if (all_plat_ids.data.length > 20){
                                platform_formats = all_plat_ids.data.slice(0,20)
                                this.setState({
                                    canPaginateRightAll: true
                                })
                            }
                            else {
                                platform_formats = all_plat_ids.data.slice(0, all_plat_ids.data.length)
                                this.setState({
                                    canPaginateRightAll: false
                                })
                            }
                            for(var i = 0; i < platform_formats.length; i++){
                                if (favorite_platforms.includes(platform_formats[i])){
                                    platform_formats[i].is_favorited = true;
                                }
                                else {
                                    platform_formats[i].is_favorited = false;
                                }
                            }

                            this.setState({
                                all_platforms: platform_formats, users_favorite_platforms: favorite_platforms, username: response.data.username, id: decoded._id 
                            })
                        })
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

    //SHOULD BE ABLE TO REMOVE FIRST IF STATEMENT WHEN DISABLING BUTTON WORKS
    leftAllPlatforms(){
        if (this.state.paginate_all_index > 0){
            if (this.state.paginate_all_index - 1 === 0){
                this.setState({
                    canPaginateLeftAll: false
                })
            }
            else {
                this.setState({
                    canPaginateLeftAll: true
                })
            }
            var favorite_platforms = this.state.users_favorite_platforms;
            api.post('/platformFormat/getNonUserPlatforms/'+ this.state.username, {index: this.state.paginate_all_index-1, max: 21, argumentForAllPlatforms: this.state.argumentForAllPlatforms, filterBy: this.state.filterBy, userSearch: this.state.searchBy})
            .then(all_plat_ids => {
                var platform_formats = all_plat_ids
                
                for(var i = 0; i < platform_formats.length; i++){
                    if (favorite_platforms.includes(platform_formats[i])){
                        platform_formats[i].is_favorited = true;
                    }
                    else {
                        platform_formats[i].is_favorited = false;
                    }
                }

                this.setState({
                    all_platforms: platform_formats,
                    paginate_all_index: this.state.paginate_all_index - 1
                })
            })

            
            
        }
    }

    rightAllPlatforms(){
        var favorite_platforms = this.state.users_favorite_platforms;
            api.post('/platformFormat/getNonUserPlatforms/'+ this.state.username, {index: this.state.paginate_all_index+1, max: 21, argumentForAllPlatforms: this.state.argumentForAllPlatforms, filterBy: this.state.filterBy, userSearch: this.state.searchBy})
            .then(all_plat_ids => {
                var platform_formats
                if (all_plat_ids.data.length > 20){
                    platform_formats = all_plat_ids.data.slice(0,20)
                    this.setState({
                        canPaginateRightAll: true
                    })
                }
                else {
                    platform_formats = all_plat_ids.data.slice(0, all_plat_ids.data.length)
                    this.setState({
                        canPaginateRightAll: false
                    })
                }
                for(var i = 0; i < platform_formats.length; i++){
                    if (favorite_platforms.includes(platform_formats[i])){
                        platform_formats[i].is_favorited = true;
                    }
                    else {
                        platform_formats[i].is_favorited = false;
                    }
                }

                this.setState({
                    all_platforms: platform_formats,
                    paginate_all_index: this.state.paginate_all_index + 1
                })
            })       
    }

    onChangeSortBy() {
        var e = document.getElementById("sort_by")
        var argumentForAllPlatforms
        if (e !== null) {
            if (e.value === "none"){
                argumentForAllPlatforms = {
                    "plat_name": "asc"
                }
            }
            else if (e.value === "createdAt"){
                argumentForAllPlatforms = {
                    "createdAt": "desc"
                }
            } 
            else if (e.value === "pages_length"){
                argumentForAllPlatforms = {
                    "pages_length": "desc"
                }
            }
            else if (e.value === "times_played"){
                argumentForAllPlatforms = {
                    "times_played": "desc"
                }
            }
            this.setState({
                argumentForAllPlatforms: argumentForAllPlatforms
            })
            this.retrieveAllPlatforms(argumentForAllPlatforms, this.state.filterBy, this.state.searchBy)
        }
    }

    onChangeFilterBy() {
        var e = document.getElementById("filter_by")
        var filterBy
        if (e !== null) {
            if (e.value === "public") {
                filterBy = true
            }
            if (e.value === "private") {
                filterBy = false
            }
            if (e.value === "both") {
                filterBy = {
                    $in: [true, false]
                }
            }
            this.setState({
                filterBy: filterBy
            })
            this.retrieveAllPlatforms(this.state.argumentForAllPlatforms, filterBy, this.state.searchBy)
        }
    }
    
    searchPlatforms(e) {
            var userSearch = document.getElementById("userSearch")
            this.setState({
                searchBy: userSearch.value
            })
            this.retrieveAllPlatforms(this.state.argumentForAllPlatforms, this.state.filterBy, userSearch.value)
        
    }

    retrieveAllPlatforms(argumentForAllPlatforms, filterBy, searchBy) {
        var favorite_platforms = this.state.users_favorite_platforms;
            api.post('/platformFormat/getNonUserPlatforms/'+ this.state.username, {index: this.state.paginate_all_index, max: 21, argumentForAllPlatforms: argumentForAllPlatforms, filterBy: filterBy, userSearch: searchBy})
            .then(all_plat_ids => {
                var platform_formats = all_plat_ids.data
                
                for(var i = 0; i < platform_formats.length; i++){
                    if (favorite_platforms.includes(platform_formats[i])){
                        platform_formats[i].is_favorited = true;
                    }
                    else {
                        platform_formats[i].is_favorited = false;
                    }
                }
                var platforms = platform_formats.slice();
                this.setState({
                    all_platforms: platforms
                })
            })
    }

    render() {
        
        return (
            <div>
                <LoggedInNav props={this.props}/>
                <div style={{display:"flex", marginLeft: "5%", marginRight: "5%", paddingTop: "15px"}}>
                    <div id="dash">Dashboard</div>
                    <div id="greeting">Welcome {this.state.username}!</div>
                </div>
                
                <div style={{marginLeft: "2.5%", marginRight: "2.5%"}} className="block">
                    <div className="top_block" style={{display: "flex"}}>
                        <div className="white_text">
                            Your Recent Platforms
                        </div>
                    </div>



                </div>

                <div style={{marginLeft: "2.5%", marginRight: "2.5%"}} className="block">
                    <div className="top_block" style={{display: "flex"}}>
                        <div className="white_text">
                            Explore All Learning Platforms
                        </div>
                        {this.state.paginate_all_index === 0
                        ?
                            <button disabled="true" style={{marginLeft: "64%", color: "grey"}} className = "paginate_arrows" onClick = {() => this.leftAllPlatforms()}><FontAwesomeIcon icon={faAngleLeft} /></button>
                        :
                            <button style={{marginLeft: "64%"}} className = "paginate_arrows" onClick = {() => this.leftAllPlatforms()}><FontAwesomeIcon icon={faAngleLeft} /></button>
                        }   
                        {this.state.canPaginateRightAll
                        ?
                            <button style={{marginLeft: "auto", marginRight: "3%"}} className = "paginate_arrows" onClick = {() => this.rightAllPlatforms()}><FontAwesomeIcon icon={faAngleRight} /></button>
                        :
                            <button disabled="true" style={{marginLeft: "auto", marginRight: "3%", color:"grey"}} className = "paginate_arrows" onClick = {() => this.rightAllPlatforms()}><FontAwesomeIcon icon={faAngleRight} /></button>
                        }
                    
                    </div>
                    <div style={{display: "flex", marginLeft: "3%"}}>
                        <div className="dashboard_sort" style={{width: "26%", paddingLeft: "5px"}}>
                           <input onChange={this.searchPlatforms} id="userSearch" type="text" placeholder="Search By Title or Creator" style={{borderRadius: "10px", background: "white", borderColor: "transparent", width: "100%", outline: "none", height: '31px', paddingBottom: "6px"}}></input>
                        </div>
                        <div className="dashboard_sort">
                            
                            <div style={{paddingLeft: "5px"}}>
                                Sort By:
                                <select onChange = {this.onChangeSortBy} defaultValue = "none" id = "sort_by" style={{width: "70%", marginLeft: "6px", border: "transparent", borderRadius: "7px", outline:"none"}}>
                                    <option value="none">None</option>
                                    <option value="createdAt">Recently Created</option>
                                    <option value="times_played">Most Popular</option>
                                    <option value="pages_length">Most Content</option>
                                </select>
                            </div>
                         </div>
                        <div className="dashboard_sort" style={{width: "12.5%"}}>
                            <div>
                                <select onChange = {this.onChangeFilterBy} defaultValue = "public" id = "filter_by" style={{width: "93%", marginLeft: "6px", border: "transparent", borderRadius: "7px", outline:"none"}}>
                                    <option value="public">Public Only</option>
                                    <option value="private">Private Only</option>
                                    <option value="both">Public and Private</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div>
                            <div style={{display: "flex", flexWrap: "wrap"}}>
                            {this.state.all_platforms.map((platform, index) => (
                                <Card className = "card_top itemsContainer">
                                <FontAwesomeIcon className="play_button" icon={faPlay} />
                                <Card.Img variant="top" src={platform.cover_photo === "" ? DefaultCoverPhoto : platform.cover_photo} className = "card_image"/>
                                    <Card.Body className = "card_body">
                                        <Card.Title className = "card_info">{platform.plat_name}</Card.Title>
                                        <Card.Text className = "card_info">
                                        {platform.owner}
                                        </Card.Text>
                                        <div style={{width: "fit-content"}}>
                                            <FavoriteButton isfavorited={platform.is_favorited}/>
                                        </div>
                                    </Card.Body>
                                </Card>
                            ))}
                            </div>
                        </div>
                </div>
                

            </div>


            
        )
    }
}