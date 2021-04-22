import React, { Component } from 'react';
import {api} from "../axios_api.js";
import jwt from 'jsonwebtoken';
import { Link } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import ProgressBar from 'react-bootstrap/ProgressBar'
import flag from "../images/REDFLAG.png"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFlag } from "@fortawesome/free-regular-svg-icons";

export default class UsePlatform extends Component {
    constructor(props){
        super(props);

        this.continueButton = this.continueButton.bind(this);
        this.shuffleArray = this.shuffleArray.bind(this);
        this.submitMC = this.submitMC.bind(this);
        
        this.state = {
            user_id: '',
            username: '',
            plat_id: '',
            platData_id: '',
            pageIndex: '',
            filterPages: '',
            currentPage: '',
            progressVal: 0,
            progressIncrement: 0,
            completedPlatform: false,
            submittedAnswer: false,
            shouldShuffle: true,
            current_mc_array: [],
            submitted_answer_bool: false
        }
    }

    componentDidMount(){
        var token = localStorage.getItem('usertoken');
        var validToken = false;
        if(token){
            //Token in session storage
            jwt.verify(token, "jwt_key", function(err,res) {
                if(err){
                    //Improper JWT format 
                    //Remove token and redirect back to home
                    localStorage.removeItem('usertoken');
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
                        var user_id = response.data._id;

                        //Use platform format ID to grab all data
                        var platform_format_id = this.props.location.pathname.substring(13);

                        api.get('platformFormat/getPages/'+platform_format_id)
                        .then(response => {
                            //Successfully received pages_array
                            var pages_array = response.data.pages;
                            
                            //Now receive all pageFormat info ordered by its order attribute
                            api.post('/pageFormat/getAllPages',{pages_id: pages_array})
                            .then(response => {
                                //Successfully received all pages information ordered by the order attribute
                                var page_info_arr = response.data;

                                //Now receive platformData completed_pages for specific platform_format_id and user_id
                                api.post('/platformData/getPlatformDataCompletedPages', {id: user_id, platid: platform_format_id})
                                .then(response => {
                                    //Successfully received completed_pages array
                                    var completed_pages = response.data.completed_pages;

                                    //Now filter pages array by removing objects that contain page_ids that are in the completed_pages array
                                    var filtered_page_info = page_info_arr.slice();
                                    
                                    
                                    //removes values from array if they exist in completed_pages
                                    filtered_page_info = page_info_arr.filter(function(element) {
                                        return completed_pages.indexOf(element._id) === -1;
                                    }); 

                                    //Calculate progress by (length of pages_arr - length of filtered_page_info) / length of pages_arr
                                   
                                    var completedPlat = (filtered_page_info.length === 0);

                                    //select a page to display
                                    var current_page = filtered_page_info[0];

                                    var arr = []
                                    if(filtered_page_info.length !== 0 && current_page.type === "Multiple Choice" && this.state.shouldShuffle){
                                        //Create array of all multiple choice options
                                        arr = current_page.multiple_choices.slice();
                                        arr.push(current_page.multiple_choice_answer);
                                        arr = this.shuffleArray(arr);
                                    }
                                    this.setState({current_mc_array: arr, filterPages: filtered_page_info, pageIndex: 0, currentPage: current_page, progressVal:((page_info_arr.length - filtered_page_info.length)/page_info_arr.length) *100, progressIncrement:(1/page_info_arr.length) *100, completedPlatform: completedPlat})
                                })
                            })
                        })
                        .catch(err => console.log("Error receiving platform format pages array: " + err));

                        var username = response.data.username;
                        user_id = decoded._id; 
                        // this.setState({username: response.data.username, user_id: decoded._id, plat_id:platform_format_id});
                        const info ={
                            id: user_id,
                            platid : platform_format_id
                        }
                        api.post('/platformData/getSpecificPlatformData/',info)
                        .then(response=>{
                            this.setState({platData_id : response.data[0]._id, username: username, user_id: user_id, plat_id:platform_format_id})
                        })
                    }
                    else{
                        //Fake ID...
                        localStorage.removeItem('usertoken');
                        this.props.history.push(`/`);
                    }
                })
                .catch(err => console.log("User Error: " + err));
            }
        }  
        else{
            //Not a Valid Token
            localStorage.removeItem('usertoken');
            this.props.history.push(`/`);
        }


    }

    continueButton(){
        //temporary continue button 
        var button = document.getElementsByClassName("mc_button_submitted")[0];
        button.classList.remove('mc_button_submitted');
        button.classList.add('mc_button');
    

        var completed_plat = false;
        var current_page = this.state.currentPage;
        var current_mc_array = [];
        if(this.state.pageIndex + 1 >= this.state.filterPages.length){
            completed_plat = true;
            //set the platformData is_completed to true in database
            
            const val = {
                user_id : this.state.user_id,
                platform_id : this.state.plat_id
            }

            api.post('/platformData/setCompletedTrue/',val)


        }
        else{
            current_page = this.state.filterPages[this.state.pageIndex + 1];

            if(current_page.type === "Multiple Choice"){
                current_mc_array = current_page.multiple_choices.slice();
                current_mc_array.push(current_page.multiple_choice_answer);
                current_mc_array = this.shuffleArray(current_mc_array);
            }
        }


        this.setState({shouldShuffle: true, current_mc_array: current_mc_array, progressVal:this.state.progressVal + this.state.progressIncrement, pageIndex: this.state.pageIndex + 1, submittedAnswer:false, completedPlatform: completed_plat, currentPage: current_page});
    }

    shuffleArray(array) {
        var shuffled_arr = array.slice();
        for (var i = shuffled_arr.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = shuffled_arr[i];
            shuffled_arr[i] = shuffled_arr[j];
            shuffled_arr[j] = temp;
        }
        return shuffled_arr;
    }

    submitMC(val, index) {
        //check if platform has been completed 

        //check if answer submitted is correct 
        var submitted_answer_bool = false;
        if(val === this.state.currentPage.multiple_choice_answer){
            submitted_answer_bool = true;
        }
        document.getElementById("mc"+index,).classList.remove("mc_button");
        document.getElementById("mc"+index,).classList.add("mc_button_submitted");

        
        //if platform has not been completed award experience 

        //else  
        const info = {
            user_id : this.state.user_id,
            platform_id : this.state.plat_id,
            page_id : this.state.currentPage._id,
        }


        api.post('/platformData/updateCompletedPage/',info)

        this.setState({submittedAnswer:true, shouldShuffle: false, submitted_answer_bool: submitted_answer_bool});
    }

    render() {
        
        return (
            <div style={{height: "100vh", background: "#edd2ae", verticalAlign:"middle"}}>
                <ProgressBar style={{background: "rgb(139 139 139)"}} now={this.state.progressVal} />
                <div>
                    <button onClick={() => this.props.history.push(`/dashboard`)} className="x_button">X</button>
                </div>
                {this.state.completedPlatform === true
                    ?
                        <div style={{textAlign: "center", margin: "auto", fontSize: "40px", padding: "155px"}}>
                            <p>Congratulations you have finished the platform!</p>
                            <p>Click below to continue learning</p>
                            <Link to="/dashboard">Explore More</Link>
                        </div>
                    :
                        (this.state.currentPage !== ''
                        ?
                            (this.state.currentPage.type === "Multiple Choice" 
                            ?
                                <div>
                                <p className="mc_prompt" >{this.state.currentPage.prompt}</p>
                                <div className="mc_choices">
                                {
                                (this.state.current_mc_array.map((choice, index) =>
                                <div>
                                    <button id={"mc"+index} disabled={this.state.submittedAnswer} className="mc_button" onClick={() => this.submitMC(choice, index)}>{String.fromCharCode(65+index)}.) {choice}</button>
                                </div>
                                ))
                                }
                                </div>
                                    {
                                        (this.state.submittedAnswer === false
                                        ?
                                            <p></p>
                                        :
                                            (this.state.submitted_answer_bool === false
                                            ?
                                                <div className = "continue_incorrect">
                                                    <div>
                                                        <button className = "report_button">Report <FontAwesomeIcon icon={faFlag} /></button>
                                                    </div>
                                                    <div className = "correct">
                                                        Incorrect!
                                                    </div>
                                                    <div className = "correct">
                                                        Correct Answer was: {this.state.currentPage.multiple_choice_answer}
                                                    </div>
                                                    <div>
                                                        <button className="continue_button_incorrect" onClick={() => this.continueButton()}>Continue</button>
                                                    </div>
                                                </div>
                                            :
                                                <div className = "continue_correct">
                                                    <div>
                                                    <button className = "report_button">Report <FontAwesomeIcon icon={faFlag} /></button>
                                                    </div>
                                                    <div className = "correct">
                                                        CORRECT!
                                                    </div>
                                                    <div>
                                                        <button className="continue_button_correct" onClick={() => this.continueButton()}>Continue</button>
                                                    </div>
                                                </div>
                                        )
                                    )
                                    }   
                                </div>
                            :
                                (this.state.currentPage.type === "Fill in the Blank"
                                ?
                                    <div>
                                        <p style={{color: "white"}}>Fill in the Blank</p>
                                    </div>
                                :
                                    (this.state.currentPage.type === "Matching Pair"
                                    ?
                                        <div>
                                            <p style={{color: "white"}}>Matching Pair</p>
                                        </div>
                                    :
                                        (this.state.currentPage.type === "Timer"
                                        ?
                                            <div>
                                                <p style={{color: "white"}}>Timer</p>
                                            </div>
                                        :
                                            <p style={{color: "white"}}>IMPOSSIBLE</p>
                                        )
                                    )
                                )
                            )
                            // <div>
                            // <ProgressBar now={this.state.progressVal} />
                            // <p style={{color:"white"}}>{this.state.currentPage.prompt}</p>
                            // {
                            // (this.state.currentPage.multiple_choices.map((choice) =>
                            
                            // <p style={{color:"white"}}>{choice}</p>
                            // ))
                            // }
                            // <Button onClick={() => this.continueButton()}>Continue</Button>
                            // </div>
                        :
                        <div style={{height: "100vh", background: "#edd2ae", verticalAlign:"middle"}}>
                            <p style={{color: "white"}}></p>
                        </div>
                        )
                }
            </div>
        );
    }
}