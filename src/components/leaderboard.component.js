import React, { Component } from 'react';
import {api} from "../axios_api.js";
import jwt from 'jsonwebtoken';
import jwt_decode from 'jwt-decode'
import "../format.css";
import LoggedInNav from "./loggedInNav.component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight, faAngleLeft } from "@fortawesome/free-solid-svg-icons";
require('dotenv').config();

export default class Leaderboard extends Component {
    constructor(props){
        super(props);

        this.paginateRight = this.paginateRight.bind(this);
        this.paginateLeft = this.paginateLeft.bind(this);
        this.return_user_stats = this.return_user_stats.bind(this);

        this.state = {
            username: "",
            id: "",
            all_users: [],
            paginated_users: [],
            canPaginateRight: false,
            paginate_index: 0
        }

    }
    
    paginateLeft(){
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
                all_users = all_users.sort(function(a, b){return ((parseFloat(b.total_accuracy) / b.completed_quizzes).toFixed(2)  - (parseFloat(a.total_accuracy) / a.completed_quizzes).toFixed(2))})
            }

            for(var i = 0; i < all_users.length; i++){
                all_users[i].position = i+1;
            }
            var paginated_users = all_users;
            var canPaginateRight = false;
            var userSearch = document.getElementById("userSearch").value;
            if(userSearch !== ''){
                paginated_users = paginated_users.filter((a) => {return a.username.toLowerCase().startsWith(userSearch)})
            }
            var temp_paginated_users = paginated_users.slice();
            var paginate_index = this.state.paginate_index - 1;
            paginated_users = paginated_users.slice(paginate_index * 15, (paginate_index + 1)*15);
            
            this.setState({paginate_index: paginate_index, paginated_users: paginated_users, canPaginateRight: temp_paginated_users.length > (paginate_index + 1)*15})
        }
    }

    return_user_stats(){
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
                all_users = all_users.sort(function(a, b){return ((parseFloat(b.total_accuracy) / b.completed_quizzes).toFixed(2)  - (parseFloat(a.total_accuracy) / a.completed_quizzes).toFixed(2))})
            }

            for(var i = 0; i < all_users.length; i++){
                all_users[i].position = i+1;
            }
            
            var username = this.state.username;
            var users_exp = '';
            var users_accuracy = '';
            var users_completed_quizzes = '';
            var users_position = '';

            for(var i = 0; i < all_users.length; i++){
                if(all_users[i].username === username){
                    users_exp = all_users[i].experience_points;
                    users_accuracy = all_users[i].total_accuracy;
                    users_completed_quizzes = all_users[i].completed_quizzes;
                    users_position = all_users[i].position;
                    break;
                }
            }
            
            return (
                <div style={{marginLeft: "4%", marginRight: "4%", marginTop: "-2%", marginBottom: "4%", background: "black", borderRadius: "5px", border: "1px solid #AFAFAF", fontSize: "20px"}}>
                    <div style = {{color: "rgb(0,219,0)"}} className = "row">
                        <div className = "name">
                            {users_position}. {username}
                        </div>
                        <div className = "experience" style={{}}>
                            {users_exp}
                        </div>
                        <div className = "completed_quizzes" style={{}}>
                            {users_completed_quizzes}
                        </div>
                        <div className = "total_accuracy" style={{}}>
                            {users_completed_quizzes === 0 ? 0 : (users_accuracy / users_completed_quizzes).toFixed(2)}%
                        </div>
                    </div>
                </div>
            )
        }
    }

    paginateRight(){
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
                all_users = all_users.sort(function(a, b){return ((parseFloat(b.total_accuracy) / b.completed_quizzes).toFixed(2)  - (parseFloat(a.total_accuracy) / a.completed_quizzes).toFixed(2))})
            }

            for(var i = 0; i < all_users.length; i++){
                all_users[i].position = i+1;
            }
            var paginated_users = all_users;
            var canPaginateRight = false;
            var userSearch = document.getElementById("userSearch").value;
            if(userSearch !== ''){
                paginated_users = paginated_users.filter((a) => {return a.username.toLowerCase().startsWith(userSearch)})
            }
            
            var temp_paginated_users = paginated_users.slice();
            var paginate_index = this.state.paginate_index + 1;
            paginated_users = paginated_users.slice(paginate_index * 15, (paginate_index + 1)*15);
           
            this.setState({paginate_index: paginate_index, paginated_users: paginated_users, canPaginateRight: temp_paginated_users.length > (paginate_index + 1)*15})
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
                                                total_accuracy: array_of_users[i].total_accuracy.$numberDecimal,
                                                position: i+1})
                            }
                            all_users = all_users.sort((a, b) => (a.experience_points < b.experience_points) ? 1 : -1)
                            for(let i = 0; i < all_users.length; i++){
                                all_users[i].position = i+1;
                            }
                            var paginated_users = all_users;
                            if(all_users.length > 15){
                                paginated_users = all_users.slice(0,15);
                            }
                            this.setState({
                                username: response.data.username, 
                                id: decoded._id,
                                all_users: all_users,
                                paginated_users: paginated_users,
                                canPaginateRight: all_users.length > 15
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
                all_users = all_users.sort(function(a, b){return ((parseFloat(b.total_accuracy) / b.completed_quizzes).toFixed(2)  - (parseFloat(a.total_accuracy) / a.completed_quizzes).toFixed(2))})
            }

            for(var i = 0; i < all_users.length; i++){
                all_users[i].position = i+1;
            }
            var paginated_users = all_users;
            var canPaginateRight = false;
            var userSearch = document.getElementById("userSearch").value;
            if(userSearch !== ''){
                paginated_users = paginated_users.filter((a) => {return a.username.toLowerCase().startsWith(userSearch)})
            }
            if(paginated_users.length > 15){
                paginated_users = paginated_users.slice(0, 15);
                canPaginateRight = true;
            }

            this.setState({
                paginated_users: paginated_users,
                paginate_index: 0,
                canPaginateRight: canPaginateRight,
                all_users: all_users
            })
        }
    }

    
    searchPlatforms(e) {
            // var sorted_by = document.getElementById("sort_by").value;
            var userSearch = document.getElementById("userSearch").value;
            if(userSearch.trim() === ''){
                document.getElementById("userSearch").value = '';
                this.setState({paginated_users: this.state.all_users.slice(0, 15), canPaginateRight: this.state.all_users.length > 15})
                return;
            }
            var all_users = this.state.all_users;
            var paginated_users = [];
            paginated_users = all_users.filter((a) => {return a.username.toLowerCase().startsWith(userSearch)})

            this.setState({paginated_users: paginated_users, paginate_index: 0, canPaginateRight: paginated_users.length > 15})
        
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
                        <input onChange={() => {this.searchPlatforms()}} id="userSearch" type="text" placeholder="Search By Username" style={{borderRadius: "10px", background: "white", borderColor: "transparent", width: "100%", outline: "none", height: '28px', fontSize: "20px"}}></input>
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
                    <div style={{margin: "auto", display: "flex"}}>
                    {this.state.paginate_index === 0
                        ?
                            <button disabled={true} style={{marginRight: "50%", color:"grey"}} className = "paginate_arrows" onClick = {() => this.paginateLeft()}><FontAwesomeIcon icon={faAngleLeft} /></button>
                        :
                            <button style={{marginRight: "50%"}} className = "paginate_arrows" onClick = {() => this.paginateLeft()}><FontAwesomeIcon icon={faAngleLeft} /></button>
                        }
                        {this.state.canPaginateRight
                        ?
                            <button  className = "paginate_arrows" onClick = {() => this.paginateRight()}><FontAwesomeIcon icon={faAngleRight} /></button>
                        :
                            <button disabled={true} style={{color: "grey"}} className = "paginate_arrows" onClick = {() => this.paginateRight()}><FontAwesomeIcon icon={faAngleRight} /></button>
                        }
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
                <div style={{marginLeft: "4%", marginRight: "4%", marginTop: "2%", marginBottom: "4%", background: "black", borderRadius: "5px", border: "1px solid #AFAFAF", fontSize: "20px"}}>
                        <div>
                            {this.state.paginated_users.length > 0
                            ?
                            (this.state.paginated_users.map((user, index) => (
                                (user.position < 4
                                ?
                                <div className = "row" style={{color: "gold", fontWeight: "700"}}>
                                    <div className = "name">
                                        {user.position}. {user.username}
                                    </div>
                                    <div className = "experience" style={{}}>
                                        {user.experience_points}
                                    </div>
                                    <div className = "completed_quizzes" style={{}}>
                                        {user.completed_quizzes}
                                    </div>
                                    <div className = "total_accuracy" style={{}}>
                                        {user.completed_quizzes === 0 ? 0 : (user.total_accuracy / user.completed_quizzes).toFixed(2)}%
                                    </div>
                                </div>

                                :
                                <div className = "row">
                                    <div className = "name">
                                        {user.position}. {user.username}
                                    </div>
                                    <div className = "experience" style={{}}>
                                        {user.experience_points}
                                    </div>
                                    <div className = "completed_quizzes" style={{}}>
                                        {user.completed_quizzes}
                                    </div>
                                    <div className = "total_accuracy" style={{}}>
                                        {user.completed_quizzes === 0 ? 0 : (user.total_accuracy / user.completed_quizzes).toFixed(2)}%
                                    </div>
                                </div>
                                )
                            )))
                        
                            :
                            <div style={{margin: "auto", width: "fit-content", color: "white", fontSize: "25px"}}>
                                No users were found
                            </div>
                            }
                        </div>
                </div>
                {this.state.paginated_users.some(obj => obj.username === this.state.username)
                            
                ?
                <br></br>
                :
                    this.return_user_stats()
                }
            </div>


            
        )
    }
}