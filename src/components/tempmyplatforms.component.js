import React, { Component } from 'react';
import {api} from "../axios_api.js";
import jwt from 'jsonwebtoken';
import jwt_decode from 'jwt-decode'
import "../format.css";
import Card from "react-bootstrap/Card"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faPlay, faAngleRight, faAngleLeft,faPencilAlt} from "@fortawesome/free-solid-svg-icons";
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

export default class TempMyPlatforms extends Component {
    constructor(props){
        super(props);

        this.paginateRightCreated = this.paginateRightCreated.bind(this);
        this.paginateLeftCreated = this.paginateLeftCreated.bind(this);
        this.paginateRightFavorited = this.paginateRightFavorited.bind(this);
        this.paginateLeftFavorited = this.paginateLeftFavorited.bind(this);

        this.editPlatform = this.editPlatform.bind(this);
        this.clickPlatform = this.clickPlatform.bind(this);
        this.unFavoritePlatform = this.unFavoritePlatform.bind(this);

        this.state = {
            userFormat:'',
            all_created_platforms:[],
            paginate_created_platforms:[],
            all_favorited_platforms:[],
            paginate_favorited_platforms:[],
            recent_played_platforms:[],
            created_paginate_index:0,
            favorited_paginate_index:0,
            canPaginateRightCreated:false,
            canPaginateRightFavorited:false
        }

    }

    paginateRightCreated(){
        var tempAllCreated = this.state.all_created_platforms

        var paginateCreated = this.state.all_created_platforms

        var pagCreatedIndex = this.state.created_paginate_index + 1;

        paginateCreated = paginateCreated.slice(pagCreatedIndex * 5, (pagCreatedIndex+ 1)*5);

        this.setState({created_paginate_index: pagCreatedIndex, paginate_created_platforms: paginateCreated, canPaginateRightCreated: tempAllCreated.length > (pagCreatedIndex + 1)*5})
    }

    paginateLeftCreated(){
        var tempAllCreated = this.state.all_created_platforms

        var paginateCreated = this.state.all_created_platforms

        var pagCreatedIndex = this.state.created_paginate_index - 1;

        paginateCreated = paginateCreated.slice(pagCreatedIndex * 5, (pagCreatedIndex+ 1)*5);

        this.setState({created_paginate_index: pagCreatedIndex, paginate_created_platforms: paginateCreated, canPaginateRightCreated: tempAllCreated.length > (pagCreatedIndex + 1)*5})
    }

    paginateRightFavorited(){
        var tempAllFavorited = this.state.all_favorited_platforms

        var paginateFavorited = this.state.all_favorited_platforms

        var pagFavoritedIndex = this.state.favorited_paginate_index + 1;

        paginateFavorited = paginateFavorited.slice(pagFavoritedIndex * 5, (pagFavoritedIndex+ 1)*5);

        this.setState({favorited_paginate_index: pagFavoritedIndex, paginate_favorited_platforms: paginateFavorited, canPaginateRightFavorited: tempAllFavorited.length > (pagFavoritedIndex + 1)*5})
    }

    paginateLeftFavorited(){
        var tempAllFavorited = this.state.all_favorited_platforms

        var paginateFavorited = this.state.all_favorited_platforms

        var pagFavoritedIndex = this.state.favorited_paginate_index - 1;

        paginateFavorited = paginateFavorited.slice(pagFavoritedIndex * 5, (pagFavoritedIndex+ 1)*5);

        this.setState({favorited_paginate_index: pagFavoritedIndex, paginate_favorited_platforms: paginateFavorited, canPaginateRightFavorited: tempAllFavorited.length > (pagFavoritedIndex + 1)*5})
    }
    editPlatform(plat_id){
        this.props.history.push("/editplatform/"+plat_id);
    }

    clickPlatform(plat_id){
        //need to check if platform is private and if we need to enter pass to enter 
        var recent_plats = this.state.recent_played_platforms
        if(!recent_plats.includes(plat_id))
        {
            recent_plats.unshift(plat_id)
        }
        else
        {
            var ind = recent_plats.indexOf(plat_id)
            recent_plats.splice(ind,1)
            recent_plats.unshift(plat_id)
        }

    }

    unFavoritePlatform(ind)
    {
        //variables with favorited platforms and paginated favorited platforms
        var tempPagFavorite = this.state.paginate_favorited_platforms
        var tempAllFavorited = this.state.all_favorited_platforms
        var pagFavInd = this.state.favorited_paginate_index


        //grabs the particular id 
        var id = tempPagFavorite[ind]._id

        //filters the all favorited to remove the id 
        //used to set the favorited in database 
        tempAllFavorited  = tempAllFavorited .filter(function( obj ) {
            return obj._id !== id;
        });
        
        //need to remake the paginate index based on removed tempAllFavorited
        //theres a chance that we will need to readjust the index if values dont exist at that index 

        var newPagFav = tempAllFavorited.slice(pagFavInd * 5, (pagFavInd+ 1)*5)
        //var newPagFav = tempAllFavorited.slice(100 * 5, (100+ 1)*5)
        if(newPagFav.length === 0 && pagFavInd !== 0)
        {
            pagFavInd = pagFavInd - 1 
            newPagFav = tempAllFavorited.slice(pagFavInd * 5, (pagFavInd+ 1)*5)
        }

        //update Backend Favorited Array
        //setStates inside 

        api.post('/user/updateFavoritePlatforms',{userID:this.state.userFormat._id,fav_plats : tempAllFavorited})
        .then(res=>{
            this.setState({all_favorited_platforms:tempAllFavorited,paginate_favorited_platforms:newPagFav,favorited_paginate_index:pagFavInd})
        })
        .catch(err=>{
            console.log(err.response)
        })
       
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
                        var created_platforms = response.data.created_platforms;
                        var favorite_platforms = response.data.favorited_platforms;
                        var user_recent_platforms = response.data.recent_platforms;

                        api.post('/platformFormat/getAllPlatforms',{created_platform_ids: created_platforms})
                        .then(res2=>{
                            
                            // this.setState({all_created_platforms:res2.data})
                            api.post('/platformFormat/getAllPlatforms',{created_platform_ids: favorite_platforms})
                            .then(res3=>{

                                var pagCreated;
                                var pagFavorited;
                                if(res2.data.length > 5)
                                {
                                    pagCreated = res2.data.slice(0,5)
                                }
                                else
                                {
                                    pagCreated = res2.data
                                }

                                if(res3.data.length > 5)
                                {
                                    pagFavorited = res3.data.slice(0,5)
                                }
                                else
                                {
                                    pagFavorited = res3.data
                                }
                                this.setState({
                                                all_created_platforms:res2.data,
                                                all_favorited_platforms:res3.data,
                                                paginate_created_platforms:pagCreated,
                                                paginate_favorited_platforms:pagFavorited,
                                                canPaginateRightCreated:res2.data.length > 5,
                                                canPaginateRightFavorited:res3.data.length > 5,
                                                recent_played_platforms:response.data.recent_platforms,
                                                userFormat : response.data
                                            })
                            })
                            .catch(err3=>{
                                console.log(err3.response)
                            })
                        })
                        .catch(err2=>{
                            console.log(err2.response)
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

    render() {
        return(
            <div>
                <LoggedInNav props={this.props} current={"myplatform"}/>
                <div style={{display:"flex", marginLeft: "5%", marginRight: "5%", paddingTop: "15px"}}>
                    <div style={{textAlign: "center", width: "100%",fontSize: "35px"}} id="dash">My Platforms</div>
                </div>
                <div style={{marginLeft: "2.5%", marginRight: "2.5%"}} className="block">
                    <div className="top_block" style={{display: "flex"}}>
                    <div className="white_text">
                        Your Created Platforms
                    </div>

                    {this.state.created_paginate_index === 0
                    ?
                        <button disabled={true} style={{marginLeft: "70%", color:"grey"}} className = "paginate_arrows" onClick = {() => this.paginateLeftCreated()}><FontAwesomeIcon icon={faAngleLeft} /></button>
                    :
                        <button style={{marginLeft: "70%"}} className = "paginate_arrows" onClick = {() => this.paginateLeftCreated()}><FontAwesomeIcon icon={faAngleLeft} /></button>
                    }
                    {this.state.canPaginateRightCreated
                    ?
                        <button style={{marginLeft: "auto", marginRight: "3%"}} className = "paginate_arrows" onClick = {() => this.paginateRightCreated()}><FontAwesomeIcon icon={faAngleRight} /></button>
                    :
                        <button disabled={true} style={{marginLeft: "auto", marginRight: "3%", color: "grey"}} className = "paginate_arrows" onClick = {() => this.paginateRightCreated()}><FontAwesomeIcon icon={faAngleRight} /></button>
                    }

                    
                    </div>
                    <div style={{display: "flex", flexWrap: "wrap"}}>
                            {this.state.paginate_created_platforms.map((platform, index) => (
                                <Card className = "card_top itemsContainer">
                                <FontAwesomeIcon className="play_button" icon={faPencilAlt} />
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
                <div style={{marginLeft: "2.5%", marginRight: "2.5%",marginBottom:"5%"}} className="block">
                     <div className="top_block" style={{display: "flex"}}>
                         <div className="white_text">
                             Your Favorite Platforms
                         </div>

                    {this.state.favorited_paginate_index === 0
                    ?
                        <button disabled={true} style={{marginLeft: "70%", color:"grey"}} className = "paginate_arrows" onClick = {() => this.paginateLeftFavorited()}><FontAwesomeIcon icon={faAngleLeft} /></button>
                    :
                        <button style={{marginLeft: "70%"}} className = "paginate_arrows" onClick = {() => this.paginateLeftFavorited()}><FontAwesomeIcon icon={faAngleLeft} /></button>
                    }
                    {this.state.canPaginateRightFavorited
                    ?
                        <button style={{marginLeft: "auto", marginRight: "3%"}} className = "paginate_arrows" onClick = {() => this.paginateRightFavorited()}><FontAwesomeIcon icon={faAngleRight} /></button>
                    :
                        <button disabled={true} style={{marginLeft: "auto", marginRight: "3%", color: "grey"}} className = "paginate_arrows" onClick = {() => this.paginateRightFavorited()}><FontAwesomeIcon icon={faAngleRight} /></button>
                    }

                    </div>
                    <div style={{display: "flex", flexWrap: "wrap"}}>
                        {this.state.paginate_favorited_platforms.length > 0
                        ?
                        (this.state.paginate_favorited_platforms.map((platform, index) => (
                            <Card className = "card_top itemsContainer">
                            <FontAwesomeIcon className="play_button" icon={faPlay} />
                            <Card.Img variant="top" onClick={() => this.editPlatform(platform._id)} src={platform.cover_photo === "" ? DefaultCoverPhoto : platform.cover_photo} className = "card_image"/>
                                <Card.Body className = "card_body">
                                    <Card.Title className = "card_info">{platform.plat_name}</Card.Title>
                                    <Card.Text className = "card_info">
                                    {platform.owner}
                                    </Card.Text>
                                    <div style={{width: "fit-content"}} onClick={() => this.unFavoritePlatform(index)}>
                                        <FavoriteButton isfavorited={true}/>
                                    </div>
                                </Card.Body>
                            </Card>
                        )))
                        :
                            <div style={{fontSize: "25px", width: "fit-content", color: "white", marginLeft: "3%"}}>
                                You have not favorited any platforms yet! Click on the star button to favorite one
                            </div>
                        }
                        </div>
                </div>
            </div>
        )
    }
}