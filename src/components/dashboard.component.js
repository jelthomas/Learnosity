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

        this.state = {
            username: "",
            id: "",
            search: '',
            sort_by: '',
            privacy_filter: '',
            recent_platforms: [],
            get_recent: true,
            get_all: true,
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
                var all_platform_formats
                var recent_platforms
                api.get('/user/'+ decoded._id)
                .then(response => {
                    if (response) {
                        //Valid user
                        this.setState({username: response.data.username, id: decoded._id});
                        
                        //Get array of PlatformFormat Ids (where owner != username and is_published = true)
                        api.post('/platformFormat/'+ response.data.username, {index: this.state.paginate_all_index})
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
                            api.post('/platformData/getAllPlatforms', {platformFormat_ids: platform_format_ids, user_id: decoded._id})
                            .then(all_plat_data_ids => {
                                // Received all platform data info for all platforms
                                var all_platforms = all_plat_data_ids.data;

                                for(var i = 0; i < all_platforms.length; i++){
                                    var specific_platform_format_id = all_platforms[i].platform_id;
                                    var correct_index = index_dict[specific_platform_format_id];
                                    console.log("GETTING ALL PLATFORM VALUES " + all_platforms[i])
                                    //platform_formats[correct_index] = all_platforms[i]
                                // platform_formats[correct_index].platform_id = all_platforms[i].platform_id;
                                    platform_formats[correct_index].completed_pages = all_platforms[i].completed_pages;
                                    platform_formats[correct_index].is_favorited = all_platforms[i].is_favorited;
                                    platform_formats[correct_index].recently_played = all_platforms[i].recently_played;
                                }
                                all_platform_formats = platform_formats.slice()
                                //Platform_formats now holds all platforms that are published and haven't been created by the user

                                //Start of getting the recent platforms 
                        api.post('/platformFormat/'+ response.data.username, {index: this.state.paginate_rec_index})
                        .then(all_plat_ids => {
                            //Received array of platformFormat Ids
                            var platform_formats = all_plat_ids.data;
                            var platform_format_ids = [];
                            var index_dict = {};
                            console.log("Print this if update is getting called")
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
                                    console.log("GETTING ALL PLATFORM VALUES " + all_platforms[i])
                                    //platform_formats[correct_index] = all_platforms[i]
                                // platform_formats[correct_index].platform_id = all_platforms[i].platform_id;
                                    platform_formats[correct_index].completed_pages = all_platforms[i].completed_pages;
                                    platform_formats[correct_index].is_favorited = all_platforms[i].is_favorited;
                                    platform_formats[correct_index].recently_played = all_platforms[i].recently_played;
                                }
                                //Platform_formats now holds all platforms that are published and haven't been created by the user

                                //Filter platform_formats to get the first 5 recent (within a month recently played)
                                recent_platforms = platform_formats.filter(function(platform) {
                                    var d = new Date();
                                    d.setMonth(d.getMonth() - 1);
                                    return platform.recently_played != null && Date.parse(platform.recently_played) >= d;
                                }).sort((a, b) => (a.recently_played < b.recently_played) ? 1 : -1);
                                this.setState({all_platforms: all_platform_formats, get_all: false, recent_platforms: recent_platforms, username: response.data.username, id: decoded._id});                           
                            })      
                        });

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
        api.post('/platformData/toggleFavorited', {id: recent_plats[index]._id, user_id: this.state.id, is_favorited: recent_plats[index].is_favorited})
        .then(recent_plats => console.log(recent_plats));

        this.setState({recent_platforms: recent_plats});
    }

    toggleFavoriteAll(index){
        //Update is_favorited attribute for all platform at index
        var all_plats = this.state.all_platforms;

        //Check if we need to create a new platform Data object
        var create_new = (all_plats[index].is_favorited === null);

        if(!create_new){
            //Negatve value of currently is_favorited
            all_plats[index].is_favorited = !all_plats[index].is_favorited;

            //Update value in the database using api call
            api.post('/platformData/toggleFavorited', {id: all_plats[index]._id, user_id: this.state.id, is_favorited: all_plats[index].is_favorited})
            .then(all_plats => console.log(all_plats));

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
            .then(response => {
                console.log(response)
            })
            .catch(error => {
                console.log(error.response)
            });
        }
    }

    leftAllPlatforms(){
        if (this.state.paginate_all_index > 0){
            var all_platform_formats  
            api.post('/platformFormat/'+ this.state.username, {index: this.state.paginate_all_index - 1, max: 20})
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
                        console.log("GETTING ALL PLATFORM VALUES " + all_platforms[i])
                        //platform_formats[correct_index] = all_platforms[i]
                       // platform_formats[correct_index].platform_id = all_platforms[i].platform_id;
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
        api.post('/platformFormat/'+ this.state.username, {index: this.state.paginate_all_index + 1, max: 20})
            .then(all_plat_ids => {
                if (all_plat_ids.data.length === 0){
                    return
                }
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
                        console.log("GETTING ALL PLATFORM VALUES " + all_platforms[i])
                        //platform_formats[correct_index] = all_platforms[i]
                       // platform_formats[correct_index].platform_id = all_platforms[i].platform_id;
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
            var recent_platforms
            api.post('/platformFormat/'+ this.state.username, {index: this.state.paginate_rec_index - 1, max: 5})
            .then(all_plat_ids => {
                //Received array of platformFormat Ids
                var platform_formats = all_plat_ids.data;
                var platform_format_ids = [];
                var index_dict = {};
                console.log("Print this if update is getting called")
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
                        console.log("GETTING ALL PLATFORM VALUES " + all_platforms[i])
                        //platform_formats[correct_index] = all_platforms[i]
                       // platform_formats[correct_index].platform_id = all_platforms[i].platform_id;
                        platform_formats[correct_index].completed_pages = all_platforms[i].completed_pages;
                        platform_formats[correct_index].is_favorited = all_platforms[i].is_favorited;
                        platform_formats[correct_index].recently_played = all_platforms[i].recently_played;
                    }
                    //Platform_formats now holds all platforms that are published and haven't been created by the user

                    //Filter platform_formats to get the first 5 recent (within a month recently played)
                    recent_platforms = platform_formats.filter(function(platform) {
                        var d = new Date();
                        d.setMonth(d.getMonth() - 1);
                        return platform.recently_played != null && Date.parse(platform.recently_played) >= d;
                    }).sort((a, b) => (a.recently_played < b.recently_played) ? 1 : -1);
                    this.setState({recent_platforms: recent_platforms, paginate_rec_index: this.state.paginate_rec_index -1});

                    
                })      
            });
        }
    }

    rightRecentPlatforms(){
        var recent_platforms
            api.post('/platformFormat/'+ this.state.username, {index: this.state.paginate_rec_index + 1, max: 5})
            .then(all_plat_ids => {
                if (all_plat_ids.data.length === 0){
                    return
                }
                //Received array of platformFormat Ids
                var platform_formats = all_plat_ids.data;
                var platform_format_ids = [];
                var index_dict = {};
                console.log("Print this if update is getting called")
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
                        console.log("GETTING ALL PLATFORM VALUES " + all_platforms[i])
                        //platform_formats[correct_index] = all_platforms[i]
                       // platform_formats[correct_index].platform_id = all_platforms[i].platform_id;
                        platform_formats[correct_index].completed_pages = all_platforms[i].completed_pages;
                        platform_formats[correct_index].is_favorited = all_platforms[i].is_favorited;
                        platform_formats[correct_index].recently_played = all_platforms[i].recently_played;
                    }
                    //Platform_formats now holds all platforms that are published and haven't been created by the user

                    //Filter platform_formats to get the first 5 recent (within a month recently played)
                    recent_platforms = platform_formats.filter(function(platform) {
                        var d = new Date();
                        d.setMonth(d.getMonth() - 1);
                        return platform.recently_played != null && Date.parse(platform.recently_played) >= d;
                    }).sort((a, b) => (a.recently_played < b.recently_played) ? 1 : -1);
                    this.setState({recent_platforms: recent_platforms, paginate_rec_index: this.state.paginate_rec_index +1});

                    
                })      
            });
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
                console.log("platform Data does not exist ")

                const createPlatData = {
                    user_id : this.state.id,
                    platform_id : plat_id,
                    completed_pages :[],
                    is_favorited : false,
                    is_completed : false,
                    recently_played : new Date()
                }

                //create a platformData
                api.post('/platformData/add', createPlatData)
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
                console.log("platform Data EXISTS")
                console.log(response)

                const recentPlay = {
                    user_id : this.state.id,
                    platform_id : plat_id,
                    newRecentlyPlayed : new Date()
                }

                api.post('/platformData/updateRecentlyPlayed',recentPlay)
                // .then(response => {
                //     console.log(response)
                // })
                // .catch(error => {
                //     console.log(error.response)
                // });

                //clearing the completed_pages 
                const info = {
                    id : plat_id
                }

                api.post('/platformFormat/getSpecificPlatformFormat/',info)
                .then(resp => {
                    // console.log(resp.data[0].pages.length)
                    // console.log(response.data[0].completed_pages.length)
                    if(response.data[0].is_completed === true && (response.data[0].completed_pages.length === resp.data[0].pages.length)){
                        console.log("EQUAL PAGE AMOUNTS")

                        const values = {
                            user_id : this.state.id,
                            platform_id : plat_id,
                        }
                        //clears the array to be empty 
                        api.post('/platformData/clearCompletedPage/',values)
                        .then(resp2 =>{
                            console.log(resp2)
                        })
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
                            <button onClick = {() => this.leftRecentPlatforms()}>Page Left</button>
                            <button onClick = {() => this.rightRecentPlatforms()}>Page Right</button>
                        </div>
                    </div>
                    <div style={{display: "flex"}}>
                        
                        {this.state.recent_platforms.map((platform, index) => (
                            <Card className = "card_top">
                            <Card.Img variant="top" onClick={() => this.clickUsePlatform(platform._id)} src={platform.cover_photo} className = "card_image"/>
                                <Card.Body className = "card_body">
                                    <Card.Title className = "card_info">{platform.plat_name}</Card.Title>
                                    <Card.Text className = "card_info">
                                    {platform.owner}
                                    </Card.Text>
                                    <div onClick={() => this.toggleFavoriteRecent(index)}>
                                        <FavoriteButton isfavorited={platform.is_favorited}/>
                                    </div>
                                </Card.Body>
                            </Card>
                        ))}
                    </div>
                </div>
                <div style={{marginLeft: "2.5%", marginRight: "2.5%"}} className="block">
                    <div className="top_block">
                        <div className="white_text">
                            Explore All Learning Platforms
                            <button onClick = {() => this.leftAllPlatforms()}>Page Left</button>
                            <button onClick = {() => this.rightAllPlatforms()}>Page Right</button>
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
                            { (this.state.all_platforms !== undefined
                                        ?
                                        this.state.all_platforms.map((platform, index) => (
                                            <Card className = "card_top">
                                            <Card.Img variant="top"  onClick={() => this.clickUsePlatform(platform._id)} src={platform.cover_photo} className = "card_image"/>
                                                <Card.Body className = "card_body">
                                                    <Card.Title className = "card_info">{platform.plat_name}</Card.Title>
                                                    <Card.Text className = "card_info">
                                                    {platform.owner}
                                                    </Card.Text>
                                                    <div onClick={() => this.toggleFavoriteAll(index)}>
                                                        <FavoriteButton isfavorited={platform.is_favorited}/>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        ))
                                        :
                                            <p>HELLO MY FRIENDS</p>
                                        )
                                }
                            </div>
                        </div>
                </div>
            </div>
        )
    }
}