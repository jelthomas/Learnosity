import React, { Component } from 'react';
import {api} from "../axios_api.js";
import jwt from 'jsonwebtoken';
import jwt_decode from 'jwt-decode'
import "../format.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEyeSlash} from "@fortawesome/free-regular-svg-icons";
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
        this.handleNewPasswordOnChange = this.handleNewPasswordOnChange.bind(this);
        this.handleConfirmPasswordOnChange = this.handleConfirmPasswordOnChange.bind(this);
        this.toggle_password_vis = this.toggle_password_vis.bind(this);
        this.savePassword = this.savePassword.bind(this);
        this.toggle_confirm_password_vis = this.toggle_confirm_password_vis.bind(this);

        this.state = {
            userFormat: "",
            showRemoveUserModal:false,
            showBigFileAlert: false,
            showWrongFileTypeAlert: false,
            showUndefinedImageAlert: false,
            showPasswordMatchAlert: false,
            showPasswordValidAlert: false,
            new_password: '',
            confirm_password: '',
            hidden: false,
            hiddenConfirm: false,
            saved_password: false,
            showSamePasswordAlert: false
        }

    }

    savePassword(){
        if(this.state.new_password.length === 0 || this.state.new_password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/) === null)
        {
            this.setState({showPasswordValidAlert: true})
            return;
        }

        if(this.state.new_password !== this.state.confirm_password){
            this.setState({showPasswordMatchAlert: true});
            return;
        }

        console.log(this.state.confirm_password);
        //Save password
        api.post('/user/changePassword/', {password: this.state.new_password, confirm_password: this.state.userFormat.password, identifier: this.state.userFormat.username})
        .then(response => {
            document.getElementById('new_password').value = '';
            document.getElementById('confirm_password').value = '';
            if(response.data.value === 'invalid'){
                this.setState({showSamePasswordAlert: true});
            }
            else{
                this.setState({saved_password: true});
                setTimeout(() => {this.setState({saved_password: false})}, 3000);
            }
        })
        .catch(error => {
            console.log(error)
        });
    }


    toggle_password_vis(){
        this.setState({ hidden: !this.state.hidden });
    }

    toggle_confirm_password_vis(){
        this.setState({ hiddenConfirm: !this.state.hiddenConfirm });
    }


    handleNewPasswordOnChange(e){
        this.setState({new_password: e.target.value, showPasswordMatchAlert: false, showPasswordValidAlert: false, showSamePasswordAlert: false});
    }

    handleConfirmPasswordOnChange(e){
        this.setState({confirm_password: e.target.value, showPasswordMatchAlert: false, showPasswordValidAlert: false, showSamePasswordAlert: false});
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
                            localStorage.removeItem('usertoken');
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
                    window.location.reload();
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
                <div style={{display:"flex", marginLeft: "5%", marginRight: "5%", paddingTop: "15px"}}>
                    <div style={{textAlign: "center", width: "100%", fontSize: "35px"}} id="dash">Settings</div>
                </div>
                <div style={{marginLeft: "2.5%", marginRight: "2.5%"}} className="block">
                    <div className="top_block" style={{display: "flex"}}>
                        <div className="white_text">
                            Change password
                        </div>
                    </div>
                    <div style={{display:"flex", margin: "auto", width: "fit-content"}}>
                        <div style={{fontSize: "25px", color: "white", marginLeft: "-1%"}}>
                            New Password:
                        </div>
                        <input type={this.state.hidden ? 'text' : 'password'} style={{width: "250px", borderRadius: "10px", marginLeft: "1%"}} id="new_password" placeholder="Enter new password:" onChange = {(e) => this.handleNewPasswordOnChange(e)}/>
                        <button onClick = {() => this.toggle_password_vis()} style={{border: "transparent", background: "transparent", transform: "translate(-35px)"}}><FontAwesomeIcon icon={faEyeSlash} /></button>
                    </div>

                    <div style={{display:"flex", marginLeft: "36.5%", width: "fit-content", marginTop: "2%"}}>
                        <div style={{fontSize: "25px", color: "white", marginLeft: "-1%"}}>
                            Confirm Password:
                        </div>
                        <input type={this.state.hiddenConfirm ? 'text' : 'password'} style={{width: "250px", borderRadius: "10px", marginLeft: "1%"}} id="confirm_password" placeholder="Confirm password:" onChange = {(e) => this.handleConfirmPasswordOnChange(e)}/>
                        <button onClick = {() => this.toggle_confirm_password_vis()} style={{border: "transparent", background: "transparent", transform: "translate(-35px)"}}><FontAwesomeIcon icon={faEyeSlash} /></button>
                    </div> 
                    <Alert style={{textAlign: "center", margin: "auto", width: "fit-content", marginTop: "2%"}} show = {this.state.showPasswordMatchAlert} variant = 'danger'>
                        Passwords do not match.
                    </Alert>
                    <Alert style={{textAlign: "center", margin: "auto", width: "fit-content", marginTop: "2%"}} show = {this.state.showPasswordValidAlert} variant = 'danger'>
                        Password needs a minimum of 8 characters.
                        It must include at least one lowercase letter, one uppercase letter, and one number.
                    </Alert>
                    <Alert style={{textAlign: "center", margin: "auto", width: "fit-content", marginTop: "2%"}} show = {this.state.showSamePasswordAlert} variant = 'danger'>
                        Your password should be different than your current password!
                    </Alert>
                    {this.state.saved_password
                    ?
                    <div style={{fontSize: "20px", color: "rgb(0,219,0)", width: "fit-content", margin: "auto"}}>
                        You have successfully changed your password!
                    </div>
                    :
                    <p></p>
                    }
                    <div style={{margin: "auto", marginTop: "1%", width: "fit-content"}}>
                        <button style={{background: "white", padding: "10px", borderRadius: "10px", fontSize: "20px"}} onClick ={() => this.savePassword()}>Save Password</button>
                    </div>

                </div>
                <div style={{marginLeft: "2.5%", marginRight: "2.5%"}} className="block">
                    <div className="top_block" style={{display: "flex"}}>
                        <div className="white_text">
                            Change Profile Picture
                        </div>
                    </div>
                    <div style={{marginLeft: "45%"}}>
                            
                            <img id="settings_profile"
                            src={this.state.userFormat.profile_picture === "" ? DefaultProfilePicture : this.state.userFormat.profile_picture} 
                            width = {200}
                            alt="profilepicture"
                            />
                
                            <div style={{color: "white"}} className="input-group mb-3">
                                <div className="custom-file">
                                <input
                                    type="file"
                                    id="inputGroupFile01"
                                    accept="image/*"
                                    onChange={this.setUserProfilePicture}
                                />
                                </div>
                            </div>
                        </div>
                </div>
                <Alert style={{textAlign: "center", margin: "auto", width: "fit-content"}} show = {this.state.showBigFileAlert} variant = 'danger'>
                    The file selected is greater than 10 MB. 
                </Alert>
                <Alert style={{textAlign: "center", margin: "auto", width: "fit-content"}} show = {this.state.showWrongFileTypeAlert} variant = 'danger'>
                    The file selected is not of type jpeg or png.
                </Alert>
                <div style={{width: "fit-content", margin: "auto", marginTop: "2%", marginBottom: "2%"}}>
                    <button style={{fontSize: "20px"}} onClick={this.revealRemoveUserModal} class="btn btn-danger">Delete Account</button>
                </div>

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
                    Are you sure you want to permanently delete your account? This will permanently delete all platforms and quizzes you have created
                </Modal.Body>
                <Modal.Footer>
                <Button variant="secondary" onClick={this.handleCloseRemoveUser}>
                    Cancel
                </Button>
                <Button variant="primary" onClick = {this.deleteAccount}>Confirm</Button>
                </Modal.Footer>
                </Modal>
            </div>
        )
    }
}