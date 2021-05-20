import React, { Component } from 'react';
import {Prompt} from "react-router-dom";
import {api} from "../axios_api.js";
import jwt from 'jsonwebtoken';
import jwt_decode from 'jwt-decode';
import DefaultCoverPhoto from "../images/defaultCoverPhoto.png"
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import LoggedInNav from "./loggedInNav.component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faArrowLeft, faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import { faEyeSlash} from "@fortawesome/free-regular-svg-icons";
require('dotenv').config();

export default class EditPlatform extends Component {
    constructor(props){
        super(props);
        
        this.toggle_password_vis = this.toggle_password_vis.bind(this);
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
        this.submitChanges = this.submitChanges.bind(this);
        this.removeCategory = this.removeCategory.bind(this);
        this.deletePlatform = this.deletePlatform.bind(this);
        this.revealDeleteModal = this.revealDeleteModal.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.revealRemoveCategory = this.revealRemoveCategory.bind(this);
        this.handleRemoveCategoryClose = this.handleRemoveCategoryClose.bind(this);
        
        this.state = {
            user_id: '',
            platformFormat:'',
            fileName:'',
            allCategoriesInfo:[],
            showEmptyPlatAlert:false,
            showEmptyPassAlert:false,
            showDeleteModal:false,
            showEmptyCategoryAlert:false,
            showRemoveCategoryModal:false,
            removeId:'',
            removeIndex:'',
            removeName:'',
            has_changes: false,
            submit_alert: false,
            showPlatNameAlert: false,
            showBigFileAlert: false,
            showWrongFileTypeAlert: false
        }
    }

    toggle_password_vis(id){
        var input = document.getElementById(id);
        if(input.type === 'password'){
            input.type = 'text';
        }
        else{
            input.type = 'password';
        }
    }

    updatePlatformFormat(){
        
        var platform_format_id = this.props.location.pathname.substring(14);


        api.get('/platformFormat/getSpecificPlatformFormat/'+platform_format_id)
        .then(response => {
            this.setState({platformFormat:response.data[0]})
        })
        .catch(error => {
            console.log(error.response)
        });
    }

    updateAllCategoryInfo(){
        
        var platform_format_id = this.props.location.pathname.substring(14);
        var allCategories


        api.get('/platformFormat/getSpecificPlatformFormat/'+platform_format_id)
        .then(response => {

            var categoriesArray = response.data[0].categories
            var tempPlat = this.state.platformFormat
            tempPlat.categories = categoriesArray

            api.post('/categoryFormat/getAllCategories',{categories_id:categoriesArray})
            .then(response =>{
                
                allCategories = response.data

                this.setState({allCategoriesInfo:allCategories,platformFormat : tempPlat})
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

        // Increment total page length of platform
        api.post('/platformFormat/increment_pages_length_by', {plat_id: this.state.platformFormat._id, inc: 1})
        .then(temp =>{
        });

        //add page to category
        const newPage= {
            type:"Multiple Choice",
            prompt : "Default Question",
            audio_file : "",
            page_title : "Default Question",
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
            //create category
            const newCategory= {
                cat_name:"Default Quiz",
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
                    //updates platform format so page is rendered properly
                    this.updateAllCategoryInfo();
                    this.setState({showEmptyCategoryAlert:false})
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
        this.setState({showUndefinedImageAlert:false,showBigFileAlert:false,showWrongFileTypeAlert:false})
        const file = document.getElementById('inputGroupFile01').files
        //checks if file is properly defined
        if(file[0] === undefined) {
            this.setState({showUndefinedImageAlert:true});
            return;
        }
        //checks if file size is greater then 10 MB
        if(file[0].size > 10000000) {
            this.setState({showBigFileAlert:true});
            return;
        }

        //checks the type of file
        if(file[0].type !== "image/png" && file[0].type !== "image/jpeg")
        {
            this.setState({showWrongFileTypeAlert:true})
            return
        }

        const data = new FormData()
        data.append('image', file[0]);

        var config = {
            method: 'post',
            url: 'https://api.imgur.com/3/image',
            headers: {
              'Authorization': 'Client-ID 06ca9bca2100479'
            },
            data : data
          };
    
        //var platID = this.state.platformFormat._id
        var tempPlat = this.state.platformFormat
        api(config)
        .then(response =>{
            tempPlat.cover_photo = response.data.data.link;

            api.post('/platformFormat/update_cover_photo', {platformID: tempPlat._id, newCoverPhoto: response.data.data.link})
            .then(temp =>{
                this.setState({platformFormat : tempPlat});
            })
            .catch(function (error) {
                console.log(error);
            });
        })
        .catch(function (error) {
            console.log(error);
        });


        document.getElementById('inputGroupFile01').value = ""
    }

    setPlatformPrivacy(){

        var tempPlat = this.state.platformFormat

        var privacyVal = document.getElementById('privacy').value

        if(privacyVal === "false")
        {
            tempPlat.is_public = false
        }
        else
        {
            tempPlat.is_public = true
        }
        

        this.setState({platformFormat : tempPlat, has_changes: true})

    }

    setPlatformPublish(){

        var tempPlat = this.state.platformFormat

        var publishVal = document.getElementById('publish').value
       
        if(publishVal === "false")
        {   
            //Remove from users recent array
            api.post('/user/remove_from_recently_played', {platform_format_id: tempPlat._id})
            .then(res => {
            })
            .catch(err => console.log(err));

            tempPlat.is_published = false
        }
        else
        {
            tempPlat.is_published = true
        }

        this.setState({platformFormat : tempPlat, has_changes: true})

    }

    changePlatName(e){

        var tempPlat = this.state.platformFormat;
        var eVal = e.target.value;

        tempPlat.plat_name = eVal

        this.setState({platformFormat:tempPlat,showEmptyPlatAlert:false, showPlatNameAlert: false, has_changes: true})

    }

    changePrivacyPass(e){
        var tempPlat = this.state.platformFormat
        var eVal = e.target.value

        tempPlat.privacy_password = eVal

        this.setState({platformFormat : tempPlat, has_changes: true})
   
    }

    editCategory(category_id){

        var platform_format_id = this.props.location.pathname.substring(14);

        //need to fix editCategory url and 
        this.props.history.push(`/editCategory/`+ platform_format_id +'/' + category_id);
    }

    submitChanges(){
        if(!this.state.has_changes){
            return;
        }
        var tempPlat = this.state.platformFormat
        //check the inputs and gives back alerts if there are issues 
        if(tempPlat.plat_name.trim() === "")
        {
            this.setState({showEmptyPlatAlert:true})
            return
        }

        if(tempPlat.plat_name.trim().length > 25){
            this.setState({showPlatNameAlert:true})
            return
        }

        if(tempPlat.is_public === false && tempPlat.privacy_password === "")
        {
            this.setState({showEmptyPassAlert:true})
            return
        }

        if(tempPlat.is_published === true && tempPlat.categories.length === 0)
        {
            this.setState({showEmptyCategoryAlert:true})
            return 
        }

        //axios call to update backend with pageformat 
        const newPlat = {
            platformID : this.state.platformFormat._id,
            newPlatName : tempPlat.plat_name.trim(),
            newPublishStatus : tempPlat.is_published,
            newPrivacyStatus : tempPlat.is_public,
            newPlatPassword : tempPlat.privacy_password
        }

        if(tempPlat.is_published === false)
        {
            //calls remove platFromAllUsers s
            api.post('/platformFormat/updateWholePlat',newPlat)
            .then(response => {

                api.post('/user/removePlatformFromUsers',{platformID : this.state.platformFormat._id})
                .then(res2 =>{
                    this.setState({has_changes: false, submit_alert: true})
                    setTimeout(() => {this.setState({submit_alert: false})}, 3000)
                    })
                })
                .catch(err2=>{
                    console.log(err2)
                })
            .catch(error => {
                console.log(error.response)
            });
        }
        else
        {
            api.post('/platformFormat/updateWholePlat',newPlat)
            .then(response => {
                this.setState({has_changes: false, submit_alert: true})
                setTimeout(() => {this.setState({submit_alert: false})}, 3000)
                })
            .catch(error => {
                console.log(error.response)
            });
        }
    }

    removeCategory(){
        var tempPlat = this.state.platformFormat
        
        var tempArr = this.state.allCategoriesInfo


        tempArr.splice(this.state.removeIndex,1)

        this.setState({allCategoriesInfo:tempArr, showRemoveCategoryModal:false})

        // var cat_id = id
        const removeCat = {
            platform_format_id : tempPlat._id,
            category_format_id : this.state.removeId
        }
        
        api.get('/categoryFormat/getPages/'+ this.state.removeId)
        .then(pages => {
            var page_length = pages.data.pages.length;
            var all_pages = pages.data.pages;
            //Decrement page_length by page_length
             api.post('platformFormat/increment_pages_length_by', {plat_id: tempPlat._id, inc: -page_length})
            .then(temp => {
                // Delete all pages in the quiz
                api.post('pageFormat/delete_all_pages', {all_pages: all_pages})
                .then(another_temp => {
                    //Remove the category format ID from the platform format array of categories
                    api.post('/platformFormat/removeCategory',removeCat)
                    .then(temp2 =>{
                        
                        //Remove all category datas associated with this category
                        api.post('/categoryData/removeCategoryDatas', {category_format_id: removeCat.category_format_id})
                        .then(temp3 =>{
                            
                            //Remove the category format schema
                            api.post('/categoryFormat/removeCategoryFormat', {category_format_id: removeCat.category_format_id})
                            .then(temp4 =>{
                             
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
                })
            })
            .catch(err2 => console.log(err2.response))
        })
        .catch(err => console.log(err.response))
        
    }

    deletePlatform(){
        var tempPlat = this.state.platformFormat

        const deletePlat = {
            platform_format_id: tempPlat._id,
            category_format_ids : tempPlat.categories
        }

        api.post('/categoryFormat/getAllCategories', {categories_id: deletePlat.category_format_ids})
        .then(categories => {
            var all_categories = categories.data;

            var all_pages = [];

            for(var i = 0; i < all_categories.length; i++){
                var categorys_pages = all_categories[i].pages;
                all_pages = all_pages.concat(categorys_pages);
            }

            api.post('/pageFormat/delete_all_pages', {all_pages: all_pages})
            .then(temp =>{
                api.post('/platformFormat/removePlatform', deletePlat)
                .then(response => {
                        this.props.history.push(`/myplatforms`);
                    })
                .catch(error => {
                    console.log(error.response)
                });
            })
            .catch(error => {
                console.log(error.response);
            })


        })
        .catch(error => {
            console.log(error.response);
        })

    }

    revealDeleteModal(){
        this.setState({showDeleteModal:true})
    }

    handleClose(){
        this.setState({showDeleteModal:false})
    }

    revealRemoveCategory(id,name,ind){
        this.setState({showRemoveCategoryModal:true,removeId:id,removeName:name,removeIndex:ind})
    }
    handleRemoveCategoryClose(){
        this.setState({showRemoveCategoryModal:false})
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
                        
                        if (response.data.created_platforms.includes(platform_format_id) === false) {
                            this.props.history.push(`/dashboard`);
                        }


                        api.get('/platformFormat/getSpecificPlatformFormat/'+platform_format_id)
                        .then(response => {
                            this.setState({platformFormat:response.data[0]})

                            var categoriesArray = response.data[0].categories

                            //
                            api.post('/categoryFormat/getAllCategories',{categories_id:categoriesArray})
                            .then(response =>{
                                
                                allCategories = response.data

                                this.setState({allCategoriesInfo:allCategories})
                            })
                            .catch(error => {
                                console.log(error.response)
                            })
                        })
                        .catch(error => {
                            console.log(error.response)
                        });
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
        <div>
            <LoggedInNav props={this.props}/>
            <div style = {{display: "flex"}}>
                <div style={{marginLeft: "2%"}}>
                    <button style = {{color: 'white', fontSize: "45px"}} onClick={() =>  this.props.history.push("/myplatforms/")} className="x_button"><FontAwesomeIcon icon={faArrowLeft} /></button>
                </div>
                <div style={{marginLeft: "38%", color: "rgb(0,219,0)", textDecoration: "underline", fontSize: "35px", marginTop: "1%"}}>
                    Edit Your Platform
                </div>
            </div>
            <div style={{background: "black", marginLeft: "20%", marginRight: "20%", marginTop: "3%", height: "auto", borderRadius: "10px", padding: "20px"}}>
                <div style={{display: "flex", justifyContent: "center", marginBottom: "2%"}}>
                    <div style={{fontSize: "25px", color: "white", marginRight: "2%"}}>
                        Enter Platform Name: 
                    </div>
                    <input style={{width: "250px", borderRadius: "10px"}} type="text" id="changePlatName" value = {this.state.platformFormat.plat_name} onChange = {(e)=>this.changePlatName(e)} /> 
                </div>
                <Alert style={{width: "28%", textAlign: "center", margin: "auto"}} show = {this.state.showEmptyPlatAlert} variant = 'danger'>
                    The Platform name cannnot be empty !
                </Alert>
                <Alert style={{width: "42%", textAlign: "center", margin: "auto"}} show = {this.state.showPlatNameAlert} variant = 'danger'>
                     The Platform name cannot be greater than 25 characters long
                </Alert>
                <div style={{display: "flex", justifyContent: "center", marginTop: "3%", marginBottom: "3%"}}>
                    <div style={{fontSize: "25px", color: "white", marginRight: "1%"}}>
                        Platform Privacy Status:
                    </div>
                    <select style={{width: "90px", borderRadius: "10px", marginRight: "3%"}} onChange = {this.setPlatformPrivacy} value = {this.state.platformFormat.is_public === true ? "true" : "false"} id = "privacy">
                        <option value="true">Public</option>
                        <option value="false">Private</option>
                    </select>
                    <div style={{fontSize: "25px", color: "white", marginRight: "1%"}}>
                        Enter Your Platform's Password:
                    </div>
                    <input style={{width: "200px", borderRadius: "10px"}} type="password" id="privacyPassword" disabled={this.state.platformFormat.is_public} value = {this.state.platformFormat.privacy_password} onChange = {(e) => this.changePrivacyPass(e)}/>
                    <button onClick = {() => this.toggle_password_vis("privacyPassword")} style={{border: "transparent", background: "transparent", transform: "translate(-35px)"}}><FontAwesomeIcon icon={faEyeSlash} /></button>
                </div>
                <Alert style={{width: "40%", textAlign: "center", margin: "auto"}} show = {this.state.showEmptyPassAlert} variant = 'danger'>
                    The password field for a private platform cannot be empty !
                </Alert>
                <div style={{display: "flex", justifyContent: "center", marginTop: "3%", marginBottom: "3%"}}>
                    <div style={{fontSize: "25px", color: "white", marginRight: "1%"}}>
                        Set your published status:
                    </div>
                    <select style={{width: "150px", borderRadius: "10px", marginRight: "3%"}} onChange = {this.setPlatformPublish} value = {this.state.platformFormat.is_published === true ? "true" : "false"} id = "publish">
                        <option value="true">Published</option>
                        <option value="false">Not Published</option>
                    </select>
                </div>
                <Alert style={{width: "40%", textAlign: "center", margin: "auto"}} show = {this.state.showEmptyCategoryAlert} variant = 'danger'>
                     A Platform requires at least one quiz
                </Alert>
                <Prompt when={this.state.has_changes} message="You have unsaved changes! Are you sure you want to leave this page?" />
                <div style={{display: "flex", justifyContent: "center", marginTop: "3%", marginBottom: "3%"}}>
                    <button style={{color: "white", background: "rgb(0,219,0)", padding: "10px", borderRadius: "10px", border: "transparent", fontSize: "20px"}} onClick = {this.submitChanges}>Submit Changes</button>
                </div>
                {this.state.submit_alert
                ?
                <div style={{color: "rgb(0,219,0", textAlign: "center"}}>
                    Your changes have successfully been saved!
                </div>
                :
                <p></p>
                }
            </div>

            <div style={{display: "flex", marginLeft: "20%", marginRight: "20%", marginTop: "1%"}}>
                <div style={{background: "black", width: "45%", borderRadius: "10px", maxHeight: "633px", overflowY: "auto"}}>
                    <div style={{color: "white", fontSize: "25px", padding: "20px 20px 5px 20px", borderBottom: "1px solid rgb(0,219,0)", display: "flex"}}>
                        <div style={{margin: "auto"}}>
                            Quizzes: 
                        </div>
                        <div>
                            <button disabled = {this.state.allCategoriesInfo.length > 14 ? true : false} style={{color: "white", border: "transparent", borderRadius: "25px", background: "blue", fontSize: "20px"}} onClick={this.addCategoryToPlatform}><FontAwesomeIcon icon={faPlus} /></button>
                        </div>
                    </div>
                    <div style={{padding: "20px"}}>
                        {this.state.allCategoriesInfo.map((category,index) => (
                            <div style={{display: "flex"}}>
                                <div style={{fontSize: "20px", padding: "5px"}}>
                                    <button style={{borderRadius: "10px", padding: "5px 15px 5px 15px"}} onClick={() => this.editCategory(category._id)}>{category.category_name}  <FontAwesomeIcon icon={faPencilAlt} /></button>
                                </div>   
                                <div style={{marginLeft: "auto", fontSize: "20px", marginTop: "auto", marginBottom: "auto"}}>
                                    <button disabled = {this.state.allCategoriesInfo.length < 2 ? true : false} style={{color: "red", border: "transparent", background: "transparent"}} onClick ={()=>this.revealRemoveCategory(category._id,category.category_name,index)} id={"removeCategory" + index}>X</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                            
                <div style={{background: "black", width: "fit-content", borderRadius: "10px", marginLeft: "auto"}}>
                    <div style={{color: "white", fontSize: "25px", padding: "20px 20px 5px 20px", borderBottom: "1px solid rgb(0,219,0)", display: "flex"}}>
                        <div style={{margin: "auto"}}>
                            Select a Cover Photo: 
                        </div>
                    </div>
                    <div style={{padding: "20px"}}>
                        <img  
                            src={this.state.platformFormat.cover_photo === "" ? DefaultCoverPhoto : this.state.platformFormat.cover_photo} 
                            width = {500}
                            height = {400}
                            alt="coverphoto"
                        />
                        <div className="input-group mb-3" style={{marginTop: "15%"}}>
                            <div className="custom-file">
                                <input style={{color: "white", width: "100%", textAlignLast: "center"}}
                                    type="file"
                                    id="inputGroupFile01"
                                    accept="image/*"
                                    onChange={this.setPlatformCoverPage}
                                />
                            </div>
                        </div>
                        <Alert style={{textAlign: "center", margin: "auto", width: "70%"}} show = {this.state.showBigFileAlert} variant = 'danger'>
                            The file selected is greater than 10 MB. 
                        </Alert>
                        <Alert style={{textAlign: "center", margin: "auto", width: "70%"}} show = {this.state.showWrongFileTypeAlert} variant = 'danger'>
                            The file selected is not of type jpeg or png.
                        </Alert>
                    </div>
                </div>

            </div>
            <div style={{textAlign: "center", marginTop: "2%", marginBottom: "2%"}}>
                <button style={{fontSize: "20px"}} onClick = {this.revealDeleteModal} class="btn btn-danger">Delete Platform</button>
            </div>
            <Modal
                show={this.state.showRemoveCategoryModal}
                onHide={this.handleRemoveCategoryClose}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Delete Quiz</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you wish to permanently delete the quiz {this.state.removeName}?
                </Modal.Body>
                <Modal.Footer>
                <Button variant="secondary" onClick={this.handleRemoveCategoryClose}>
                    Cancel
                </Button>
                <Button variant="primary" onClick = {this.removeCategory}>Confirm</Button>
                </Modal.Footer>
            </Modal>

            <Modal
                show={this.state.showDeleteModal}
                onHide={this.handleClose}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Delete Platform</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to permanently delete this platform ?
                </Modal.Body>
                <Modal.Footer>
                <Button variant="secondary" onClick={this.handleClose}>
                    Cancel
                </Button>
                <Button variant="primary" onClick = {this.deletePlatform}>Confirm</Button>
                </Modal.Footer>
            </Modal>

        </div>
    );
}
}