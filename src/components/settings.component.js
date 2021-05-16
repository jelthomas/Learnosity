import React, { Component } from 'react';
import {api} from "../axios_api.js";
import jwt from 'jsonwebtoken';
import jwt_decode from 'jwt-decode'
import "../format.css";
import Card from "react-bootstrap/Card"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faPlay, faAngleRight, faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import LoggedInNav from "./loggedInNav.component";
import DefaultProfilePicture from "../images/userIcon.png"
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
require('dotenv').config();


export default class Settings extends Component {
    constructor(props){
        super(props);
        this.setUserProfilePicture = this.setUserProfilePicture.bind(this);
        this.deleteAccount = this.deleteAccount.bind(this);
        this.revealRemoveUserModal = this.revealRemoveUserModal.bind(this);
        this.handleCloseRemoveUser = this.handleCloseRemoveUser.bind(this);
        

        this.state = {
            userFormat: "",
            showRemoveUserModal:false
        }

    }

    handleCloseRemoveUser() {
        this.setState({showRemoveUserModal:false})
    }

    revealRemoveUserModal() {
        this.setState({showRemoveUserModal:true})
    }

    deleteAccount() {
        var tempUser = this.state.userFormat

        // const removeUser = {
        //     created_platform_ids  : tempUser.created_platforms
        // }

        //grabs platformformats for every plat_id in created_platforms 
        api.post('/platformFormat/getAllPlatforms', {created_platform_ids: tempUser.created_platforms})
        .then(allPlats => {
            console.log(allPlats.data)
            var all_categories = [];
            for(var i = 0; i < allPlats.data.length; i++)
            {
                var cats = allPlats.data[i].categories
                all_categories = all_categories.concat(cats)

            }

            console.log(all_categories)
            //grabs category formats for all category ids 
            var all_pages = [];
            api.post('/categoryFormat/getAllCategories', {categories_id: all_categories})
            .then(categories => {

                var category_formats = categories.data;

                var all_pages = [];

                for(var i = 0; i < category_formats.length; i++){
                    var categorys_pages = category_formats[i].pages;
                    all_pages = all_pages.concat(categorys_pages);
                }

                console.log(all_pages)

                const removeUser = {
                    user_format_id : tempUser._id,
                    created_platform_ids  : tempUser.created_platforms,
                    category_format_ids : all_categories
                }

                //deletes all pages
                //after deleting pages we call remove user backend route
                api.post('/pageFormat/delete_all_pages', {all_pages: all_pages})
                .then(res2=>{
                    api.post('/user/removeUser', removeUser)
                    .then(res3 => {
                            this.props.history.push(`/`);
                        })
                    .catch(err3 => {
                        console.log(err3.response)
                    });
                })
                .catch(err4 => {
                    console.log(err4.response);
                })

                //delete all pages 
            })
            .catch(err2 => {
                console.log(err2.response)
            })

        })
        .catch(err => {
            console.log(err.response)
        })

        console.log("delete")
    }

    setUserProfilePicture() {
            const file = document.getElementById('inputGroupFile01').files
            //checks if file is properly defined
            if(file[0] === undefined) {
                console.log("File is Undefined")
                return
            }
            //checks if file size is greater then 10 MB
            if(file[0].size > 10000000) {
                console.log("File Size is bigger then 10 MB")
                return
            }
    
            //checks the type of file
            if(file[0].type !== "image/png" && file[0].type !== "image/jpeg")
            {
                console.log(file[0].type)
                console.log("Invalid Page Type")
                return
            }
    
            console.log("Gets Pasts Checks For Image")
    
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
        
            //var platID = this.state.platformFormat._id

            //need to update database 
            var tempUser = this.state.userFormat
            api(config)
            .then(response =>{
                console.log((response.data.data.link));
                tempUser.profile_picture = response.data.data.link;
                // this.setState({userFormat : tempUser})

                const updatePic= {
                    user_id : tempUser._id,
                    newPicture : response.data.data.link
                }
               
                api.post('/user/updateProfilePicture/',updatePic)
                .then(res =>{
                    console.log(res)
                    this.setState({userFormat : tempUser})
                })
                .catch(err => {
                    console.log(err.response)
                })
            })
            .catch(function (error) {
                console.log(error);
            });
    
            document.getElementById('inputGroupFile01').value = ""
    
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
                api.get('/user/getSpecificUser/'+ decoded._id)
                .then(response => {
                    if (response) {
                        //Valid user
                        //Begin getting platforms for display

                        this.setState({userFormat:response.data})

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
                <p>Settings Page</p>
                <img  
                src={this.state.userFormat.profile_picture === "" ? DefaultProfilePicture : this.state.userFormat.profile_picture} 
                width = {200}
                alt="profilepicture"
                />
                <div className="input-group mb-3">
                    <div className="custom-file">
                    <input
                        type="file"
                        id="inputGroupFile01"
                        accept="image/*"
                        onChange={this.setUserProfilePicture}
                    />
                    {/* <label className="custom-file-label" htmlFor="inputGroupFile01">
                        {this.state.fileName === "" ? "Choose an image file" : this.state.fileName}
                    </label> */}
                    </div>
                </div>
                <button onClick={this.revealRemoveUserModal} class="btn btn-danger">Delete Account</button>

                <Modal
                show={this.state.showRemoveUserModal}
                onHide={this.handleCloseRemoveUser}
                backdrop="static"
                keyboard={false}
                >
                <Modal.Header closeButton>
                    <Modal.Title>Delete Account</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete your account?
                </Modal.Body>
                <Modal.Footer>
                <Button variant="secondary" onClick={this.handleClose}>
                    Cancel
                </Button>
                <Button variant="primary" onClick = {this.deleteAccount}>Confirm</Button>
                </Modal.Footer>
                </Modal>
            </div>
        )
    }
}