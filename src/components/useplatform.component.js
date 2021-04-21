import React, { Component } from 'react';
import {api} from "../axios_api.js";
import jwt from 'jsonwebtoken';
import { Link } from 'react-router-dom';
import Logo from "../images/LearnLogo.png";
import jwt_decode from 'jwt-decode';
import Card from 'react-bootstrap/Card'
import { myObject } from "./forgot_password.component"
import Navbar from "./navbar.component";
import Button from 'react-bootstrap/Button'
import ProgressBar from 'react-bootstrap/ProgressBar'

export default class UsePlatform extends Component {
    constructor(props){
        super(props);

        this.continueButton = this.continueButton.bind(this);
        this.shuffleArray = this.shuffleArray.bind(this);
        this.submitMC = this.submitMC.bind(this);
        
        this.state = {
            user_id: '',
            username: '',
            plat_id:'',
            platData_id:'',
            pageIndex:'',
            filterPages:'',
            currentPage:'',
<<<<<<< HEAD
            completedPlatform:false,
            progress: 0,
            all_pages: ''
=======
            progressVal:0,
            progressIncrement:0,
            completedPlatform:false,
            submittedAnswer:false
>>>>>>> e3b5ff48fdc846f82fcab55409f2c755e49f5c2f
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
                        var username = response.data.username;
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
                                    var progress = ((page_info_arr.length - filtered_page_info.length) / page_info_arr.length) * 100;

                                    if(filtered_page_info.length === 0)
                                    {
                                        this.setState({completedPlatform:true})
                                    }
                                    // var completedPlat = (filtered_page_info.length === 0)

                                    //select a page to display
<<<<<<< HEAD
                                    
                                    this.setState({filterPages:filtered_page_info, pageIndex:0, currentPage: filtered_page_info[0], progress: progress, all_pages: page_info_arr});
=======
                                
                                    this.setState({filterPages:filtered_page_info})
                                    this.setState({pageIndex:0})
                                    this.setState({currentPage:filtered_page_info[0]})
                                    this.setState({progressVal:((page_info_arr.length-filtered_page_info.length+1)/page_info_arr.length) *100})
                                    this.setState({progressIncrement:(1/page_info_arr.length) *100})
                                    // this.setState({completedPlatform : completedPlat})
>>>>>>> e3b5ff48fdc846f82fcab55409f2c755e49f5c2f

                                    // filtered_page_info = filtered_page_info.filter(function(page_obj){
                                    //     page_obj.
                                    // })
                                })
                            })
                        })
                        .catch(err => console.log("Error receiving platform format pages array: " + err));


                        this.setState({username: response.data.username, user_id: decoded._id ,plat_id:platform_format_id});
                        const info ={
                            id:decoded._id,
                            platid : platform_format_id
                        }
                        api.post('/platformData/getSpecificPlatformData/',info)
                        .then(response=>{
                            this.setState({platData_id : response.data[0]._id})
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

        if(this.state.pageIndex + 1 >= this.state.filterPages.length){
            this.setState({completedPlatform:true})
            //set the platformData  is_completed to true in database
            
            const val = {
                user_id : this.state.user_id,
                platform_id : this.state.plat_id
            }

            api.post('/platformData/setCompletedTrue/',val)


        }
        else
        {
            this.setState({currentPage:this.state.filterPages[this.state.pageIndex + 1]})
        }

<<<<<<< HEAD
        console.log(this.state.pageIndex);
        var progress = ((this.state.pageIndex + 1) / this.state.all_pages.length) * 100;
        console.log("Progress");
        console.log(progress);
        this.setState({pageIndex: this.state.pageIndex + 1, progress: progress});
=======

        this.setState({progressVal:this.state.progressVal + this.state.progressIncrement})

        this.setState({pageIndex: this.state.pageIndex + 1});
>>>>>>> e3b5ff48fdc846f82fcab55409f2c755e49f5c2f

        const info = {
            user_id : this.state.user_id,
            platform_id : this.state.plat_id,
            page_id : this.state.currentPage._id,
        }

        this.setState({submittedAnswer:false})

        api.post('/platformData/updateCompletedPage/',info)
    }

    shuffleArray(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }

    submitMC(val) {
        //check if platform has been completed 

        //check if answer submitted is correct 
        if(val === this.state.currentPage.multiple_choice_answer)
        {
            console.log("CORRECT ANSWER SELECTED")
        }
        else
        {
            console.log("INCORRECT ANSWER SELECTED")
        }
        //if platform has not been completed award expierience 

        //else  
        console.log(val)
        this.setState({submittedAnswer:true})
    }
    render() {
        if(this.state.completedPlatform === false && this.state.currentPage !=='' && this.state.currentPage.type === "Multiple Choice")
        {
            //creates array and adds the answer to it 
            var arr = this.state.currentPage.multiple_choices.slice()
            console.log(arr)
            arr.push(this.state.currentPage.multiple_choice_answer)

            this.shuffleArray(arr)
        }
        return (
            <div>
                <ProgressBar style={{background: "rgb(0, 219, 0)"}} now={this.state.progress}/>
                <Card style={{ width: '18rem' }}>
                    <Card.Img variant="top" src="holder.js/100px180" />
                    <Card.Body>
                        <Card.Title>Card Title</Card.Title>
                        <Card.Text>
                        </Card.Text>
                    </Card.Body>
                </Card>

                {this.state.completedPlatform === true
                    ?
                        <div>
                            <p style={{color: "white"}}>FINISHED PLATFORM</p>
                        </div>
                    :
                        (this.state.currentPage !== ''
                        ?
                            (this.state.currentPage.type === "Multiple Choice" 
                            ?
                                <div style={{verticalAlign:"middle"}}>
                                <ProgressBar now={this.state.progressVal} />
                                <p style={{color:"white"}}>{this.state.currentPage.prompt}</p>
                                {
                                (arr.map((choice) =>
                                
                                <Button onClick={() => this.submitMC(choice)}>{choice}</Button>
                                ))
                                }
                                    {
                                        (this.state.submittedAnswer === false
                                        ?
                                            <p></p>
                                        :
                                            <Button onClick={() => this.continueButton()}>Continue</Button>
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
                            <p style={{color: "white"}}>EMPTY CURRENT PAGE</p>
                        )
                }
            </div>
        );
    }
}