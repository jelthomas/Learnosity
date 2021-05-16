import React, { Component } from 'react';
import {api} from "../axios_api.js";
import jwt from 'jsonwebtoken';
import jwt_decode from 'jwt-decode'
import "../format.css";
import LoggedInNav from "./loggedInNav.component";
require('dotenv').config();

export default class Leaderboard extends Component {
    constructor(props){
        super(props);

        this.state = {
            username: "",
            id: "",
            all_users: []
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
                var all_users = [];
                api.get('/user/getSpecificUser/'+ decoded._id)
                .then(response => {
                    if (response) {
                        //Valid user
                        //Begin getting all users' statistics
                        
                        api.get('user/getAllUsers')
                        .then(res => {
                            var array_of_users = res.data;
                            for(let i = 0; i < array_of_users.length; i++){
                                all_users.push({username: array_of_users[i].username,
                                                experience_points: array_of_users[i].experience_points, 
                                                completed_quizzes: array_of_users[i].completed_categories,
                                                total_accuracy: array_of_users[i].total_accuracy.$numberDecimal})
                            }
                            all_users = all_users.sort((a, b) => (a.experience_points < b.experience_points) ? 1 : -1)
                            this.setState({
                                username: response.data.username, 
                                id: decoded._id,
                                all_users: all_users
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

    

    onChangeSortBy() {
        var e = document.getElementById("sort_by");
        var all_users = this.state.all_users;
        if (e !== null) {
            if (e.value === "experience"){
                all_users = all_users.sort((a, b) => (a.experience_points < b.experience_points) ? 1 : -1)
            }
            else if (e.value === "quizzes"){
                all_users = all_users.sort((a, b) => (a.completed_quizzes < b.completed_quizzes) ? 1 : -1)
            } 
            else if (e.value === "total_accuracy"){
                all_users = all_users.sort((a, b) => (a.total_accuracy < b.total_accuracy) ? 1 : -1)
            }
            this.setState({
                all_users: all_users
            })
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
                <LoggedInNav props={this.props} current={"leaderboard"}/>
                <div style={{display:"flex", marginLeft: "5%", marginRight: "5%", paddingTop: "15px"}}>
                    <div style={{textAlign: "center", width: "100%", fontSize: "35px"}} id="dash">Leaderboard</div>
                </div>
                <div style={{display: "flex", marginTop: "2%"}}>
                    <div className="dashboard_sort" style={{width: "26%", paddingLeft: "5px", margin: "auto"}}>
                        <input onChange={() => {}} id="userSearch" type="text" placeholder="Search By Username" style={{borderRadius: "10px", background: "white", borderColor: "transparent", width: "100%", outline: "none", height: '28px', fontSize: "20px"}}></input>
                    </div>
                    <div className="dashboard_sort" style={{margin: "auto"}}>
                        
                        <div style={{paddingLeft: "5px", fontSize: "20px"}}>
                            Sort By:
                            <select onChange = {() => this.onChangeSortBy()} defaultValue = "experience" id = "sort_by" style={{width: "70%", marginLeft: "6px", border: "transparent", borderRadius: "7px", outline:"none"}}>
                                <option value="experience">Experience</option>
                                <option value="quizzes">Completed Quizzes</option>
                                <option value="total_accuracy">Total Accuracy</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div style={{display: "flex", marginTop: "2%", color: "white"}}>
                    <div style={{margin: "auto", fontSize: "25px"}}>
                        Username
                    </div>
                    <div style={{margin: "auto", fontSize: "25px"}}>
                        Experience
                    </div>
                    <div style={{margin: "auto", fontSize: "25px"}}>
                        Completed Quizzes
                    </div>
                    <div style={{margin: "auto", fontSize: "25px"}}>
                        Total Accuracy
                    </div>
                </div>
                <div style={{marginLeft: "4%", marginRight: "4%", marginTop: "2%", background: "black", borderRadius: "5px", border: "1px solid #AFAFAF", fontSize: "20px"}}>
                    <div>
                            {this.state.all_users.map((user, index) => (
                                (index <= 2
                                ?
                                <div className = "row" style={{color: "gold", fontWeight: "700"}}>
                                    <div className = "name">
                                        {index + 1}. {user.username}
                                    </div>
                                    <div className = "experience" style={{}}>
                                        {user.experience_points}
                                    </div>
                                    <div className = "completed_quizzes" style={{}}>
                                        {user.completed_quizzes}
                                    </div>
                                    <div className = "total_accuracy" style={{}}>
                                        {user.total_accuracy}%
                                    </div>
                                </div>

                                :
                                <div className = "row">
                                    <div className = "name">
                                        {index + 1}. {user.username}
                                    </div>
                                    <div className = "experience" style={{}}>
                                        {user.experience_points}
                                    </div>
                                    <div className = "completed_quizzes" style={{}}>
                                        {user.completed_quizzes}
                                    </div>
                                    <div className = "total_accuracy" style={{}}>
                                        {user.total_accuracy}%
                                    </div>
                                </div>
                                )
                            ))}
                            </div>

                </div>

            </div>


            
        )
    }
}