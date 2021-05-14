import React, { Component } from 'react';
import {api} from "../axios_api.js";
import jwt from 'jsonwebtoken';
import jwt_decode from 'jwt-decode'
import "../format.css";
import Card from "react-bootstrap/Card"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faPlay, faAngleRight, faAngleLeft, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import DefaultCoverPhoto from "../images/defaultCoverPhoto.png"
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'
require('dotenv').config();


export default class Platform extends Component {
    constructor(props){
        super(props);

        this.clickUseCategory = this.clickUseCategory.bind(this);
        this.newestCategories = this.newestCategories.bind(this);
        this.mostPopular = this.mostPopular.bind(this);
        this.recentlyPlayed = this.recentlyPlayed.bind(this);
        this.unplayed = this.unplayed.bind(this);
        this.updatedContent = this.updatedContent.bind(this);

        this.state = {
            username: "",
            id: "",
            platformFormat: "",
            categoriesFormats:[]
        }

    }

    clickUseCategory(cat_id) {
        var platform_format_id = this.props.location.pathname.substring(10);
        
        var category = this.state.categoriesFormats.filter((category) => {
            return category._id === cat_id;
        })[0];
        //Update times_played counter for this category format
        var times_played = category.times_played + 1;

        api.post('/categoryFormat/increment_times_played', {_id: cat_id, times_played: times_played})
        .then()
        .catch(err => {
            console.log(err.response);
        })

        if(category.updatedAt === null){
            //Create new category data
            const createCategoryData = {
                user_id : this.state.id,
                category_id : category._id,
                completed_pages : [],
                current_progress : [],
                is_completed : false,
                accuracy : 0
            }

            //create a platformData
            api.post('/categoryData/add', createCategoryData)
            .then()
            .catch(error => {
                console.log(error.response)
            });
        }
        else{
            //Update updatedAt field for category data
            api.post('/categoryData/updatedAt', {user_id: this.state.id, category_format_id: cat_id});

            //Check if we need to clear currentProgress array
            var should_clear = true;
            for(let i = 0; i < category.pages.length; i++){
                if(!category.currentProgress_pages.includes(category.pages[i])){
                    should_clear = false;
                    break;
                }
            }
            if(should_clear){
                //clears the array to be empty 
                const values = {
                    user_id : this.state.id,
                    category_format_id : cat_id,
                }
                api.post('/categoryData/clearCurrentProgress/', values)
                .then(res => console.log(res))
                .catch(err=>{
                    console.log(err.response);
                })
            }
        }

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
                        var username = response.data.username;
                        var id = decoded._id;
                        // this.setState({username: response.data.username, id: decoded._id });

                        //grab the id of the platform 
                        var platform_format_id = this.props.location.pathname.substring(10);

                        
                        api.get('/platformFormat/getSpecificPlatformFormat/'+platform_format_id)
                        .then(response => {

                            const catFormatInfo = {
                                categories_id : response.data[0].categories
                            }

                            //gets every category format inside of categories array
                            api.post('/categoryFormat/getAllCategories/',catFormatInfo)
                            .then(res => {
                                var platformFormat = response.data[0];
                                var categoriesFormats = res.data;
                                var index_dict = {};
                                for(let i = 0; i < categoriesFormats.length; i++){
                                    index_dict[categoriesFormats[i]._id] = i;
                                    //Initialize all category data attributes as null
                                    categoriesFormats[i].accuracy = null;
                                    categoriesFormats[i].completed_pages = null;
                                    categoriesFormats[i].currentProgress_pages = null;
                                    categoriesFormats[i].is_completed = null;
                                    categoriesFormats[i].updatedAt = null;
                                    categoriesFormats[i].category_data_id = null;
                                }
                                const catDataInfo = {
                                    categories_id : platformFormat.categories,
                                    user_id: id
                                }
                                //Get every category data for every ID in catFormatInfo
                                api.post('/categoryData/getAllCategoryData', catDataInfo)
                                .then(catData => {
                                    var categoryData = catData.data;
                                    for(let i = 0; i < categoryData.length; i++){
                                        var specific_category_format_id = categoryData[i].category_id;
                                        var correct_index = index_dict[specific_category_format_id];
                                        categoriesFormats[correct_index].accuracy = categoryData[i].accuracy;
                                        categoriesFormats[correct_index].completed_pages = categoryData[i].completed_pages;
                                        categoriesFormats[correct_index].currentProgress_pages = categoryData[i].currentProgress_pages;
                                        categoriesFormats[correct_index].is_completed = categoryData[i].is_completed;
                                        categoriesFormats[correct_index].updatedAt = categoryData[i].updatedAt;
                                        categoriesFormats[correct_index].category_data_id = categoryData[i]._id;
                                    }
                                    this.setState({username: username, id: id, platformFormat: platformFormat, categoriesFormats: categoriesFormats})
                                })
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

    newestCategories(){
        //Sort all categories by date created
        var all_categories = this.state.categoriesFormats;
        var sorted_categories = [];
        if(all_categories.length > 0){
            //We can sort the array by date created
            sorted_categories = all_categories.sort((a, b) => (Date(a.createdAt) > Date(b.createdAt)) ? 1 : -1);
        }
        return(
            <div style={{display: "flex", flexWrap: "wrap"}}>
                {sorted_categories.map((category, index) => (
                        <Card className = "card_top itemsContainer">
                            <FontAwesomeIcon className="play_button" icon={faPlay} />
                            <Card.Img variant="top" onClick={() => this.clickUseCategory(category._id)} src={category.category_photo === "" ? DefaultCoverPhoto : category.category_photo} className = "card_image"/>
                            <Card.Body className = "card_body">
                                <Card.Title className = "card_info">{category.category_name}</Card.Title>
                                {category.is_completed === true
                                ?
                                <Card.Text className = "card_info">
                                    First Attempt Accuracy: {category.accuracy}%
                                </Card.Text>
                                :
                                <br></br>
                                }
                            </Card.Body>
                        </Card>
                        
                    ))}
            </div>
        )
    }

    mostPopular(){
        //Sort all categories by times_played
        var all_categories = this.state.categoriesFormats;
        var sorted_categories = [];
        if(all_categories.length > 0){
            //We can sort the array by times_played
            sorted_categories = all_categories.sort((a, b) => (a.times_played < b.times_played) ? 1 : -1);
        }
        return(
            <div style={{display: "flex", flexWrap: "wrap"}}>
                {sorted_categories.map((category, index) => (
                        <Card className = "card_top itemsContainer">
                            <FontAwesomeIcon className="play_button" icon={faPlay} />
                            <Card.Img variant="top" onClick={() => this.clickUseCategory(category._id)} src={category.category_photo === "" ? DefaultCoverPhoto : category.category_photo} className = "card_image"/>
                            <Card.Body className = "card_body">
                                <Card.Title className = "card_info">{category.category_name}</Card.Title>
                                {category.is_completed === true
                                ?
                                <Card.Text className = "card_info">
                                    First Attempt Accuracy: {category.accuracy}%
                                </Card.Text>
                                :
                                <br></br>
                                }
                            </Card.Body>
                        </Card>
                        
                    ))}
            </div>
        )
    }

    recentlyPlayed(){
        //Sort all categories by updatedAt
        var all_categories = this.state.categoriesFormats;
        var sorted_categories = [];
        if(all_categories.length > 0){
            //We can filter and then sort the array updatedAt
            sorted_categories = all_categories.filter((category) => {
                return category.updatedAt !== null;
            }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        }
        return(
            <div style={{display: "flex", flexWrap: "wrap"}}>
                {sorted_categories.length === 0
                ?
                <div style={{margin: "auto", marginTop: "1%", fontSize: "25px"}}>
                    You have not started any quizzes yet! Click on a quiz to begin learning
                </div>
                :
                sorted_categories.map((category, index) => (
                    <Card className = "card_top itemsContainer">
                        <FontAwesomeIcon className="play_button" icon={faPlay} />
                        <Card.Img variant="top" onClick={() => this.clickUseCategory(category._id)} src={category.category_photo === "" ? DefaultCoverPhoto : category.category_photo} className = "card_image"/>
                        <Card.Body className = "card_body">
                            <Card.Title className = "card_info">{category.category_name}</Card.Title>
                            {category.is_completed === true
                            ?
                            <Card.Text className = "card_info">
                                First Attempt Accuracy: {category.accuracy}%
                            </Card.Text>
                            :
                            <br></br>
                            }
                        </Card.Body>
                    </Card>
                    
                ))
                }
            </div>
        )
    }

    unplayed(){
        //Filter all categories by updatedAt === null
        var all_categories = this.state.categoriesFormats;
        var filter_categories = [];
        if(all_categories.length > 0){
            //We can filter the array by return updated === null
            filter_categories = all_categories.filter((category) => {
                return category.updatedAt === null;
            });
        }
        return(
            <div style={{display: "flex", flexWrap: "wrap"}}>
                {filter_categories.length === 0
                ?

                <div style={{margin: "auto", marginTop: "1%", fontSize: "25px"}}>
                    Congrats! You have played all of the quizzes for {this.state.platformFormat.plat_name}
                </div>

                :
                
                filter_categories.map((category, index) => (
                    <Card className = "card_top itemsContainer">
                        <FontAwesomeIcon className="play_button" icon={faPlay} />
                        <Card.Img variant="top" onClick={() => this.clickUseCategory(category._id)} src={category.category_photo === "" ? DefaultCoverPhoto : category.category_photo} className = "card_image"/>
                        <Card.Body className = "card_body">
                            <Card.Title className = "card_info">{category.category_name}</Card.Title>
                            {category.is_completed === true
                            ?
                            <Card.Text className = "card_info">
                                First Attempt Accuracy: {category.accuracy}%
                            </Card.Text>
                            :
                            <br></br>
                            }
                        </Card.Body>
                    </Card>
                    
                ))

                }
            </div>
        )
    }

    updatedContent(){
        var all_categories = this.state.categoriesFormats;
        var filtered_categories = [];
        if(all_categories.length > 0){
            //We can filter the array by return updatedAt !== null and if category.pages contains a pageID that is not in the respective category.completed_pages
            filtered_categories = all_categories.filter((category) => {
                var valid = (category.updatedAt !== null);
                if(!valid){
                    return false;
                }
                valid = false;
                for(let i = 0; i < category.pages.length; i++){
                    var current_pageID = category.pages[i];
                    if(!category.completed_pages.includes(current_pageID)){
                        valid = true;
                        break;
                    }
                }
                return valid;
            });
        }
        return(
            <div style={{display: "flex", flexWrap: "wrap"}}>
                {filtered_categories.length === 0
                ?
                <div style={{margin: "auto", marginTop: "1%", fontSize: "25px"}}>
                    None of the quizzes you have played have been recently updated
                </div>
                :
                filtered_categories.map((category, index) => (
                    <Card className = "card_top itemsContainer">
                        <FontAwesomeIcon className="play_button" icon={faPlay} />
                        <Card.Img variant="top" onClick={() => this.clickUseCategory(category._id)} src={category.category_photo === "" ? DefaultCoverPhoto : category.category_photo} className = "card_image"/>
                        <Card.Body className = "card_body">
                            <Card.Title className = "card_info">{category.category_name}</Card.Title>
                            {category.is_completed === true
                            ?
                            <Card.Text className = "card_info">
                                First Attempt Accuracy: {category.accuracy}%
                            </Card.Text>
                            :
                            <br></br>
                            }
                        </Card.Body>
                    </Card>
                    
                ))
                }
            </div>
        )
    }

    render() {
        
        return (
            <div style={{height: "100vh", background: "#edd2ae", verticalAlign:"middle", overflowY:"auto"}}>
                <div style={{width: "fit-content"}}>
                    <button style = {{margin: "auto", display: "flex", background: "transparent", border: "transparent", fontSize: "30px"}} onClick={() => this.props.history.push("/dashboard")}><FontAwesomeIcon icon={faArrowLeft} /></button>
                </div>
                <div style={{fontSize: "55px", textAlign: "center", textDecoration: "underline", fontFamily: "bold"}}> {this.state.platformFormat.plat_name}</div>
                <div>
                    <Tabs defaultActiveKey="newest" transition={false} id="noanim-tab-example" className = "tabs">
                        <Tab eventKey="newest" title="Newest Quizzes" className = "specific_tab">
                            {this.newestCategories()}
                        </Tab>
                        <Tab eventKey="popular" title="Most Popular All-Time" className = "specific_tab">
                            {this.mostPopular()}
                        </Tab>
                        <Tab eventKey="new_content" title="Updated Content" className = "specific_tab">
                            {this.updatedContent()}
                        </Tab>
                        <Tab eventKey="recently" title="Recently Played" className = "specific_tab"> 
                            {this.recentlyPlayed()}
                        </Tab>
                        <Tab eventKey="unplayed" title="Unplayed" className = "specific_tab"> 
                            {this.unplayed()}
                        </Tab>
                    </Tabs>
                </div>
            </div>
        )
    }
}