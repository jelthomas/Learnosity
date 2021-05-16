import React, { Component } from 'react';
import {api} from "../axios_api.js";
import jwt from 'jsonwebtoken';
import jwt_decode from 'jwt-decode'
import "../format.css";
import {Prompt} from "react-router-dom";
import DefaultCoverPhoto from "../images/defaultCoverPhoto.png"
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import LoggedInNav from "./loggedInNav.component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { faEyeSlash} from "@fortawesome/free-regular-svg-icons";
require('dotenv').config();


export default class EditCategory extends Component {
    constructor(props){
        super(props);

        this.updateCategoryFormat = this.updateCategoryFormat.bind(this);
        this.changeCatName = this.changeCatName.bind(this);
        this.setCategoryPhoto = this.setCategoryPhoto.bind(this);
        this.addPageToCategory = this.addPageToCategory.bind(this);
        this.editPage = this.editPage.bind(this);
        this.updateAllPageInfo = this.updateAllPageInfo.bind(this);
        this.submitChanges = this.submitChanges.bind(this);
        this.removePage = this.removePage.bind(this);
        this.previewCategory = this.previewCategory.bind(this);
        this.revealRemovePage = this.revealRemovePage.bind(this);
        this.handleRemovePageClose = this.handleRemovePageClose.bind(this);


        this.state = {
            username: "",
            id: "",
            categoryFormat: "",
            allPagesInfo:[],
            showEmptyCatAlert:false,
            showRemovePageModal:false,
            removeID:'',
            removeName:'',
            removeIndex:'',
            has_changes: false,
            submit_alert: false
        }

    }

    updateCategoryFormat (){
        var category_format_id = this.props.location.pathname.substring(39);

        //get specific category format
        api.get('/categoryFormat/getSpecificCategoryFormat/'+category_format_id)
        .then(response => {
            this.setState({categoryFormat: response.data[0]})

        })
        .catch(error => {
            console.log(error.response)
        });
    }

    updateAllPageInfo () {
        var category_format_id = this.props.location.pathname.substring(39);
        var allPages

        //get specific category format
        api.get('/categoryFormat/getSpecificCategoryFormat/'+category_format_id)
        .then(response => {
            var pagesArray = response.data[0].pages

            api.post('/pageFormat/getAllPages',{pages_id:pagesArray})
            .then(response =>{
                allPages = response.data
                this.setState({allPagesInfo:allPages})
            })
            .catch(error => {
                console.log(error.response)
            })
        })
        .catch(error => {
            console.log(error.response)
        });
    }

    changeCatName(e) {
        var tempCat= this.state.categoryFormat
        var eVal = e.target.value

        tempCat.category_name = eVal
        this.setState({categoryFormat:tempCat,showEmptyCatAlert:false, has_changes: true})
      
    }

    setCategoryPhoto() {
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
        if(file[0].type !== "image/png" && file[0].type !== "image/jpeg")
        {
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

        var tempCat = this.state.categoryFormat
        api(config)
        .then(response =>{
            tempCat.category_photo = response.data.data.link;
            this.setState({platformFormat : tempCat})
        })
        .catch(function (error) {
            console.log(error);
        });

        document.getElementById('inputGroupFile01').value = ""
    }

    addPageToCategory(){
        //need to grab the largest order value and increase by 1 

        //CREATE A METHOD TO GET PROPER ORDER
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
            order: this.state.categoryFormat.pages.length
        }


        api.post('/pageFormat/add',newPage)
            .then(response => {

            //add page to platform 
            const addToCat = {
                category_format_id:this.state.categoryFormat._id,
                page_format_id : response.data._id
            }
            api.post('/categoryFormat/addToPages',addToCat)
            .then(response => {
                //updates platform format so page is rendered 
                
                // Add 1 to platform's page_length
                api.post('platformFormat/increment_pages_length_by', {plat_id: this.props.location.pathname.substring(14,38), inc: 1})
                .then(res => {
                    this.updateAllPageInfo();
                })
                .catch(err => console.log(err.response))
              })
            .catch(error => {
                console.log(error.response)
            });
          })
        .catch(error => {
            console.log(error.response)
        });


    }
    
    editPage(page_id) {
        var platform_format_id = this.props.location.pathname.substring(14,38);

        var category_format_id = this.props.location.pathname.substring(39);

        //need to fix editCategory url and 
        this.props.history.push(`/editPage/`+ platform_format_id +'/' + category_format_id+'/' + page_id);
    }

    submitChanges() {
        //Shouldn't be able to save changes if there's no changes to save
        if(!this.state.has_changes){
            return;
        }
        var tempCat = this.state.categoryFormat
        if(tempCat.category_name === "")
        {
            this.setState({showEmptyCatAlert:true})
            return
        }

        const newCat = {
            categoryID : this.state.categoryFormat._id,
            newCategoryName : tempCat.category_name,
            newCategoryPhoto : tempCat.category_photo,
        }

        api.post('/categoryFormat/updateWholeCat',newCat)
        .then(response => {
            this.setState({has_changes: false, submit_alert: true})
            setTimeout(() => {this.setState({submit_alert: false})}, 3000)
            })
        .catch(error => {
            console.log(error.response)
        });

    }

    removePage() {
        const pageInfo = {
            page_format_id : this.state.removeID
        }

        var tempArr = this.state.allPagesInfo

        tempArr.splice(this.state.removeIndex,1)

        this.setState({allPagesInfo : tempArr,showRemovePageModal:false})

        api.post('platformFormat/increment_pages_length_by', {plat_id: this.props.location.pathname.substring(14,38), inc: -1})
            .then(res => {
                api.post('/pageFormat/removePage',pageInfo)
                .then(response => {
                    
                })
                .catch(error => {
                    console.log(error.response)
                })
            })
            .catch(err => console.log(err.response));

    }

    previewCategory(){
        //will redirect user to preview Category
        var platform_format_id = this.props.location.pathname.substring(14,38);
        var category_format_id = this.props.location.pathname.substring(39);

        this.props.history.push(`/previewquiz/`+ platform_format_id +'/' + category_format_id);
    } 

    revealRemovePage(id,name,ind){
        this.setState({showRemovePageModal:true,removeID:id,removeName:name,removeIndex:ind})
    }

    handleRemovePageClose() {
        this.setState({showRemovePageModal:false})
    }
    
    componentDidMount() {
        var token = localStorage.getItem('usertoken');
        var allPages;
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
                        this.setState({username: response.data.username, id: decoded._id });

                        //grab the id of the platform 
                        var category_format_id = this.props.location.pathname.substring(39);

                        //get specific category format
                        api.get('/categoryFormat/getSpecificCategoryFormat/'+category_format_id)
                        .then(response => {
							this.setState({categoryFormat:response.data[0]})

                            var pagesArray = response.data[0].pages

                            //grab the pages 
                            api.post('/pageFormat/getAllPages',{pages_id:pagesArray})
                            .then(response =>{
                                allPages = response.data

                                this.setState({allPagesInfo:allPages})
                            })
                            .catch(error => {
                                console.log(error.response)
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
    render() {
        
        return (
            <div>
            <LoggedInNav props={this.props}/>
            <div style = {{display: "flex"}}>
                <div style={{marginLeft: "2%"}}>
                    <button style = {{color: 'white', fontSize: "45px"}} onClick={() =>  this.props.history.push("/editplatform/" + this.props.location.pathname.substring(14,38))} className="x_button"><FontAwesomeIcon icon={faArrowLeft} /></button>
                </div>
                <div style={{marginLeft: "41%", color: "rgb(0,219,0)", textDecoration: "underline", fontSize: "35px", marginTop: "1%", textUnderlinePosition: "under"}}>
                    Edit Quiz
                </div>
            </div>
            <div style={{background: "black", marginLeft: "20%", marginRight: "20%", marginTop: "3%", height: "auto", borderRadius: "10px", padding: "20px"}}>
                <div style={{display: "flex", justifyContent: "center", marginBottom: "2%"}}>
                    <div style={{fontSize: "25px", color: "white", marginRight: "2%"}}>
                        Enter Quiz Name: 
                    </div>
                    <input type="text" id="changeCategoryName" style={{width: "250px", borderRadius: "10px"}} value = {this.state.categoryFormat.category_name} onChange = {(e)=>this.changeCatName(e)}/> 
                    <div style={{marginLeft: "2%"}}>
                        <button style={{color: "white", background: "rgb(0,219,0)", padding: "10px", borderRadius: "10px", border: "transparent", fontSize: "20px"}} onClick = {this.submitChanges}>Submit Changes</button>
                    </div>
                </div>
                {this.state.submit_alert
                ?
                <div style={{color: "rgb(0,219,0", textAlign: "center"}}>
                    Your changes have successfully been saved!
                </div>
                :
                <p></p>
                }
                <Prompt when={this.state.has_changes} message="You have unsaved changes! Are you sure you want to leave this page?" />
                <Alert style={{width: "25%", textAlign: "center", margin: "auto"}} show = {this.state.showEmptyCatAlert} variant = 'danger'>
                    The Quiz Name can not be empty
                </Alert>
                <div style={{display: "flex", justifyContent: "center", marginTop: "3%", marginBottom: "3%"}}>
                    <button style={{color: "black", padding: "10px", borderRadius: "10px", border: "transparent", fontSize: "20px"}} onClick = {this.previewCategory}>Preview this Quiz</button>
                </div>
                
                
            </div>

            <div style={{display: "flex", marginLeft: "20%", marginRight: "20%", marginTop: "1%", marginBottom: "2%"}}>
                <div style={{background: "black", width: "45%", borderRadius: "10px", maxHeight: "633px", overflowY: "auto"}}>
                    <div style={{color: "white", fontSize: "25px", padding: "20px 20px 5px 20px", borderBottom: "1px solid rgb(0,219,0)", display: "flex"}}>
                        <div style={{margin: "auto"}}>
                            Pages: 
                        </div>
                        <div>
                            <button style={{color: "white", border: "transparent", borderRadius: "25px", background: "blue", fontSize: "20px"}} onClick={this.addPageToCategory}><FontAwesomeIcon icon={faPlus} /></button>
                        </div>
                    </div>

                    <div style={{padding: "20px"}}>
                        {this.state.allPagesInfo.map((page,index) => (
                            <div style={{display: "flex"}}>
                                <div style={{fontSize: "20px", padding: "5px"}}>
                                    <button style={{borderRadius: "10px", padding: "5px 15px 5px 15px"}} onClick={() => this.editPage(page._id)}>{page.page_title}</button>
                                </div>
                                <div style={{marginLeft: "auto", fontSize: "20px", marginTop: "auto", marginBottom: "auto"}}>
                                    <button style={{color: "red", border: "transparent", background: "transparent"}} onClick= {() => this.revealRemovePage(page._id,page.page_title,index)} disabled = {this.state.allPagesInfo.length < 2 ? true : false}>X</button>
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
                        src={this.state.categoryFormat.category_photo === "" ? DefaultCoverPhoto : this.state.categoryFormat.category_photo} 
                        width = {500} height = {400}
                        alt="coverphoto"
                        />
                        <div className="input-group mb-3" style={{marginTop: "15%"}}>
                            <div className="custom-file">
                            <input style={{color: "white", width: "100%", textAlignLast: "center"}}
                                type="file"
                                id="inputGroupFile01"
                                accept="image/*"
                                onChange={this.setCategoryPhoto}
                            />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            
            
            <Modal
                show={this.state.showRemovePageModal}
                onHide={this.handleRemovePageClose}
                backdrop="static"
                keyboard={false}
            >
           
                <Modal.Header closeButton>
                    <Modal.Title>Delete Page</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    Are you sure you wish to delete the page {this.state.removeName}?
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={this.handleRemovePageClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick = {this.removePage}>Confirm</Button>
                </Modal.Footer>
            </Modal>
        </div>
        )
    }
}