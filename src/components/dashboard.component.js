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

export default class Dashboard extends Component {
    constructor(props){
        super(props);

        this.toggleFavoriteRecent = this.toggleFavoriteRecent.bind(this);
        this.clickUsePlatform = this.clickUsePlatform.bind(this);
        this.leftAllPlatforms = this.leftAllPlatforms.bind(this);
        this.rightAllPlatforms = this.rightAllPlatforms.bind(this);
        this.leftRecentPlatforms = this.leftRecentPlatforms.bind(this);
        this.rightRecentPlatforms = this.rightRecentPlatforms.bind(this);
        this.retrieveAllPlatforms = this.retrieveAllPlatforms.bind(this);
        this.onChangeSortBy = this.onChangeSortBy.bind(this);
        this.onChangeFilterBy = this.onChangeFilterBy.bind(this);
        this.searchPlatforms = this.searchPlatforms.bind(this);

        this.state = {
            username: "",
            id: "",
            search: '',
            sort_by: '',
            sort_by_value: '',
            privacy_filter: '',
            recent_platforms: [],
            get_recent: true,
            get_all: true,
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
                var all_platform_formats
                var recent_platforms
                api.get('/user/getSpecificUser/'+ decoded._id)
                .then(response => {
                    if (response) {
                        //Valid user
                        this.setState({username: response.data.username, id: decoded._id });
                        
                        //Get array of PlatformFormat Ids (where owner != username and is_published = true)
                        api.post('/platformFormat/getNonUserPlatforms/'+ response.data.username, {index: this.state.paginate_all_index, max: 21, argumentForAllPlatforms: this.state.argumentForAllPlatforms, filterBy: this.state.filterBy, userSearch: this.state.searchBy})
                        .then(all_plat_ids => {
                            //Received array of platformFormat Ids
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
                            var platform_format_ids = [];
                            var index_dict = {};
                            for(var i = 0; i < platform_formats.length; i++){
                                platform_format_ids.push(platform_formats[i]._id);
                                index_dict[platform_formats[i]._id] = i;
                                platform_formats[i].completed_pages = null;
                                platform_formats[i].is_favorited = null;
                                platform_formats[i].recently_played = null;
                            }
                            //Now query to receive the platform Data information for all ids in the array for that user
                            api.post('/platformData/getAllPlatforms', {platformFormat_ids: platform_format_ids, user_id: decoded._id})
                            .then(all_plat_data_ids => {
                                // Received all platform data info for all platforms
                                var all_platforms = all_plat_data_ids.data;

                                for(var i = 0; i < all_platforms.length; i++){
                                    var specific_platform_format_id = all_platforms[i].platform_id;
                                    var correct_index = index_dict[specific_platform_format_id];
                                    //platform_formats[correct_index] = all_platforms[i]
                                // platform_formats[correct_index].platform_id = all_platforms[i].platform_id;
                                    platform_formats[correct_index].completed_pages = all_platforms[i].completed_pages;
                                    platform_formats[correct_index].is_favorited = all_platforms[i].is_favorited;
                                    platform_formats[correct_index].recently_played = all_platforms[i].recently_played;
                                }
                                all_platform_formats = platform_formats.slice()
                                //Platform_formats now holds all platforms that are published and haven't been created by the user

                                //Start of getting the recent platforms
                                var recent_platforms
                                api.post('platformData/getRecentPlatforms', {user_id: this.state.id, index: this.state.paginate_rec_index, max: 6})
                                            .then(all_plat_ids => {
                                                var platform_datas
                                                if (all_plat_ids.data.length > 5){
                                                    platform_datas = all_plat_ids.data.slice(0,5)
                                                    this.setState({
                                                        canPaginateRightRecent: true
                                                    })
                                                }
                                                else {
                                                    platform_datas = all_plat_ids.data.slice(0, all_plat_ids.data.length)
                                                    this.setState({
                                                        canPaginateRightRecent: false
                                                    })
                                                }
                                                var platform_format_ids = [];
                                                var index_dict = {};
                                                for (var i = 0; i < platform_datas.length; i++){
                                                    platform_format_ids.push(platform_datas[i].platform_id);
                                                    index_dict[platform_datas[i].platform_id] = i;
                                                    platform_datas[i].plat_name = null;
                                                    platform_datas[i].owner = null;
                                                    platform_datas[i].is_public = null;
                                                    platform_datas[i].privacy_password = null;
                                                    platform_datas[i].cover_photo = null;
                                                    platform_datas[i].pages = null;
                                                }
                                                api.post('/platformFormat/returnFormats', {ids: platform_format_ids})
                                                .then(all_plat_data_ids => {
                                                    var all_platforms = all_plat_data_ids.data;
                                                    for(var i = 0; i < all_platforms.length; i++){
                                                        var specific_platform_format_id = all_platforms[i]._id;
                                                        var correct_index = index_dict[specific_platform_format_id];
                                                        platform_datas[correct_index].plat_name = all_platforms[i].plat_name;
                                                        platform_datas[correct_index].owner = all_platforms[i].owner;
                                                        platform_datas[correct_index].is_public = all_platforms[i].is_public;
                                                        platform_datas[correct_index].privacy_password = all_platforms[i].privacy_password;
                                                        platform_datas[correct_index].cover_photo = all_platforms[i].cover_photo;
                                                        platform_datas[correct_index].pages = all_platforms[i].pages;  
                                                    }
                                                    
                                                    var temp = [];
                                                    for(var i = 0; i < platform_datas.length; i++){
                                                        if(platform_datas[i].plat_name !== null){
                                                            temp.push(platform_datas[i]);
                                                        }
                                                    }
                                                    this.setState({all_platforms: all_platform_formats, recent_platforms: temp, username: response.data.username, id: decoded._id});
                                                })
                    
                                            })
                        
                                
                            })      
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

    toggleFavoriteRecent(index){
        //Update is_favorited attribute for recent platform at index
        var recent_plats = this.state.recent_platforms;
        recent_plats[index].is_favorited = !recent_plats[index].is_favorited;

        //Update value in the database using api call
        var all_platforms = this.state.all_platforms
        var myID = recent_plats[index].platform_id;
        for (var i = 0; i < all_platforms.length; i++){
            if (all_platforms[i]._id === myID){
                all_platforms[i].is_favorited = !all_platforms[i].is_favorited
                break
            }
        }
        api.post('/platformData/toggleFavorited', {id: recent_plats[index].platform_id, user_id: this.state.id, is_favorited: recent_plats[index].is_favorited})
        .then();
        this.setState({recent_platforms: recent_plats});

    }

    toggleFavoriteAll(index){
        //Update is_favorited attribute for all platform at index
        var all_plats = this.state.all_platforms;

        //Check if we need to create a new platform Data object
        var create_new = (all_plats[index].is_favorited === null);

        if(!create_new){
            //Negative value of currently is_favorited
            all_plats[index].is_favorited = !all_plats[index].is_favorited;

            //Update value in the database using api call
            api.post('/platformData/toggleFavorited', {id: all_plats[index]._id, user_id: this.state.id, is_favorited: all_plats[index].is_favorited})
            .then(all_plats => {});
            this.setState({all_plats: all_plats});

            
        }
        else{
            //Create new platform data object for this platform format ID and user ID

            //sets value to true
            all_plats[index].is_favorited = true

            this.setState({all_plats: all_plats});

            const createPlatData = {
                user_id : this.state.id,
                platform_id : all_plats[index]._id,
                completed_pages :[],
                is_favorited : true,
                is_completed : false
            }

            //create a platformData
            api.post('/platformData/addFavorite',createPlatData)
            .then(response => {})
            .catch(error => {
                console.log(error.response)
            });
        }
        var recent_platforms = this.state.recent_platforms
        var myID = all_plats[index]._id;
        for (var i = 0; i < recent_platforms.length; i++){
            if (recent_platforms[i].platform_id === myID){
                recent_platforms[i].is_favorited = !recent_platforms[i].is_favorited
                break
            }
        }
    }

    leftAllPlatforms(){
        if (this.state.paginate_all_index > 0){
            if (this.state.paginate_all_index - 1 === 0){
                this.setState({
                    canPaginateRightAll: true
                })
            }
            else {
                this.setState({
                    canPaginateRightAll: true
                })
            }
            var all_platform_formats  
            api.post('/platformFormat/getNonUserPlatforms/'+ this.state.username, {index: this.state.paginate_all_index - 1, max: 20, argumentForAllPlatforms: this.state.argumentForAllPlatforms, filterBy: this.state.filterBy, userSearch: this.state.searchBy})
            .then(all_plat_ids => {
                //Received array of platformFormat Ids
                var platform_formats = all_plat_ids.data;
                var platform_format_ids = [];
                var index_dict = {};
                for(var i = 0; i < platform_formats.length; i++){
                    platform_format_ids.push(platform_formats[i]._id);
                    index_dict[platform_formats[i]._id] = i;
                    platform_formats[i].completed_pages = null;
                    platform_formats[i].is_favorited = null;
                    platform_formats[i].recently_played = null;
                }
                //Now query to receive the platform Data information for all ids in the array for that user
                api.post('/platformData/getAllPlatforms', {platformFormat_ids: platform_format_ids, user_id: this.state.id})
                .then(all_plat_data_ids => {
                    // Received all platform data info for all platforms
                    var all_platforms = all_plat_data_ids.data;

                    for(var i = 0; i < all_platforms.length; i++){
                        var specific_platform_format_id = all_platforms[i].platform_id;
                        var correct_index = index_dict[specific_platform_format_id];
                        platform_formats[correct_index].completed_pages = all_platforms[i].completed_pages;
                        platform_formats[correct_index].is_favorited = all_platforms[i].is_favorited;
                        platform_formats[correct_index].recently_played = all_platforms[i].recently_played;
                    }
                    all_platform_formats = platform_formats
                    this.setState({
                        paginate_all_index: this.state.paginate_all_index - 1,
                        all_platforms: all_platform_formats
                    })
                    //Platform_formats now holds all platforms that are published and haven't been created by the user

                })      
            });

            
            
        }
    }

    rightAllPlatforms(){
        var all_platform_formats
        api.post('/platformFormat/getNonUserPlatforms/'+ this.state.username, {index: this.state.paginate_all_index + 1, max: 21, argumentForAllPlatforms: this.state.argumentForAllPlatforms, filterBy: this.state.filterBy, userSearch: this.state.searchBy})
            .then(all_plat_ids => {
                var platform_formats
                if (all_plat_ids.data.length > 20){
                    platform_formats = all_plat_ids.data.slice(0,20)
                    this.setState({
                        canPaginateRightAll: true
                    })
                }
                else {
                    platform_formats = all_plat_ids.data
                    this.setState({
                        canPaginateRightAll: false
                    })
                }
                //Received array of platformFormat Ids
                var platform_format_ids = [];
                var index_dict = {};
                for(var i = 0; i < platform_formats.length; i++){
                    platform_format_ids.push(platform_formats[i]._id);
                    index_dict[platform_formats[i]._id] = i;
                    platform_formats[i].completed_pages = null;
                    platform_formats[i].is_favorited = null;
                    platform_formats[i].recently_played = null;
                }
                //Now query to receive the platform Data information for all ids in the array for that user
                api.post('/platformData/getAllPlatforms', {platformFormat_ids: platform_format_ids, user_id: this.state.id})
                .then(all_plat_data_ids => {
                    // Received all platform data info for all platforms
                    var all_platforms = all_plat_data_ids.data;

                    for(var i = 0; i < all_platforms.length; i++){
                        var specific_platform_format_id = all_platforms[i].platform_id;
                        var correct_index = index_dict[specific_platform_format_id];
                        platform_formats[correct_index].completed_pages = all_platforms[i].completed_pages;
                        platform_formats[correct_index].is_favorited = all_platforms[i].is_favorited;
                        platform_formats[correct_index].recently_played = all_platforms[i].recently_played;
                    }
                    all_platform_formats = platform_formats
                    this.setState({
                        paginate_all_index: this.state.paginate_all_index + 1,
                        all_platforms: all_platform_formats
                    })
                    //Platform_formats now holds all platforms that are published and haven't been created by the user

                })      
            });
            
    }

    leftRecentPlatforms(){
        if (this.state.paginate_rec_index > 0){
            if (this.state.paginate_rec_index - 1 === 0){
                this.setState({
                    canPaginateRightRecent: true
                })
            }
            else {
                this.setState({
                    canPaginateRightRecent: true
                })
            }
            var recent_platforms
            api.post('platformData/getRecentPlatforms', {user_id: this.state.id, index: this.state.paginate_rec_index - 1, max: 5})
                        .then(all_plat_ids => {
                            var platform_datas = all_plat_ids.data;
                            var platform_format_ids = [];
                            var index_dict = {};
                            for (var i = 0; i < platform_datas.length; i++){
                                platform_format_ids.push(platform_datas[i].platform_id);
                                index_dict[platform_datas[i].platform_id] = i;
                                platform_datas[i].plat_name = null;
                                platform_datas[i].owner = null;
                                platform_datas[i].is_public = null;
                                platform_datas[i].privacy_password = null;
                                platform_datas[i].cover_photo = null;
                                platform_datas[i].pages = null;
                            }
                            api.post('/platformFormat/returnFormats', {ids: platform_format_ids})
                            .then(all_plat_data_ids => {
                                var all_platforms = all_plat_data_ids.data;
                                for(var i = 0; i < all_platforms.length; i++){
                                    var specific_platform_format_id = all_platforms[i]._id;
                                    var correct_index = index_dict[specific_platform_format_id];
                                    platform_datas[correct_index].plat_name = all_platforms[i].plat_name;
                                    platform_datas[correct_index].owner = all_platforms[i].owner;
                                    platform_datas[correct_index].is_public = all_platforms[i].is_public;
                                    platform_datas[correct_index].privacy_password = all_platforms[i].privacy_password;
                                    platform_datas[correct_index].cover_photo = all_platforms[i].cover_photo;
                                    platform_datas[correct_index].pages = all_platforms[i].pages;  
                                }
                                recent_platforms = platform_datas.slice()
                                this.setState({recent_platforms: recent_platforms, paginate_rec_index: this.state.paginate_rec_index - 1});
                            })

                        })
        }
    }

    //TO DISABLE BUTTON, CHANGE MAX TO 6 AND SEE IF 6 ARE ACTUALLY RETURNED. IF 5 OR LESS, DISABLE BUTTON
    rightRecentPlatforms(){
        var recent_platforms
            api.post('platformData/getRecentPlatforms', {user_id: this.state.id, index: this.state.paginate_rec_index + 1, max: 6})
                        .then(all_plat_ids => {
                            var platform_datas
                            if (all_plat_ids.data.length > 5){
                                platform_datas = all_plat_ids.data.slice(0,5)
                                this.setState({
                                    canPaginateRightRecent: true
                                })
                            }
                            else {
                                platform_datas = all_plat_ids.data.slice(0, all_plat_ids.data.length)
                                this.setState({
                                    canPaginateRightRecent: false
                                })
                            }
                            var platform_format_ids = [];
                            var index_dict = {};
                            for (var i = 0; i < platform_datas.length; i++){
                                platform_format_ids.push(platform_datas[i].platform_id);
                                index_dict[platform_datas[i].platform_id] = i;
                                platform_datas[i].plat_name = null;
                                platform_datas[i].owner = null;
                                platform_datas[i].is_public = null;
                                platform_datas[i].privacy_password = null;
                                platform_datas[i].cover_photo = null;
                                platform_datas[i].pages = null;
                            }
                            api.post('/platformFormat/returnFormats', {ids: platform_format_ids})
                            .then(all_plat_data_ids => {
                                var all_platforms = all_plat_data_ids.data;
                                for(var i = 0; i < all_platforms.length; i++){
                                    var specific_platform_format_id = all_platforms[i]._id;
                                    var correct_index = index_dict[specific_platform_format_id];
                                    platform_datas[correct_index].plat_name = all_platforms[i].plat_name;
                                    platform_datas[correct_index].owner = all_platforms[i].owner;
                                    platform_datas[correct_index].is_public = all_platforms[i].is_public;
                                    platform_datas[correct_index].privacy_password = all_platforms[i].privacy_password;
                                    platform_datas[correct_index].cover_photo = all_platforms[i].cover_photo;
                                    platform_datas[correct_index].pages = all_platforms[i].pages;
                                    
                                    
                                }
                                recent_platforms = platform_datas.slice()
                                this.setState({recent_platforms: recent_platforms, paginate_rec_index: this.state.paginate_rec_index + 1});
                            })

                        })
    }

    clickUsePlatform(plat_id){
        //use platform

        const checkData = {
            id: this.state.id,
            platid: plat_id
        }

        api.post('/platformData/getSpecificPlatformData',checkData)
        .then(response => {
            if(response.data.length ===0)
            {
                const createPlatData = {
                    user_id : this.state.id,
                    platform_id : plat_id,
                    completed_pages :[],
                    is_favorited : false,
                    is_completed : false,
                    recently_played : new Date()
                }

                //create a platformData
                api.post('/platformData/add',createPlatData)
                .then(response => {
                    this.props.history.push("/useplatform/"+plat_id);
                })
                .catch(error => {
                    console.log(error.response)
                });
            }
            else
            {
                //platformData already exists 
                //update recently played

                const recentPlay = {
                    user_id : this.state.id,
                    platform_id : plat_id,
                    newRecentlyPlayed : new Date()
                }

                api.post('/platformData/updateRecentlyPlayed',recentPlay)

                //clearing the completed_pages 
                const info = {
                    id : plat_id
                }

                api.get('/platformFormat/getSpecificPlatformFormat/'+plat_id)
                .then(resp => {
                    if(response.data[0].is_completed === true && (response.data[0].completed_pages.length === resp.data[0].pages.length)){

                        const values = {
                            user_id : this.state.id,
                            platform_id : plat_id,
                        }
                        //clears the array to be empty 
                        api.post('/platformData/clearCompletedPage/',values)
                        .then()
                        .catch(err=>{
                            console.log(err.response)
                        })
                    }
                })
                .catch(error => {
                    console.log(error.response)
                });

                this.props.history.push("/useplatform/"+plat_id);
            }
        })
        .catch(error => {
            console.log(error.response)
        });
 
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
        var all_platform_formats;
        api.post('/platformFormat/getNonUserPlatforms/'+ this.state.username, {index: this.state.paginate_all_index, argumentForAllPlatforms: argumentForAllPlatforms, filterBy: filterBy, userSearch: searchBy})
        .then(all_plat_ids => {
            //Received array of platformFormat Ids
            var platform_formats = all_plat_ids.data;
            var platform_format_ids = [];
            var index_dict = {};
            for(var i = 0; i < platform_formats.length; i++){
                platform_format_ids.push(platform_formats[i]._id);
                index_dict[platform_formats[i]._id] = i;
                platform_formats[i].completed_pages = null;
                platform_formats[i].is_favorited = null;
                platform_formats[i].recently_played = null;
            }
            //Now query to receive the platform Data information for all ids in the array for that user
            api.post('/platformData/getAllPlatforms', {platformFormat_ids: platform_format_ids, user_id: this.state.id})
            .then(all_plat_data_ids => {
                // Received all platform data info for all platforms
                var all_platforms = all_plat_data_ids.data;

                for(var i = 0; i < all_platforms.length; i++){
                    var specific_platform_format_id = all_platforms[i].platform_id;
                    var correct_index = index_dict[specific_platform_format_id];
                    platform_formats[correct_index].completed_pages = all_platforms[i].completed_pages;
                    platform_formats[correct_index].is_favorited = all_platforms[i].is_favorited;
                    platform_formats[correct_index].recently_played = all_platforms[i].recently_played;
                }
                all_platform_formats = platform_formats.slice()
                //Platform_formats now holds all platforms that are published and haven't been created by the user
                this.setState({
                    all_platforms: platform_formats
                })
            })      
        });
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
                        {this.state.paginate_rec_index === 0
                        ?
                            <button disabled="true" style={{marginLeft: "70%", color:"grey"}} className = "paginate_arrows" onClick = {() => this.leftRecentPlatforms()}><FontAwesomeIcon icon={faAngleLeft} /></button>
                        :
                            <button style={{marginLeft: "70%"}} className = "paginate_arrows" onClick = {() => this.leftRecentPlatforms()}><FontAwesomeIcon icon={faAngleLeft} /></button>
                        }
                        {this.state.canPaginateRightRecent
                        ?
                            <button style={{marginLeft: "auto", marginRight: "3%"}} className = "paginate_arrows" onClick = {() => this.rightRecentPlatforms()}><FontAwesomeIcon icon={faAngleRight} /></button>
                        :
                            <button disabled="true" style={{marginLeft: "auto", marginRight: "3%", color: "grey"}} className = "paginate_arrows" onClick = {() => this.rightRecentPlatforms()}><FontAwesomeIcon icon={faAngleRight} /></button>
                        }

                    </div>
                    <div style={{display: "flex"}}>
                        {this.state.recent_platforms.map((platform, index) => (
                            <Card className = "card_top itemsContainer">
                            <FontAwesomeIcon className="play_button" icon={faPlay} />
                            <Card.Img variant="top" onClick={() => this.clickUsePlatform(platform.platform_id)} src={platform.cover_photo === "" ? DefaultCoverPhoto : platform.cover_photo} className = "card_image"/>
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
                        ))}
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
                                <Card.Img variant="top" onClick={() => this.clickUsePlatform(platform._id)} src={platform.cover_photo === "" ? DefaultCoverPhoto : platform.cover_photo} className = "card_image"/>
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
            </div>
        )
    }
}