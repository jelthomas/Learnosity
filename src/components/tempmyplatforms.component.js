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

export default class MyPlatforms extends Component {
    constructor(props){
        super(props);

        this.editPlatform = this.editPlatform.bind(this);

        this.state = {
            username: "",
            id: "",
            favorite_ids: [],
            users_recent_platforms: [],
            updated_platforms: [],
            completed_platforms: [],
            created_platforms: [],
            favorite_platforms: [],
            paginate_created_index: 0,
            paginate_fav_index: 0,
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
                        var user_recent_platforms = response.data.recent_platforms;
                        api.post('/platformFormat/getCreatedPlatforms/'+ response.data.username, {index: 0, max: 7})
                        .then(all_plat_ids => {
                            var canPaginateRightCreated
                            var platform_formats
                            if (all_plat_ids.data.length > 6){
                                canPaginateRightCreated = true
                                platform_formats = all_plat_ids.data.slice(0, 6)
                            }
                            else {
                                canPaginateRightCreated = false
                                platform_formats = all_plat_ids.data
                            }
                            api.post('/platformFormat/returnFormats', {ids: favorite_platforms.slice(0,6)})
                            .then(plat_ids => {
                                var canPaginateRightFavorite
                                if (favorite_platforms.length > 6){
                                    canPaginateRightFavorite = true
                                }
                                else {
                                    canPaginateRightFavorite = false
                                }
                                var fav_plats = plat_ids.data


                                //Get every platformFormat that user has played before
                                api.post('/platformFormat/returnFormats', {ids: user_recent_platforms})
                                .then(played_ids => {
                                    //For every platform this user has played before
                                    for(var i = 0; i < played_ids.data.length; i++){
                                        //For every category in this platform
                                        console.log("FOR DANNY", i)
                                        var completed_platforms = []
                                        var updated_platforms = []
                                        var isCompleted = true
                                        for(var j = 0; j < played_ids.data[i].categories.length; j++){
                                            var allPages
                                            var completed_pages
                                            //Get all pages for this category
                                            api.get('/categoryFormat/getPages/'+played_ids.data[i].categories[j])
                                            .then(result => {
                                                allPages = result.data
                                                //Get all the pages this user completed for this platform
                                                console.log("NO HERE", played_ids.data.length, i)
                                                api.post('/categoryData/getCategoryDataCurrentProgressPages', {id: decoded._id, catid: played_ids.data[i].categories[j]})
                                                .then(completedResult => {
                                                    console.log("NOW HERE", completedResult.data)
                                                    completed_pages = completedResult.data
                                                    if (!completed_pages && !updated_platforms.includes(played_ids.data[i])){
                                                        updated_platforms.push(played_ids.data[i])
                                                        isCompleted = false
                                                    }
                                                    var temp1 = allPages.sort()
                                                    var temp2 = completed_pages.sort()
                                                    console.log("BLAHBLAHBLAH",played_ids.data[i], temp1, temp2)
                                                    for(var z = 0; z < temp1.length; z++){
                                                        //If there is at least one question that is not completed
                                                        if ((temp1[z] !== temp2[z] || z === temp2.length)&& !updated_platforms.includes(played_ids.data[i])){
                                                            updated_platforms.push(played_ids.data[i])
                                                            isCompleted = false
                                                        }
                                                    }
                                                })
                                            })
                                            console.log("PLAT ID", played_ids.data[i]._id, isCompleted)
                                        }
                                        if (isCompleted === true){
                                            console.log("AM I HERE", played_ids.data[i])
                                            completed_platforms.push(played_ids.data[i])
                                        }
                                    }
                                    console.log("COMPLETED", completed_platforms)
                                    console.log("Updated", updated_platforms)


                                    this.setState({
                                        created_platforms: platform_formats, 
                                        users_favorite_platforms: favorite_platforms,
                                        users_recent_platforms: user_recent_platforms,
                                        favorite_platforms: fav_plats, 
                                        username: response.data.username, 
                                        id: decoded._id,
                                        canPaginateRightCreated: canPaginateRightCreated,
                                        canPaginateLeftCreated: false,
                                        canPaginateLeftFavorite: false,
                                        canPaginateRightFavorite: canPaginateRightFavorite
                                    })
                                })
                                
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

    leftFavoritePlatforms(){
        var canPaginateLeftFavorite
        api.post('/platformFormat/returnFormats', {ids: this.state.users_favorite_platforms.slice((this.state.paginate_fav_index-1)*6, this.state.paginate_fav_index * 6)})
        .then(plats => {
            if (this.state.paginate_fav_index - 1 === 0){
                canPaginateLeftFavorite = false
            }
            else{
                canPaginateLeftFavorite = true
            }
            var fav_plats = plats.data
            this.setState({
                paginate_fav_index: this.state.paginate_fav_index - 1,
                favorite_platforms: fav_plats,
                canPaginateLeftFavorite: canPaginateLeftFavorite,
                canPaginateRightFavorite: true
            })
        })
    }

    rightFavoritePlatforms(){

        var canPaginateRightFavorite
        api.post('/platformFormat/returnFormats', {ids: this.state.users_favorite_platforms.slice((this.state.paginate_fav_index+1) * 6, (this.state.paginate_fav_index+2)*6)})
        .then(plats => {
            if (((this.state.paginate_fav_index+1)*6)+6 >= this.state.users_favorite_platforms.length){
                canPaginateRightFavorite = false
            }
            else{
                canPaginateRightFavorite = true
            }
            var fav_plats = plats.data
            this.setState({
                paginate_fav_index: this.state.paginate_fav_index + 1,
                favorite_platforms: fav_plats,
                canPaginateRightFavorite: canPaginateRightFavorite
            })
        })
    }

    //SHOULD BE ABLE TO REMOVE FIRST IF STATEMENT WHEN DISABLING BUTTON WORKS
    leftCreatedPlatforms(){
        if (this.state.paginate_created_index > 0){
            var canPaginateLeftCreated
            if (this.state.paginate_created_index - 1 === 0){
                this.setState({
                    canPaginateLeftCreated: false
                })
            }
            else {
                this.setState({
                    canPaginateLeftCreated: true
                })
            }
            api.post('/platformFormat/getCreatedPlatforms/'+ this.state.username, {index: this.state.paginate_created_index-1, max: 6})
            .then(all_plat_ids => {
                var platform_formats = all_plat_ids.data
                this.setState({
                    created_platforms: platform_formats,
                    paginate_created_index: this.state.paginate_created_index - 1,
                    canPaginateLeftCreated: canPaginateLeftCreated,
                    canPaginateRightCreated: true
                })
            })
        }
    }

    rightCreatedPlatforms(){
        var canPaginateLeftCreated
            if (this.state.paginate_created_index + 1 === 0){
                this.setState({
                    canPaginateLeftCreated: false
                })
            }
            else {
                this.setState({
                    canPaginateLeftCreated: true
                })
            }
            api.post('/platformFormat/getCreatedPlatforms/'+ this.state.username, {index: this.state.paginate_created_index+1, max: 7})
            .then(all_plat_ids => {
                var platform_formats
                var canPaginateRightCreated
                
                if (all_plat_ids.data.length > 6){
                    canPaginateRightCreated = true
                    platform_formats = all_plat_ids.data.splice(0,6)
                }
                else {
                    canPaginateRightCreated = false
                    platform_formats = all_plat_ids.data
                }
                
                this.setState({
                    created_platforms: platform_formats,
                    paginate_created_index: this.state.paginate_created_index + 1,
                    canPaginateLeftCreated: true,
                    canPaginateRightCreated: canPaginateRightCreated
                })
            })     
    }

    toggleFavoriteRecent(index){
        //Update is_favorited attribute for recent platform at index
        var recent_plats = this.state.recent_platforms;
        recent_plats[index].is_favorited = !recent_plats[index].is_favorited;
        var fav_plats = this.state.users_favorite_platforms
        if (fav_plats.includes(recent_plats[index]._id)){
            fav_plats = fav_plats.filter(item => item !== recent_plats[index]._id)
        }
        else {
            fav_plats.push(recent_plats[index]._id)
        }
        var all_plats = this.state.all_platforms
        for (var i = 0; i < all_plats.length; i++){
            if (all_plats[i]._id === recent_plats[index]._id){
                all_plats[i].is_favorited = !all_plats[i].is_favorited
            }
        }
        api.post('/user/updateFavoritePlatforms', {userID: this.state.id, fav_plats: fav_plats})
        .then();
        this.setState({recent_platforms: recent_plats, all_platforms: all_plats, users_favorite_platforms: fav_plats});

    }

    toggleFavoriteAll(index){
        //Update is_favorited attribute for recent platform at index
        var all_plats = this.state.all_platforms;
        all_plats[index].is_favorited = !all_plats[index].is_favorited;
        var fav_plats = this.state.users_favorite_platforms
        if (fav_plats.includes(all_plats[index]._id)){
            fav_plats = fav_plats.filter(item => item !== all_plats[index]._id)
        }
        else {
            fav_plats.push(all_plats[index]._id)
        }
        var recent_plats = this.state.recent_platforms
        for (var i = 0; i < recent_plats.length; i++){
            if (recent_plats[i]._id === all_plats[index]._id){
                recent_plats[i].is_favorited = !recent_plats[i].is_favorited
            }
        }

        api.post('/user/updateFavoritePlatforms', {userID: this.state.id, fav_plats: fav_plats})
        .then();
        this.setState({all_platforms: all_plats, recent_platforms: recent_plats, users_favorite_platforms: fav_plats});

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

    editPlatform(plat_id){
        this.props.history.push("/editplatform/"+plat_id);
    }

    clickPlatform(plat_id){
        //need to check if platform is private and if we need to enter pass to enter 
        if (!this.state.users_recent_platforms.includes(plat_id)){
            this.setState({
                users_recent_platforms: this.state.users_recent_platforms.unshift(plat_id)
            })
        }
        else {
            // console.log("BEFORE", this.state.users_recent_platforms)
            var temp = this.state.users_recent_platforms;
            var index = temp.indexOf(plat_id);
            temp.splice(index, 1);
            temp.unshift(plat_id);
            this.setState({
                users_recent_platforms: temp
            })
            // console.log("AFTER", temp)
        }
        api.post('/user/updateRecentlyPlayed/', {userID: this.state.id, recent_platforms: this.state.users_recent_platforms})
        .then()

        this.props.history.push("/platform/"+plat_id);
    }

    render() {
        return (
            <div>
                <LoggedInNav props={this.props}/>
                <div style={{display:"flex", marginLeft: "5%", marginRight: "5%", paddingTop: "15px"}}>
                    <div style={{textAlign: "center", width: "100%"}} id="dash">My Platforms</div>
                </div>
                
                <div style={{marginLeft: "2.5%", marginRight: "2.5%"}} className="block">
                    <div className="top_block" style={{display: "flex"}}>
                        <div className="white_text">
                            Your Created Platforms
                        </div>
                        {this.state.paginate_created_index === 0
                        ?
                            <button disabled={true} style={{marginLeft: "70%", color:"grey"}} className = "paginate_arrows" onClick = {() => this.leftCreatedPlatforms()}><FontAwesomeIcon icon={faAngleLeft} /></button>
                        :
                            <button style={{marginLeft: "70%"}} className = "paginate_arrows" onClick = {() => this.leftCreatedPlatforms()}><FontAwesomeIcon icon={faAngleLeft} /></button>
                        }
                        {this.state.canPaginateRightCreated
                        ?
                            <button style={{marginLeft: "auto", marginRight: "3%"}} className = "paginate_arrows" onClick = {() => this.rightCreatedPlatforms()}><FontAwesomeIcon icon={faAngleRight} /></button>
                        :
                            <button disabled={true} style={{marginLeft: "auto", marginRight: "3%", color: "grey"}} className = "paginate_arrows" onClick = {() => this.rightCreatedPlatforms()}><FontAwesomeIcon icon={faAngleRight} /></button>
                        }

                    </div>
                    <div style={{display: "flex", flexWrap: "wrap"}}>
                            {this.state.created_platforms.map((platform, index) => (
                                <Card className = "card_top itemsContainer">
                                <FontAwesomeIcon className="play_button" icon={faPlay} />
                                <Card.Img variant="top" onClick={() => this.editPlatform(platform._id)} src={platform.cover_photo === "" ? DefaultCoverPhoto : platform.cover_photo} className = "card_image"/>
                                    <Card.Body className = "card_body">
                                        <Card.Title className = "card_info">{platform.plat_name}</Card.Title>
                                        <Card.Text className = "card_info">
                                        {platform.owner}
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            ))}
                            </div>

                </div>
                <div style={{marginLeft: "2.5%", marginRight: "2.5%"}} className="block">
                    <div className="top_block" style={{display: "flex"}}>
                        <div className="white_text">
                            Your Favorite Platforms
                        </div>
                        {this.state.paginate_fav_index === 0
                        ?
                            <button disabled={true} style={{marginLeft: "70%", color:"grey"}} className = "paginate_arrows" onClick = {() => this.leftFavoritePlatforms()}><FontAwesomeIcon icon={faAngleLeft} /></button>
                        :
                            <button style={{marginLeft: "70%"}} className = "paginate_arrows" onClick = {() => this.leftFavoritePlatforms()}><FontAwesomeIcon icon={faAngleLeft} /></button>
                        }
                        {this.state.canPaginateRightFavorite
                        ?
                            <button style={{marginLeft: "auto", marginRight: "3%"}} className = "paginate_arrows" onClick = {() => this.rightFavoritePlatforms()}><FontAwesomeIcon icon={faAngleRight} /></button>
                        :
                            <button disabled={true} style={{marginLeft: "auto", marginRight: "3%", color: "grey"}} className = "paginate_arrows" onClick = {() => this.rightFavoritePlatforms()}><FontAwesomeIcon icon={faAngleRight} /></button>
                        }

                    </div>
                    <div style={{display: "flex", flexWrap: "wrap"}}>
                            {this.state.favorite_platforms.map((platform, index) => (
                                <Card className = "card_top itemsContainer">
                                <FontAwesomeIcon className="play_button" icon={faPlay} />
                                <Card.Img variant="top" onClick={() => this.editPlatform(platform._id)} src={platform.cover_photo === "" ? DefaultCoverPhoto : platform.cover_photo} className = "card_image"/>
                                    <Card.Body className = "card_body">
                                        <Card.Title className = "card_info">{platform.plat_name}</Card.Title>
                                        <Card.Text className = "card_info">
                                        {platform.owner}
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            ))}
                            </div>

                </div>

                {/* <div style={{marginLeft: "2.5%", marginRight: "2.5%"}} className="block">
                    <div className="top_block" style={{display: "flex"}}>
                        <div className="white_text">
                            Explore All Learning Platforms
                        </div>
                        {this.state.paginate_all_index === 0
                        ?
                            <button disabled={true} style={{marginLeft: "64%", color: "grey"}} className = "paginate_arrows" onClick = {() => this.leftAllPlatforms()}><FontAwesomeIcon icon={faAngleLeft} /></button>
                        :
                            <button style={{marginLeft: "64%"}} className = "paginate_arrows" onClick = {() => this.leftAllPlatforms()}><FontAwesomeIcon icon={faAngleLeft} /></button>
                        }   
                        {this.state.canPaginateRightAll
                        ?
                            <button style={{marginLeft: "auto", marginRight: "3%"}} className = "paginate_arrows" onClick = {() => this.rightAllPlatforms()}><FontAwesomeIcon icon={faAngleRight} /></button>
                        :
                            <button disabled={true} style={{marginLeft: "auto", marginRight: "3%", color:"grey"}} className = "paginate_arrows" onClick = {() => this.rightAllPlatforms()}><FontAwesomeIcon icon={faAngleRight} /></button>
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
                                <Card.Img variant="top" onClick={() => this.clickPlatform(platform._id)} src={platform.cover_photo === "" ? DefaultCoverPhoto : platform.cover_photo} className = "card_image"/>
                                    <Card.Body className = "card_body">
                                        <Card.Title className = "card_info">{platform.plat_name}</Card.Title>
                                        <Card.Text className = "card_info">
                                        {platform.owner}
                                        </Card.Text>
                                        <div style={{width: "fit-content"}} onClick={() => this.toggleFavoriteAll(index)}>
                                            <FavoriteButton isfavorited={platform.is_favorited}/>
                                        </div>
                                    </Card.Body>
                                </Card>
                            ))}
                            </div>
                        </div>
                </div> */}
                

            </div>


            
        )
    }
}