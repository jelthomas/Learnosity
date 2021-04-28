import React, { Component } from 'react';
import {api} from "../axios_api.js";
import jwt from 'jsonwebtoken';
import { Link } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
require('dotenv').config();

export default class EditPlatform extends Component {
    constructor(props){
        super(props);
        this.addPageToPlatform = this.addPageToPlatform.bind(this);
        
        this.state = {
            user_id: '',
            platformFormat:''
        }
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
              })
            .catch(error => {
                console.log(error.response)
            });
          })
        .catch(error => {
            console.log(error.response)
        });
        

        //add page to platformFormat 
        // const addToPlat = {
        //     platform_format_id:this.state.platformFormat._id,
        //     page_format_id : page_id
        // }
        // api.post('/platformFormat/addToPages',addToPlat)
        // .then(response => {
        //     console.log(response)
        //   })
        // .catch(error => {
        //     console.log(error.response)
        // });

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
            <div className="input-group mb-3">
                <div className="custom-file">
                <input
                    type="file"
                    id="inputGroupFile01"
                    accept="image/*"
                />
                <label className="custom-file-label" htmlFor="inputGroupFile01">
                    Choose an image file
                </label>
                </div>
            </div>
        </div>
    );
}
}