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
        this.addCategoryToPlatform = this.addCategoryToPlatform.bind(this);
        this.setFileName = this.setFileName.bind(this);
        this.setPlatformCoverPage = this.setPlatformCoverPage.bind(this);
        this.setPlatformPrivacy = this.setPlatformPrivacy.bind(this);
        this.setPlatformPublish = this.setPlatformPublish.bind(this);
        this.changePlatName = this.changePlatName.bind(this);
        this.changePrivacyPass = this.changePrivacyPass.bind(this);
        this.updateAllCategoryInfo = this.updateAllCategoryInfo.bind(this);
        this.editCategory = this.editCategory.bind(this);
        
        this.state = {
            user_id: '',
            platformFormat:'',
            fileName:'',
            allCategoriesInfo:[]
        }
    }

    
    updatePlatformFormat(){

        //console.log("INSIDE updatePlatformFormat")
        
        var platform_format_id = this.props.location.pathname.substring(14);


        api.get('/platformFormat/getSpecificPlatformFormat/'+platform_format_id)
        .then(response => {
            //console.log(response)
            this.setState({platformFormat:response.data[0]})
        })
        .catch(error => {
            console.log(error.response)
        });
    }

    updateAllCategoryInfo(){

        console.log("INSIDE updatePlatformFormat")
        
        var platform_format_id = this.props.location.pathname.substring(14);
        var allCategories


        api.get('/platformFormat/getSpecificPlatformFormat/'+platform_format_id)
        .then(response => {
            console.log(response)
            this.setState({platformFormat:response.data[0]})

            var categoriesArray = response.data[0].categories

            api.post('/categoryFormat/getAllCategories',{categories_id:categoriesArray})
            .then(response =>{
                
                allCategories = response.data
                console.log(allCategories)

                this.setState({allCategoriesInfo:allCategories})
            })
            .catch(error => {
                console.log(error.response)
            })
        })
        .catch(error => {
            console.log(error.response)
        });
    }



    addCategoryToPlatform(){
        console.log("adding category to platform")

        //add page to category
        const newPage= {
            type:"Multiple Choice",
            prompt : "Default Question",
            audio_file : "",
            page_title : "Default Page",
            multiple_choices : ["Choice"],
            multiple_choice_answer : "Answer",
            matching_pairs: {"PairA":"PairB","Pair1":"Pair2"},
            fill_in_the_blank_answers:{"7":"Blank"},
            fill_in_the_blank_prompt:"Prompt   Prompt",
            clock:120,
            timer_answers:[],
            order: 0
        }

        var pf_id = this.state.platformFormat._id;

        api.post('/pageFormat/add',newPage)
        .then(response => {
        console.log(response.data._id)

        //create category
        const newCategory= {
            cat_name:"Default Category",
            platform_id : this.props.location.pathname.substring(14),
            cat_photo:"",
            pages : [response.data._id]
        }
        //create category in database
        api.post('/categoryFormat/add',newCategory)
        .then(res => {

            //add category to platform 
            const addToCat = {
                platform_format_id:pf_id,
                category_id : res.data._id
            }
            api.post('/platformFormat/addToCategories',addToCat)
            .then(res2 => {
                console.log(res2)
                //updates platform format so page is rendered properly
                this.updateAllCategoryInfo();
              })
            .catch(error => {
                console.log(error.response)
            });
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
                //UPDATING PLATFORM FORMAT IS BROKEN for update cover photo 
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

    setPlatformPrivacy(){
        var privacyVal = document.getElementById('privacy').value
        console.log("In set platform privacy " + privacyVal)

        const newPrivacy = {
            platformID : this.state.platformFormat._id,
            newPrivacyStatus : privacyVal
        }

        //call update platname 
        api.post('/platformFormat/updatePlatPrivacy',newPrivacy)
        .then(response => {
            console.log(response)
            //updates platform format so page is rendered properly
            this.updatePlatformFormat();
        })
        .catch(error => {
            console.log(error)
        });

    }

    setPlatformPublish(){
        var publishVal = document.getElementById('publish').value

        const newPublish = {
            platformID : this.state.platformFormat._id,
            newPublishStatus : publishVal
        }

        //call update platname 
        api.post('/platformFormat/updatePlatPublish',newPublish)
        .then(response => {
            console.log(response)
            //updates platform format so page is rendered properly
            this.updatePlatformFormat();
        })
        .catch(error => {
            console.log(error)
        });
    }

    changePlatName(){
        var inputVal = document.getElementById('changePlatName').value

        if(inputVal.length < 1)
        {
            var platName = this.state.platformFormat;
            platName.plat_name = inputVal;

            document.getElementById('changePlatName').placeholder = "Platform Name Required";

            this.setState({platformFormat:platName});
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
                //onsole.log(response)
                //updates platform format so page is rendered properly
                this.updatePlatformFormat();
            })
            .catch(error => {
                console.log(error)
            });
        }
        // var platName = this.state.platformFormat
        // platName.plat_name = inputVal
        // this.setState({platformFormat:platName})
    }

    changePrivacyPass(){
        var inputVal = document.getElementById('privacyPassword').value
        if(inputVal.length < 1)
        {
            var platPass = this.state.platformFormat;
            platPass.privacy_password = inputVal;
            
            document.getElementById('privacyPassword').placeholder = "Password Required";
            
            this.setState({platformFormat:platPass})
             
            return
        }
        else
        {
            const newPass = {
                platformID : this.state.platformFormat._id,
                newPlatPassword : inputVal
            }

            //call update platname 
            api.post('/platformFormat/updatePlatPassword',newPass)
            .then(response => {
                console.log(response)
                //updates platform format so page is rendered properly
                this.updatePlatformFormat();
            })
            .catch(error => {
                console.log(error)
            });
        }
    }

    editCategory(category_id){
        console.log(category_id)

        var platform_format_id = this.props.location.pathname.substring(14);

        //need to fix editCategory url and 
        this.props.history.push(`/editCategory/`+ platform_format_id +'/' + category_id);
    }

    //REMEMBER TO GRAB THE PLATFORM_FORMAT BASED ON THE URL 
    //SAVE VALUES TO A STATE VARIABLE
    componentDidMount(){
        var token = localStorage.getItem('usertoken');
        var allCategories;
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

                            var categoriesArray = response.data[0].categories

                            console.log(response.data[0].categories)

                            //
                            api.post('/categoryFormat/getAllCategories',{categories_id:categoriesArray})
                            .then(response =>{
                                
                                allCategories = response.data
                                console.log(allCategories)

                                this.setState({allCategoriesInfo:allCategories})
                            })
                            .catch(error => {
                                console.log(error.response)
                            })
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
            <button onClick={this.addCategoryToPlatform}>Add Category</button>
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
            <input type="text" id="changePlatName" value = {this.state.platformFormat.plat_name} onChange = {this.changePlatName}/> 
            <select onChange = {this.setPlatformPrivacy} value = {this.state.platformFormat.is_public === true ? "true" : "false"} id = "privacy">
                <option value="true">Public</option>
                <option value="false">Private</option>
            </select>
            <select onChange = {this.setPlatformPublish} value = {this.state.platformFormat.is_published === true ? "true" : "false"} id = "publish">
                <option value="true">Published</option>
                <option value="false">Not Published</option>
            </select>
            <input type="password" id="privacyPassword" disabled={this.state.platformFormat.is_public} value = {this.state.platformFormat.privacy_password} onChange = {this.changePrivacyPass}/>
            <div>
            {this.state.allCategoriesInfo.map((category) => (
                <button onClick={() => this.editCategory(category._id)}>{category.category_name}</button>
            ))}
            </div>
        </div>
    );
}
}