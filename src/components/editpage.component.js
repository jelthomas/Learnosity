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
        this.changeMCC = this.changeMCC.bind(this);
        this.changeMCA = this.changeMCA.bind(this);
        this.addMCC = this.addMCC.bind(this);
        this.removeMCC = this.removeMCC.bind(this);

        this.state = {
            user_id: '',
            pageFormat:'',
        }
    }

    updatePageFormat(){
        var page_id = this.props.location.pathname.substring(60);

                        
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

    changeMCC(ind) {
        //method for changing value inside of a multiple choice 
        //needs to update in state and database 
        var inputVal = document.getElementById('changeMCC'+ind).value

        if(inputVal.length < 1)
        {
            var MCC = this.state.pageFormat;
            MCC.multiple_choices[ind] = inputVal;

            document.getElementById('changeMCC'+ind).placeholder = "Multiple Choice Choice Required";

            this.setState({pageFormat:MCC});
            return
        }   
        else 
        {
            //temp variable with updated value at index
            var MCC = this.state.pageFormat;
            MCC.multiple_choices[ind] = inputVal;


            const newMCC = {
                pageID : this.state.pageFormat._id,
                newChoices : MCC.multiple_choices
            }

            //call update page name
            api.post('/pageFormat/updateMultipleChoiceChoice',newMCC)
            .then(response => {
                console.log(response)
                //updates platform format so page is rendered properly
                this.updatePageFormat();
            })
            .catch(error => {
                console.log(error)
            });
        }
    }

    changeMCA() {
        //method for changing value of a multiple choice answer
        //needs to update in state and database 

        var inputVal = document.getElementById('changeMCA').value

        if(inputVal.length < 1)
        {
            var MCA = this.state.pageFormat;
            MCA.multiple_choice_answer = inputVal;

            document.getElementById('changeMCA').placeholder = "Multiple Choice Answer Required";

            this.setState({pageFormat:MCA});
            return
        }   
        else 
        {
            const newMCA = {
                pageID : this.state.pageFormat._id,
                newMCAnswer : inputVal
            }

            //call update page name
            api.post('/pageFormat/updateMultipleChoiceAnswer',newMCA)
            .then(response => {
                console.log(response)
                //updates platform format so page is rendered properly
                this.updatePageFormat();
            })
            .catch(error => {
                console.log(error)
            });
        }
    }

    addMCC() {
        //adds multiple choice choice to the array 
        //will be disabled when there are 5 choices 

        var page_id = this.props.location.pathname.substring(60);

        const newMCC = {
            page_format_id : page_id,
            value : "New Choice"
        }

        api.post('/pageFormat/addToMCC',newMCC)
        .then(response => {
            //console.log(response)
            //updates page format so page is rendered properly
            this.updatePageFormat();
        })
        .catch(error => {
            console.log(error)
        });
    }

    removeMCC(ind) {


        var mcArray = this.state.pageFormat.multiple_choices;
        mcArray.splice(ind,1)

        console.log(mcArray)

        const newMCC = {
            pageID : this.state.pageFormat._id,
            newChoices : mcArray
        }

        //call update page name
        api.post('/pageFormat/updateMultipleChoiceChoice',newMCC)
        .then(response => {
            console.log(response)
            //updates platform format so page is rendered properly
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


                        var page_id = this.props.location.pathname.substring(60);

                        
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

            {this.state.pageFormat.type === "Multiple Choice"
                ?
                    <div >
                        <p>Multiple Choice Type </p>
                        <button onClick={this.addMCC} disabled = {this.state.pageFormat.multiple_choices.length > 4 ? true : false}>Add Choice</button>
                        <p>Choices:</p>
                        {this.state.pageFormat.multiple_choices.map((choice,index) => (
                            <div>
                            <input type="text" id={"changeMCC"+ index} value = {choice} onChange = {()=>this.changeMCC(index)}/>
                            <button onClick={()=>this.removeMCC(index)} disabled = {this.state.pageFormat.multiple_choices.length < 2 ? true : false}>X</button>
                            </div>
                        ))}
                        <p>Answer:</p>
                        <input type="text" id="changeMCA" value = {this.state.pageFormat.multiple_choice_answer} onChange = {this.changeMCA}/>
                    </div>
                :
                    (this.state.pageFormat.type === "Fill in the Blank"
                    ?
                        <div >
                            <p>Fill in the Blank Type </p>
                        </div>
                        
                    :

                        (this.state.pageFormat.type === "Matching"
                        ?
                            <div >
                                <p>Matching Type </p>
                            </div>
                        :
                            (this.state.pageFormat.type === "Timer"
                            ?
                                <div >
                                    <p>Timer Type </p>
                                </div>
                            :
                                <div >
                                    <p>IMPOSSIBLE</p>
                                </div>
                            )
                        )
                    )
            }
        </div>
    );
}
}