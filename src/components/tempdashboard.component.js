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
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Alert from "react-bootstrap/Alert";
require('dotenv').config();

export let confirm_access = {value: ""};

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
        this.leftRecentPlatforms = this.leftRecentPlatforms.bind(this);
        this.rightRecentPlatforms = this.rightRecentPlatforms.bind(this);
        this.retrieveAllPlatforms = this.retrieveAllPlatforms.bind(this);
        this.onChangeSortBy = this.onChangeSortBy.bind(this);
        this.onChangeFilterBy = this.onChangeFilterBy.bind(this);
        this.searchPlatforms = this.searchPlatforms.bind(this);
        this.clickPlatform = this.clickPlatform.bind(this);
        this.handleCloseModal = this.handleCloseModal.bind(this);
        this.accessPrivatePlat = this.accessPrivatePlat.bind(this);
        this.updatePlatformPass = this.updatePlatformPass.bind(this);

        this.state = {
            username: "",
            id: "",
            users_favorite_platforms: [],
            users_recent_platforms: [],
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
            canPaginateRightAll: true,
            showPrivatePlatModal:false,
            usePlatID:'',
            showEmptyAlert:false,
            platformPass:'',
            showIncorrectPass:false
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
                        api.post('/platformFormat/getNonUserPlatforms/'+ response.data.username, {index: this.state.paginate_all_index, max: 21, argumentForAllPlatforms: this.state.argumentForAllPlatforms, filterBy: this.state.filterBy, userSearch: this.state.searchBy})
                        .then(all_plat_ids => {
                            var platform_formats
                            var canPaginateRightAll
                            if (all_plat_ids.data.length > 20){
                                platform_formats = all_plat_ids.data.slice(0,20)
                                canPaginateRightAll= true
                            }
                            else {
                                platform_formats = all_plat_ids.data.slice(0, all_plat_ids.data.length)
                                canPaginateRightAll= false
                            }
                            for(var i = 0; i < platform_formats.length; i++){
                                if (favorite_platforms.includes(platform_formats[i]._id)){
                                    platform_formats[i].is_favorited = true;
                                }
                                else {
                                    platform_formats[i].is_favorited = false;
                                }
                            }

                            var canPaginateRightRecent
                            var index_dict = {};
                            // console.log("USER FAVORITE PLATFORMS", favorite_platforms, platform_formats)
                            var temp = user_recent_platforms.slice(0,5);
                            // temp = [id1, id2, id3, id4, id5]
                            for (var i = 0; i < temp.length; i++){
                                index_dict[temp[i]] = i
                            }
                            //index_dict = {id1: 0, id2: 1, id3: 2, id4: 3, id5: 4}

                            // console.log("INDEX DICT", index_dict)
                            //Start of getting recent platforms
                            var recent_platforms = [];
                            api.post('/platformFormat/returnFormats/', {ids: user_recent_platforms.slice(0, 6)})
                            .then(res => {
                                if (res.data.length > 5){
                                    canPaginateRightRecent = true
                                    for (var i = 0; i < 5; i++){
                                        recent_platforms.push({})
                                    }
                                }
                                else {
                                    canPaginateRightRecent = false
                                    for (var i = 0; i < res.data.length; i++){
                                        recent_platforms.push({})
                                    }
                                }
                                
                                var recent_platform_formats = res.data;
                                var correct_index;
                                for (var i = 0; i < recent_platform_formats.length; i++){
                                    if (index_dict[recent_platform_formats[i]._id] !== undefined){
                                        correct_index = index_dict[recent_platform_formats[i]._id];
                                        recent_platforms[correct_index].plat_name = recent_platform_formats[i].plat_name 
                                        recent_platforms[correct_index].owner = recent_platform_formats[i].owner
                                        recent_platforms[correct_index].is_public = recent_platform_formats[i].is_public
                                        recent_platforms[correct_index].privacy_password = recent_platform_formats[i].privacy_password
                                        recent_platforms[correct_index].cover_photo = recent_platform_formats[i].cover_photo
                                        recent_platforms[correct_index]._id = recent_platform_formats[i]._id
                                    }
                                }
                                for (var i = 0; i < recent_platforms.length; i++){
                                    if (favorite_platforms.includes(recent_platforms[i]._id)){
                                        recent_platforms[i].is_favorited = true
                                    }
                                    else {
                                        recent_platforms[i].is_favorited = false
                                    }
                                }
                               
                                this.setState({
                                    all_platforms: platform_formats, 
                                    recent_platforms: recent_platforms,
                                    users_favorite_platforms: favorite_platforms,
                                    users_recent_platforms: user_recent_platforms, 
                                    username: response.data.username, 
                                    id: decoded._id,
                                    canPaginateRightRecent: canPaginateRightRecent,
                                    canPaginateRightAll: canPaginateRightAll
                                })
                                
                                // console.log("AHAHHAHHAH". this.state.recent_platforms[0])
                                
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
            var canPaginateLeftAll
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
                var canPaginateRightAll
                if (all_plat_ids.data.length > 20){
                    canPaginateRightAll = true
                    platform_formats = all_plat_ids.data.splice(0,20)
                }
                else {
                    canPaginateRightAll = false
                    platform_formats = all_plat_ids.data
                }
                for(var i = 0; i < platform_formats.length; i++){
                    if (this.state.users_favorite_platforms.includes(platform_formats[i]._id)){
                        platform_formats[i].is_favorited = true;
                    }
                    else {
                        platform_formats[i].is_favorited = false;
                    }
                }

                this.setState({
                    all_platforms: platform_formats,
                    paginate_all_index: this.state.paginate_all_index - 1,
                    canPaginateLeftAll: canPaginateLeftAll,
                    canPaginateRightAll: canPaginateRightAll
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
                    if (favorite_platforms.includes(platform_formats[i]._id)){
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

    leftRecentPlatforms() {
        var index_dict = {};
        var canPaginateRightRecent
        var temp = this.state.users_recent_platforms.slice((this.state.paginate_rec_index-1)*5, (this.state.paginate_rec_index) * 5)
        for (var i = 0; i < temp.length; i++){
            index_dict[temp[i]] = i
        }
        //Start of getting recent platforms
        var recent_platforms = [];
        var favorite_platforms = this.state.users_favorite_platforms
        api.post('/platformFormat/returnFormats/', {ids: temp})
        .then(response => {
            canPaginateRightRecent = true
            for (var i = 0; i < response.data.length; i++){
                recent_platforms.push({})
            }
            var recent_platform_formats = response.data;
            var correct_index
            for (var i = 0; i < recent_platform_formats.length; i++){
                correct_index = index_dict[recent_platform_formats[i]._id];
                recent_platforms[correct_index] = recent_platform_formats[i]
            }

            for(var i = 0; i < recent_platforms.length; i++){
                if (favorite_platforms.includes(recent_platforms[i]._id)){
                    recent_platforms[i].is_favorited = true;
                }
                else {
                    recent_platforms[i].is_favorited = false;
                }
            }
            this.setState({
                recent_platforms: recent_platforms,
                canPaginateRightRecent: canPaginateRightRecent,
                paginate_rec_index: this.state.paginate_rec_index - 1
            })
            
        })
        
    }

    rightRecentPlatforms() {
        var index_dict = {};
        var canPaginateRightRecent;
        var favorite_platforms = this.state.users_favorite_platforms;
        var temp = this.state.users_recent_platforms.slice((this.state.paginate_rec_index+1)*5, (this.state.paginate_rec_index+2) * 5 + 1);
        for (var i = 0; i < temp.length; i++){
            index_dict[temp[i]] = i;
        }
        //Start of getting recent platforms
        var recent_platforms = [];
        api.post('/platformFormat/returnFormats/', {ids: temp})
        .then(response => {
            if (response.data.length > 5){
                canPaginateRightRecent = true;
            }
            else {
                canPaginateRightRecent = false;
            }
            for (var i = 0; i < response.data.length; i++){
                recent_platforms.push({});
            }
            var recent_platform_formats = response.data;
            var correct_index
            for (var i = 0; i < recent_platform_formats.length; i++){
                correct_index = index_dict[recent_platform_formats[i]._id];
                recent_platforms[correct_index] = recent_platform_formats[i];
                // console.log("CORRECT INDEX", correct_index, recent_platforms)
            }

            for(var i = 0; i < recent_platforms.length; i++){
                if (favorite_platforms.includes(recent_platforms[i]._id)){
                    recent_platforms[i].is_favorited = true;
                }
                else {
                    recent_platforms[i].is_favorited = false;
                }
            }
            this.setState({
                recent_platforms: recent_platforms,
                canPaginateRightRecent: canPaginateRightRecent,
                paginate_rec_index: this.state.paginate_rec_index + 1
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
                argumentForAllPlatforms: argumentForAllPlatforms , paginate_all_index: 0
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
                filterBy: filterBy , paginate_all_index: 0
            })
            this.retrieveAllPlatforms(this.state.argumentForAllPlatforms, filterBy, this.state.searchBy)
        }
    }
    
    searchPlatforms(e) {
            var userSearch = document.getElementById("userSearch")
            this.setState({
                searchBy: userSearch.value , paginate_all_index: 0
            })
            this.retrieveAllPlatforms(this.state.argumentForAllPlatforms, this.state.filterBy, userSearch.value)
        
    }

    retrieveAllPlatforms(argumentForAllPlatforms, filterBy, searchBy) {
        var favorite_platforms = this.state.users_favorite_platforms;
            api.post('/platformFormat/getNonUserPlatforms/'+ this.state.username, {index: this.state.paginate_all_index, max: 21, argumentForAllPlatforms: argumentForAllPlatforms, filterBy: filterBy, userSearch: searchBy})
            .then(all_plat_ids => {
                var platform_formats
                if (all_plat_ids.data.length>20){
                    platform_formats = all_plat_ids.data.splice(0,20)
                    this.setState({
                        canPaginateRightAll: true
                    })
                }
                else{
                    platform_formats = all_plat_ids.data
                    this.setState({
                        canPaginateRightAll: false
                    })
                }
                for(var i = 0; i < platform_formats.length; i++){
                    if (this.state.users_favorite_platforms.includes(platform_formats[i]._id)){
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

    clickPlatform(plat_id,plat_visible){

        if(!plat_visible)
        {
            //when its false
            console.log(plat_visible)
            this.setState({showPrivatePlatModal:true, usePlatID:plat_id})
            return
        }
        confirm_access.value="confirm";
        // else
        // {
        //     //when its true
        //     console.log(plat_visible)
        //     return
        // }
        
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
        api.post('platformFormat/increment_times_played', {plat_id: plat_id})
        api.post('/user/updateRecentlyPlayed/', {userID: this.state.id, recent_platforms: this.state.users_recent_platforms})
        .then()

        this.props.history.push("/platform/"+plat_id);
    }

    handleCloseModal(){
        this.setState({showPrivatePlatModal:false, platformPass:'', showIncorrectPass: false})
    }

    accessPrivatePlat(){
        //check if password entered is proper 
        var inputPass = this.state.platformPass
        var plat_id = this.state.usePlatID
        var temp_recent = this.state.users_recent_platforms;

        confirm_access.value = "confirm";
        //grabs the platform 
        //checks if password matches with database
        api.get('platformFormat/getSpecificPlatformFormat/'+plat_id)
        .then(res => {
            console.log(res.data[0])
            if(inputPass !== res.data[0].privacy_password)
            {
                this.setState({showIncorrectPass:true,platformPass:""})
                
            }
            else
            {
                if (!temp_recent.includes(plat_id)){
                
                    temp_recent.unshift(plat_id)
                    // this.setState({
                    //     users_recent_platforms: this.state.users_recent_platforms.unshift(plat_id)
                    // })

                }
                else {
                    // console.log("BEFORE", this.state.users_recent_platforms)
                    // var temp = this.state.users_recent_platforms;
                    // var index = temp.indexOf(plat_id);
                    var index = temp_recent.indexOf(plat_id);
                    temp_recent.splice(index, 1);
                    temp_recent.unshift(plat_id);
                    // temp.splice(index, 1);
                    // temp.unshift(plat_id);
                    // this.setState({
                    //     users_recent_platforms: temp
                    // })
                    // console.log("AFTER", temp)
                }

                // this.setState({showPrivatePlatModal:false})

                api.post('platformFormat/increment_times_played', {plat_id: plat_id})
                .then(res2 =>{
                    api.post('/user/updateRecentlyPlayed/', {userID: this.state.id, recent_platforms: this.state.users_recent_platforms})
                    .then(res3 => {
                        this.setState({
                                users_recent_platforms: temp_recent
                            })
                        this.props.history.push("/platform/"+plat_id);
                    })
                    .catch(err3 =>{
                        console.log(err3.response)
                    })
                })
                .catch(err2=>{
                    console.log(err2.response)
                })

            }

        })
        .catch(err =>{
            console.log(err.response)
        })
    }

    updatePlatformPass(e){
        var eVal = e.target.value

        this.setState({platformPass:eVal,showEmptyAlert:false})
        console.log(eVal)
    }

    render() {
        return (
            <div>
                <LoggedInNav props={this.props}/>
                <div style={{display:"flex", marginLeft: "5%", marginRight: "5%", paddingTop: "15px"}}>
                    <div style={{fontSize: "35px"}} id="dash">Dashboard</div>
                    <div style={{fontSize: "35px"}} id="greeting">Welcome {this.state.username}!</div>
                </div>
                
                <div style={{marginLeft: "2.5%", marginRight: "2.5%"}} className="block">
                    <div className="top_block" style={{display: "flex"}}>
                        <div className="white_text">
                            Your Recent Platforms
                        </div>
                        {this.state.paginate_rec_index === 0
                        ?
                            <button disabled={true} style={{marginLeft: "70%", color:"grey"}} className = "paginate_arrows" onClick = {() => this.leftRecentPlatforms()}><FontAwesomeIcon icon={faAngleLeft} /></button>
                        :
                            <button style={{marginLeft: "70%"}} className = "paginate_arrows" onClick = {() => this.leftRecentPlatforms()}><FontAwesomeIcon icon={faAngleLeft} /></button>
                        }
                        {this.state.canPaginateRightRecent
                        ?
                            <button style={{marginLeft: "auto", marginRight: "3%"}} className = "paginate_arrows" onClick = {() => this.rightRecentPlatforms()}><FontAwesomeIcon icon={faAngleRight} /></button>
                        :
                            <button disabled={true} style={{marginLeft: "auto", marginRight: "3%", color: "grey"}} className = "paginate_arrows" onClick = {() => this.rightRecentPlatforms()}><FontAwesomeIcon icon={faAngleRight} /></button>
                        }

                    </div>
                    <div style={{display: "flex", flexWrap: "wrap"}}>
                            {this.state.recent_platforms.length > 0
                            ?
                            (this.state.recent_platforms.map((platform, index) => (
                                <Card className = "card_top itemsContainer">
                                <FontAwesomeIcon className="play_button" icon={faPlay} />
                                <Card.Img variant="top" onClick={() => this.clickPlatform(platform._id,platform.is_public)} src={platform.cover_photo === "" ? DefaultCoverPhoto : platform.cover_photo} className = "card_image"/>
                                    <Card.Body className = "card_body">
                                        <Card.Title className = "card_info">{platform.plat_name}</Card.Title>
                                        <Card.Text className = "card_info">
                                        {platform.owner}
                                        </Card.Text>
                                        <div style={{width: "fit-content"}} onClick={() => this.toggleFavoriteRecent(index)}>
                                            <FavoriteButton isfavorited={platform.is_favorited}/>
                                        </div>
                                    </Card.Body>
                                </Card>
                            )))
                            :
                             <div style={{color: "white", marginLeft: "3%"}}>
                                You have no recently played platforms! Click on one below to begin learning
                            </div>
                            }
                            </div>

                </div>

                <div style={{marginLeft: "2.5%", marginRight: "2.5%"}} className="block">
                    <div className="top_block" style={{display: "flex"}}>
                        <div className="white_text">
                            Explore All Learning Platforms
                        </div>
                        {this.state.paginate_all_index === 0
                        ?
                            <button disabled={true} style={{marginLeft: "65%", color: "grey"}} className = "paginate_arrows" onClick = {() => this.leftAllPlatforms()}><FontAwesomeIcon icon={faAngleLeft} /></button>
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
                            
                            <div style={{paddingLeft: "8px", paddingTop: "2px"}}>
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
                            <div style={{paddingTop: "2px"}}>
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
                                <Card.Img variant="top" onClick={() => this.clickPlatform(platform._id,platform.is_public)} src={platform.cover_photo === "" ? DefaultCoverPhoto : platform.cover_photo} className = "card_image"/>
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
                </div>

                <Modal show={this.state.showPrivatePlatModal} onHide={this.handleCloseModal} backdrop="static" keyboard={true}>
                <Modal.Header closeButton>
                    <Modal.Title>Enter Password for Platform</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className = "form-group" style={{marginLeft: "10%"}}>
                        <label style = {{color: "black"}}>Password:</label>
                        <input type = "text" style = {{width: "90%", borderColor: "black"}} className = "form-control" value = {this.state.platformPass} id = "platformPassInput" onChange = {(e)=>this.updatePlatformPass(e)} required/>
                    </div>
                    <Alert show = {this.state.showEmptyAlert} variant = 'danger'>
                        The text field can not be empty
                    </Alert>
                    <Alert style = {{textAlign: "center"}} show = {this.state.showIncorrectPass} variant = 'danger'>
                        The password is incorrect
                    </Alert>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={this.handleCloseModal}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={this.accessPrivatePlat}>
                        Submit
                    </Button>
                </Modal.Footer>
                </Modal>
                

            </div>


            
        )
    }
}