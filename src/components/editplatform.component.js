import React, { Component } from 'react';
import {api} from "../axios_api.js";
import axios from "axios";
import jwt from 'jsonwebtoken';
import { Link } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import DefaultCoverPhoto from "../images/defaultCoverPhoto.png"
require('dotenv').config();

export default class EditPlatform extends Component {
    constructor(props){
        super(props);
        this.updatePlatformFormat = this.updatePlatformFormat.bind(this);
        this.addPageToPlatform = this.addPageToPlatform.bind(this);
        this.setFileName = this.setFileName.bind(this);
        this.setPlatformCoverPage = this.setPlatformCoverPage.bind(this);
        this.updatePlatformName = this.updatePlatformName.bind(this);
        
        this.state = {
            user_id: '',
            platformFormat:'',
            fileName:''
        }
    }

    
    updatePlatformFormat(){

        console.log("INSIDE updatePlatformFormat")
        
        var platform_format_id = this.props.location.pathname.substring(14);


        api.get('/platformFormat/getSpecificPlatformFormat/'+platform_format_id)
        .then(response => {
            console.log(response)
            this.setState({platformFormat:response.data[0]})
        })
        .catch(error => {
            console.log(error.response)
        });
    }


    addPageToPlatform(){
        console.log("adding page to platform")


        //create page 
        const newPage= {
            type:"Multiple Choice",
            prompt : "Default MC",
            audio_file : "",
            page_title : "Default Page",
            multiple_choices : ["choice"],
            multiple_choice_answer : "answer",
            matching_pairs: "",
            fill_in_the_blank_answers:"",
            clock:1,
            timer_answers:[],
            order: this.state.platformFormat.pages.length

        }
        //create page
        api.post('/pageFormat/add',newPage)
        .then(response => {
            console.log(response.data._id)

            //add page to platform 
            const addToPlat = {
                platform_format_id:this.state.platformFormat._id,
                page_format_id : response.data._id
            }
            api.post('/platformFormat/addToPages',addToPlat)
            .then(response => {
                console.log(response)
                //updates platform format so page is rendered properly
                this.updatePlatformFormat();
              })
            .catch(error => {
                console.log(error.response)
            });
          })
        .catch(error => {
            console.log(error.response)
        });
        
    }

    setFileName() {
        const file = document.getElementById('inputGroupFile01').files
        if(file[0] === undefined) {
          this.setState({fileName : ""})
        } else {
            this.setState({fileName : file[0].name})
        }
    }

    setPlatformCoverPage() {
        const file = document.getElementById('inputGroupFile01').files
        //checks if file is properly defined
        if(file[0] === undefined) {
            return
        }
        //checks if file size is greater then 10 MB
        if(file[0].size > 10000000) {
            return
        }

        //checks the type of file
        if(file[0].type !== "image/png" && file[0].type !== "image/jpg")
        {
            return
        }

        console.log("Gets Pasts Type check")

        const data = new FormData()
        console.log(file[0])
        data.append('image', file[0]);

        var config = {
            method: 'post',
            url: 'https://api.imgur.com/3/image',
            headers: {
              'Authorization': 'Client-ID 06ca9bca2100479'
            },
            data : data
          };
    
        var platID = this.state.platformFormat._id
        api(config)
        .then(function (response) {
            console.log((response.data.data.link));

            const updateCover = {
                platformID : platID,
                newCoverPhoto : response.data.data.link
            }

            api.post('/platformFormat/update_cover_photo',updateCover)
            .then(response => {
                console.log(response.data)
                this.updatePlatformFormat();
              })
            .catch(error => {
                console.log(error.response)
            });
        })
        .catch(function (error) {
        console.log(error);
        });

        document.getElementById('inputGroupFile01').value = ""
    }

    updatePlatformName(e){
        if(e.key === "Enter")
        {
            console.log("Enter KEY PRESSED")
            console.log(document.getElementById('changePlatName').value)

            var inputVal = document.getElementById('changePlatName').value

            if(inputVal.length < 1)
            {
                return
            }
            else 
            {
                const newName = {
                    platformID : this.state.platformFormat._id,
                    newPlatName : inputVal
                }

                //call update platname 
                api.post('/platformFormat/updatePlatName',newName)
                .then(response => {
                    console.log(response)
                    //updates platform format so page is rendered properly
                    this.updatePlatformFormat();
                  })
                .catch(error => {
                    console.log(error.response)
                });
            }
           
        }
        else
        {

        }
    }

    
    //REMEMBER TO GRAB THE PLATFORM_FORMAT BASED ON THE URL 
    //SAVE VALUES TO A STATE VARIABLE
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
                api.get('/user/getSpecificUser/'+ decoded._id)
                .then(response => {
                    if (response) {
                        //Valid user
                        var user_id = response.data._id;


                        var platform_format_id = this.props.location.pathname.substring(14);


                        api.get('/platformFormat/getSpecificPlatformFormat/'+platform_format_id)
                        .then(response => {
							this.setState({platformFormat:response.data[0]})
                        })
                        .catch(error => {
                            console.log(error.response)
                        });
						

                        console.log(platform_format_id)
                        //Use platform format ID to grab all data
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
render() {
        
    return (
        <div style={{height: "100vh", background: "#edd2ae", verticalAlign:"middle"}}>
            <p>{this.state.platformFormat.plat_name}</p>
            <button onClick={this.addPageToPlatform}>Add Page</button>
            <img  
                src={this.state.platformFormat.cover_photo === "" ? DefaultCoverPhoto : this.state.platformFormat.cover_photo} 
                width = {200}
                alt="coverphoto"
            />
            <div className="input-group mb-3">
                <div className="custom-file">
                <input
                    type="file"
                    id="inputGroupFile01"
                    accept="image/*"
                    onChange={this.setPlatformCoverPage}
                />
                {/* <label className="custom-file-label" htmlFor="inputGroupFile01">
                    {this.state.fileName === "" ? "Choose an image file" : this.state.fileName}
                </label> */}
                </div>
            </div>
            <input type="text" id="changePlatName" placeholder="Enter New Name" onKeyDown={this.updatePlatformName}/> 
        </div>
    );
}
}