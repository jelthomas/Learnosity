import React, { Component } from 'react';
import {api} from "../axios_api.js";
import jwt from 'jsonwebtoken';
import { Link } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
require('dotenv').config();

export default class EditPage extends Component {
    constructor(props){
        super(props);

        this.updatePageFormat = this.updatePageFormat.bind(this);
        this.changePageName = this.changePageName.bind(this);
        this.changePrompt = this.changePrompt.bind(this);
        this.changePageType = this.changePageType.bind(this);

        this.state = {
            user_id: '',
            pageFormat:'',
        }
    }

    updatePageFormat(){
        var page_id = this.props.location.pathname.substring(35);

                        
        api.get('/pageFormat/getSpecificPage/'+page_id)
        .then(response => {
            this.setState({pageFormat : response.data})
          })
        .catch(error => {
            console.log(error.response)
        });
    }

    changePageName(){
        var inputVal = document.getElementById('changePageName').value

        if(inputVal.length < 1)
        {
            var pageName = this.state.pageFormat;
            pageName.page_title = inputVal;

            document.getElementById('changePageName').placeholder = "Page Name Required";

            this.setState({pageFormat:pageName});
            return
        }   
        else 
        {
            const newName = {
                pageID : this.state.pageFormat._id,
                newPageName : inputVal
            }

            //call update platname 
            api.post('/pageFormat/updatePageName',newName)
            .then(response => {
                //console.log(response)
                //updates platform format so page is rendered properly
                this.updatePageFormat();
            })
            .catch(error => {
                console.log(error)
            });
        }
    }

    changePrompt(){
        var inputVal = document.getElementById('changePrompt').value

        if(inputVal.length < 1)
        {
            var prompt = this.state.pageFormat;
            prompt.prompt = inputVal;

            document.getElementById('changePrompt').placeholder = "Prompt Required";

            this.setState({pageFormat:prompt});
            return
        }   
        else 
        {
            const newPrompt = {
                pageID : this.state.pageFormat._id,
                newPrompt : inputVal
            }

            //call update page format
            api.post('/pageFormat/updatePrompt',newPrompt)
            .then(response => {
                //console.log(response)
                //updates page format so page is rendered properly
                this.updatePageFormat();
            })
            .catch(error => {
                console.log(error)
            });
        }
    }

    changePageType(){
        console.log("page Type changed")
        var pageType = document.getElementById('pType').value

        const newPageType = {
            pageID : this.state.pageFormat._id,
            newPageType : pageType
        }

        //call update page Format 
        api.post('/pageFormat/updatePageType',newPageType)
        .then(response => {
            //console.log(response)
            //updates page format so page is rendered properly
            this.updatePageFormat();
        })
        .catch(error => {
            console.log(error)
        });
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
                api.get('/user/getSpecificUser/'+ decoded._id)
                .then(response => {
                    if (response) {
                        //Valid user
                        var user_id = response.data._id;


                        var page_id = this.props.location.pathname.substring(35);

                        
                        api.get('/pageFormat/getSpecificPage/'+page_id)
                        .then(response => {
                            console.log(response.data)
                            this.setState({pageFormat : response.data})
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
            <p>Page Name</p>
            <input type="text" id="changePageName" value = {this.state.pageFormat.page_title} onChange = {this.changePageName}/> 
            <p>Prompt</p>
            <input type="text" id="changePrompt" value = {this.state.pageFormat.prompt} onChange = {this.changePrompt}/>
            <select onChange = {this.changePageType} value = {this.state.pageFormat.type} id = "pType">
                <option value="Multiple Choice">Multiple Choice</option>
                <option value="Fill in the Blank">Fill in the Blank</option>
                <option value="Matching">Matching</option>
                <option value="Timer">Timer</option>
            </select>
        </div>
    );
}
}