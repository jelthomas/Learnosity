import React, { Component } from 'react';
import {api} from "../axios_api.js";
import jwt from 'jsonwebtoken';
import { Link } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import ProgressBar from 'react-bootstrap/ProgressBar'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFlag, faCheckCircle, faTimesCircle, faAsterisk } from "@fortawesome/free-regular-svg-icons";
require('dotenv').config();

export default class UsePlatform extends Component {
    constructor(props){
        super(props);

        this.continueButton = this.continueButton.bind(this);
        this.shuffleArray = this.shuffleArray.bind(this);
        this.submitMC = this.submitMC.bind(this);
        this.submitFIB = this.submitFIB.bind(this);
        this.removeClass = this.removeClass.bind(this);
        
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
            submitted_answer_bool: false,
            submitted_fib_correct: '',
            segmented: []
        }
    }

    componentDidMount(){
        var token = localStorage.getItem('usertoken');
        var validToken = false;
        if(token){
            //Token in session storage
            jwt.verify(token, process.env.REACT_APP_SECRET, function(err,res) {
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
                                    var segmented = [];
                                    if(filtered_page_info.length !== 0 && current_page.type === "Fill in the Blank"){
                                        var prompt = current_page.prompt;
                                        var blank_maps = current_page.fill_in_the_blank_answers;
                                        var map_keys = Object.keys(blank_maps).sort();
                                        var curr = 0;
                                        for(var i = 0; i < map_keys.length; i++){
                                            let index = parseInt(map_keys[i]);
                                            segmented.push(prompt.substring(curr, index));
                                            segmented.push(blank_maps[index]);
                                            curr = index + 1;
                                        }
                                        segmented.push(prompt.substring(curr));
                                        console.log(segmented);
                                        //Have correctly segmented array (even index ==> prompt , odd index ==> blank)
                                    
                                    }
                                    this.setState({current_mc_array: arr, segmented: segmented, filterPages: filtered_page_info, pageIndex: 0, currentPage: current_page, progressVal:((page_info_arr.length - filtered_page_info.length)/page_info_arr.length) *100, progressIncrement:(1/page_info_arr.length) *100, completedPlatform: completedPlat})
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
        
        var current_page = this.state.currentPage;
        if(current_page.type === "Multiple Choice"){
            var button = document.getElementsByClassName("mc_button_submitted")[0];
            button.classList.remove('mc_button_submitted');
            button.classList.add('mc_button');
        }
        else if(current_page.type === "Fill in the Blank"){
            document.getElementsByClassName("continue_button_correct")[0].style.display = 'inline';
            var blanks = document.getElementsByClassName("blank");
            for(let i = 0; i < blanks.length; i++){
                blanks[i].disabled = false;
                blanks[i].value = '';
            }
            var checks = document.getElementsByClassName("check_mark");
            for(let i = 0; i < checks.length; i++){
                checks[i].style.display = "none";
            }
            var wrongs = document.getElementsByClassName("wrong_mark");
            for(let i = 0; i < wrongs.length; i++){
                wrongs[i].style.display = "none";
            }
        }
    
        var completed_plat = false;
        var current_mc_array = [];
        var segmented = [];
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


            if(current_page.type === "Fill in the Blank"){
                if(this.state.filterPages.length !== 0 && current_page.type === "Fill in the Blank"){
                    var prompt = current_page.prompt;
                    var blank_maps = current_page.fill_in_the_blank_answers;
                    var map_keys = Object.keys(blank_maps).sort();
                    var curr = 0;
                    for(var i = 0; i < map_keys.length; i++){
                        let index = parseInt(map_keys[i]);
                        segmented.push(prompt.substring(curr, index));
                        segmented.push(blank_maps[index]);
                        curr = index + 1;
                    }
                    segmented.push(prompt.substring(curr));

                    console.log(segmented);
                }
            }
        }


        this.setState({shouldShuffle: true, current_mc_array: current_mc_array, progressVal:this.state.progressVal + this.state.progressIncrement, pageIndex: this.state.pageIndex + 1, completedPlatform: completed_plat, currentPage: current_page,segmented:segmented,submittedAnswer:false,submitted_fib:""});
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

    removeClass(index){
        document.getElementById("fib"+index).placeholder = "Fill in the blank";
        document.getElementById("fib"+index).classList.remove("red_place_holder");
        let id = "ast"+ index;
        document.getElementById(id).style.display = 'none';
    }

    submitFIB(){
        console.log("Submitted");
        var segmented = this.state.segmented;
        var all_inputs = [];
        var not_valid = false;
        for(let i = 0; i < segmented.length;i++){
            if(i % 2 !== 0){
                if(!document.getElementById("fib"+i).validity.valid){
                    document.getElementById("fib"+i).placeholder = "This Field is Required!";
                    document.getElementById("fib"+i).classList.add("red_place_holder");
                    let id = "ast"+ i;
                    document.getElementById(id).style.display = 'inline';
                    not_valid = true;
                }
            }
        }
        if(not_valid){
            return;
        }
        document.getElementsByClassName("continue_button_correct")[0].style.display = 'none';
        for(let i = 0; i < segmented.length;i++){
            if(i % 2 !== 0){
                //Grab document at id = "fib"+i
                all_inputs.push(document.getElementById("fib"+i).value.toLowerCase().trim());
                document.getElementById("fib"+i).disabled = "true";
            }
        }
        //All_inputs now has the user's values
        var correct_vals = Object.values(this.state.currentPage.fill_in_the_blank_answers);
        var users_correct = [];
        for(let i = 0; i < correct_vals.length; i++){
            users_correct.push(correct_vals[i].toLowerCase() === all_inputs[i]);
        }

        //Users_correct has array of True/False of their answers
        var total_correct = 0;
        for(let i = 0; i < users_correct.length; i++){
            var id;
            if(users_correct[i]){
                //Display correct checkmark
                id = "check"+((i*2)+1);
                total_correct += 1;
                document.getElementById(id).style.display = 'inline';
            }
            else{
                //Display incorrect mark
                id = "wrong"+((i*2)+1);
                document.getElementById(id).style.display = 'inline';
            }
        }
        var submitted_fib = '';
        if(total_correct === users_correct.length){
            submitted_fib = 'correct';
        }
        else if(total_correct / users_correct.length >= 0.5){
            submitted_fib = 'almost';
        }
        else{
            submitted_fib = 'incorrect';
        }

        //Update completed_pages
        const info = {
            user_id : this.state.user_id,
            platform_id : this.state.plat_id,
            page_id : this.state.currentPage._id,
        }


        api.post('/platformData/updateCompletedPage/',info)
        
        this.setState({submittedAnswer: true, submitted_fib: submitted_fib})
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
                                                    <div className = "correct_phrase">
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
                                                    <div className = "correct_phrase">
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
                            
                                            <p style={{borderWidth: "0px 0px 2px 0px", width: "fit-content", margin: "auto", marginBottom: "30px", borderStyle: "solid"}} className="mc_prompt">Fill In The Blank:</p>
                                            <div style={{display: "flex", alignItems: "center", justifyContent: "center", fontSize: "25px", fontWeight: "400"}}>
                                                    {(this.state.segmented.map((val, index) =>
                                                        (index % 2 === 0 
                                                            ?

                                                            <div>
                                                                <div style={{whiteSpace: "pre"}} id={"fib"+index} >{val}</div>
                                                            </div>
                                                            :
                                                            <div style={{paddingLeft: "8px"}}>
                                                                <input id={"fib"+index} onChange={() => this.removeClass(index)} className = "blank" required placeholder={"Fill in the blank"}></input><FontAwesomeIcon id={"check"+index} className="check_mark" icon={faCheckCircle}/><FontAwesomeIcon id={"wrong"+index} className="wrong_mark" icon={faTimesCircle}/><p id={"ast"+index} className="asterisk">*</p>
                                                            </div>
                                                        )
                                                    ))}
                                            </div>
                                            <div style={{margin: "auto", textAlign: "center", marginTop: "10%"}}>
                                                <button style={{padding: "10px"}} className="continue_button_correct" onClick={() => this.submitFIB()} >Submit</button>
                                            </div>
                                       
                                        {
                                        (this.state.submittedAnswer === false
                                        ?
                                            <p></p>
                                        :
                                            (this.state.submitted_fib === 'incorrect'
                                            ?
                                                <div className = "continue_incorrect">
                                                    <div>
                                                        <button className = "report_button">Report <FontAwesomeIcon icon={faFlag} /></button>
                                                    </div>
                                                    <div className = "correct">
                                                        Incorrect!
                                                    </div>
                                                    <div className = "correct">
                                                        Correct Prompt was: {this.state.segmented.join(' ')}
                                                    </div>
                                                    <div>
                                                        <button className="continue_button_incorrect" onClick={() => this.continueButton()}>Continue</button>
                                                    </div>
                                                </div>
                                            :

                                                (this.state.submitted_fib === 'almost'
                                            ?
                                                <div className = "continue_incorrect">
                                                    <div>
                                                        <button className = "report_button">Report <FontAwesomeIcon icon={faFlag} /></button>
                                                    </div>
                                                    <div className = "correct">
                                                        You Almost Had It!
                                                    </div>
                                                    <div className = "correct">
                                                        Correct Prompt was: {this.state.segmented.join(' ')}
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
                                                        You Nailed It!
                                                    </div>
                                                    <div>
                                                        <button className="continue_button_correct" onClick={() => this.continueButton()}>Continue</button>
                                                    </div>
                                                </div>
                                        )
                                        )
                                    )
                                    }  

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