import React, { Component } from 'react';
import {api} from "../axios_api.js";
import jwt from 'jsonwebtoken';
import { Link } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import LoggedInNav from "./loggedInNav.component";
require('dotenv').config();

export default class EditPage extends Component {
    constructor(props){
        super(props);

        this.updatePageFormat = this.updatePageFormat.bind(this);
        this.updatePageAndFIB = this.updatePageAndFIB.bind(this);
        this.changePageName = this.changePageName.bind(this);
        this.changePrompt = this.changePrompt.bind(this);
        this.changePageType = this.changePageType.bind(this);
        this.changeMCC = this.changeMCC.bind(this);
        this.changeMCA = this.changeMCA.bind(this);
        this.addMCC = this.addMCC.bind(this);
        this.removeMCC = this.removeMCC.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleSubmitModal = this.handleSubmitModal.bind(this);
        this.revealModal = this.revealModal.bind(this);
        this.removeMP = this.removeMP.bind(this);

        this.revealEditModal = this.revealEditModal.bind(this);
        this.handleEditClose = this.handleEditClose.bind(this);
        this.handleSubmitEditModal = this.handleSubmitEditModal.bind(this);
        this.changeEditKey = this.changeEditKey.bind(this);
        this.changeEditVal = this.changeEditVal.bind(this);

        this.submitFIB = this.submitFIB.bind(this);
        this.insertBlank = this.insertBlank.bind(this);
        this.removeFIB = this.removeFIB.bind(this);
        this.updateFIBInput = this.updateFIBInput.bind(this);

        this.state = {
            user_id: '',
            pageFormat: '',
            showModal: false,
            showEditModal:false,
            showEmptyAlert: false,
            showEmptyAlert2:false,
            showEmptyAlert3:false,
            showBothEndsAlert:false,
            editKey:'',
            editVal:'',
            originalKey:'',
            originalVal:'',
            editIndex:0,
            fibArray:[]
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

    updatePageAndFIB(){
        var page_id = this.props.location.pathname.substring(60);

                        
        api.get('/pageFormat/getSpecificPage/'+page_id)
        .then(response => {
            console.log(response.data)
            if(Object.keys(response.data.fill_in_the_blank_answers)[0] === "0" && Object.values(response.data.fill_in_the_blank_answers)[0] === "")
            {
                this.setState({pageFormat : response.data,fibArray : ["","",""]})
            }
            else
            {
                //create custom fibArray with algorithm 
                //this means that fib has saved values before 
                var fibPrompt = response.data.fill_in_the_blank_prompt
                var tempArr=[]
                var num=0;
                for(var j = 0; j < Object.keys(response.data.fill_in_the_blank_answers).length;j++)
                {
                    var pos = Object.keys(response.data.fill_in_the_blank_answers)[j];
                    pos = parseInt(pos, 10)
                    console.log(num,pos)
                    var str="";
                    if(num === 0)
                    {
                        str = fibPrompt.substring(num,pos-1)
                    }
                    else
                    {
                        str = fibPrompt.substring(num+1,pos-1)
                    }
                    tempArr.push(str)
                    tempArr.push(Object.values(response.data.fill_in_the_blank_answers)[j])
                    num = pos;
                }
                //after still need to substring once more 

                var endStr = fibPrompt.substring(num+1)
                tempArr.push(endStr)

                console.log(tempArr)


                this.setState({fibArray : tempArr,pageFormat : response.data})
            }
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
        var Questions = (this.state.pageFormat.multiple_choices.length)

        const newMCC = {
            page_format_id : page_id,
            value : "New Choice " + Questions
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

    revealModal(ind){
        this.setState({
            showModal:true
        })
    }

    handleClose(e) {
        this.setState({
            showModal: false
        })
    }

    handleSubmitModal() {
        console.log("submitting modal ")

        var inputP1 = document.getElementById('inputpair1').value
        var inputP2 = document.getElementById('inputpair2').value
        //checks if either field is empty 
        if (inputP1 === "" || inputP2 === ""){
            console.log("EMPTY INPUTS")
            //need to make empty alert become false after some time 
            this.setState({
                showEmptyAlert: true
            })

            return
        }

        var page_id = this.props.location.pathname.substring(60);
        inputP1 = "matching_pairs." + inputP1

        //creating obj to insert into database
        var testObj= {};

        testObj[inputP1] = inputP2


        console.log(inputP1)
        const newMP= {
            page_format_id : page_id,
            newPair: testObj
        }

        api.post('/pageFormat/addToMP',newMP)
        .then(response => {
            console.log(response)
            //updates page format so page is rendered properly
            this.updatePageFormat();
        })
        .catch(error => {
            console.log(error)
        });

        this.handleClose()
    }

    removeMP(ind) {
        console.log("inside removeMP")
        console.log(this.state.pageFormat.matching_pairs)

        var tempArr = this.state.pageFormat.matching_pairs

        var removeKey = Object.keys(this.state.pageFormat.matching_pairs)[ind]

        //research if there is a better way then delete
        // tempArr[removeKey] = undefined

        delete tempArr[removeKey]

        console.log(tempArr)

        var page_id = this.props.location.pathname.substring(60);

        const newMP= {
            pageID : page_id,
            newMatching: tempArr
        }

        api.post('/pageFormat/updateMatchingPair',newMP)
        .then(response => {
            console.log(response)
            //updates page format so page is rendered properly
            this.updatePageFormat();
        })
        .catch(error => {
            console.log(error)
        });

    }

    revealEditModal(ind){

        this.setState({showEmptyAlert2:false})
        //will also set state variables so we have the proper values 
        this.setState({
            showEditModal: true
        })

        var editK = Object.keys(this.state.pageFormat.matching_pairs)[ind]
        var editV = Object.values(this.state.pageFormat.matching_pairs)[ind]


        this.setState({editKey:editK,editVal:editV,originalKey:editK,originalVal:editV,editIndex:ind})
    }

    handleEditClose(){
        this.setState({
            showEditModal: false
        })
    }

    handleSubmitEditModal(){
        //when submit button is pressed
        //save the key and value into state variables 
        //allow user to edit 
        //when they click submit 
        //remove the key and value
        //add new key value 
        
        //checks if inputs are empty 
        //checks if either value is in either keys or value 
        var tempArr;
        if(this.state.editKey === "" || this.state.editVal === "")
        {
            this.setState({showEmptyAlert2:true})
            return
        }
        else if (this.state.editKey === this.state.originalKey)
        {
            tempArr = this.state.pageFormat.matching_pairs
            tempArr[this.state.editKey] = this.state.editVal
        }   
        else 
        {
            console.log(this.state.editKey)
            console.log(this.state.editVal)


            var convertArr = Object.entries(this.state.pageFormat.matching_pairs)

            convertArr.splice(this.state.editIndex,0,[this.state.editKey,this.state.editVal])

            var changedArr = Object.fromEntries(convertArr)

            delete changedArr[this.state.originalKey]

            console.log(changedArr)

            tempArr = changedArr

        }

        var page_id = this.props.location.pathname.substring(60);

        const newMP= {
            pageID : page_id,
            newMatching: tempArr
        }

        api.post('/pageFormat/updateMatchingPair',newMP)
        .then(response => {
            console.log(response)
            //updates page format so page is rendered properly
            this.updatePageFormat();
        })
        .catch(error => {
            console.log(error)
        });
        
    
        this.handleEditClose();
    }

    changeEditKey(val){
        console.log(val)
        this.setState({editKey : val})
    }

    changeEditVal(val){
        console.log(val)
        this.setState({editVal : val})
    }

    submitFIB(){
        var inputArr = this.state.fibArray

        var newPrompt = ""
        var newAnswers = {}
        var newKey = ""

        for(var i = 0; i < inputArr.length; i++)
        {
            if(inputArr.length === 3 && document.getElementById('fibInput'+0).value === "" && document.getElementById('fibInput'+(inputArr.length-1)).value === "")
            {
                this.setState({showBothEndsAlert:true})
                return
            } 
            console.log('fibInput'+i,document.getElementById('fibInput'+i).value)

            var input = document.getElementById('fibInput'+i).value
            if(input === "" && i !== 0 && i !== inputArr.length-1)
            {
                this.setState({showEmptyAlert3:true})   
                return
            }

            if(i % 2 === 0)
            {
                newPrompt = newPrompt + input
                
                if(input === "")
                {
                    newKey = "" + (newPrompt.length) 
                }
                else
                {
                    newKey = "" + (newPrompt.length +1) 
                }
                

                if(i+1 !== inputArr.length)
                {
                    newPrompt = newPrompt + "  "
                }
            }
            else
            {
                newAnswers[newKey] = input
            }
        }

        console.log(newPrompt)
        console.log(newAnswers)
        
        var page_id = this.props.location.pathname.substring(60);

        const newFIB = {
            pageID : page_id,
            newfibAnswers: newAnswers,
            newfibPrompt: newPrompt
        }
        
        
        api.post('/pageFormat/updatefibPromptAnswer',newFIB)
        .then(response => {
            console.log(response)
            //updates page format so page is rendered properly
            this.updatePageAndFIB();
        })
        .catch(error => {
            console.log(error)
        });

    }

    insertBlank(){
        var tempArr = this.state.fibArray

        tempArr.push("")
        tempArr.push("")

        //update the 
        this.setState({fibArray:tempArr})
    }

    removeFIB(ind){
        var tempArr = this.state.pageFormat.fill_in_the_blank_answers

        var removeIndex = Math.round(ind/2) - 1

        var deleteKey = Object.keys(tempArr)[removeIndex]

        delete tempArr[deleteKey]

        var page_id = this.props.location.pathname.substring(60);


        const newInfo = {
            pageID : page_id,
            newfibAnswers:tempArr,
        }

        api.post('/pageFormat/updatefibAnswer',newInfo)
        .then(response => {
            //updates page format and fib state array
            this.updatePageAndFIB();
        })
        .catch(error => {
            console.log(error)
        });

    }

    updateFIBInput(ind){
        var val = document.getElementById('fibInput'+ind).value

        var tempArr = this.state.fibArray.slice()

        tempArr[ind]=val;

        this.setState({fibArray:tempArr,showEmptyAlert3:false,showBothEndsAlert:false})
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

                            //create temp array that will be stored as state variable 
                            
                            if(Object.keys(response.data.fill_in_the_blank_answers)[0] === "0" && Object.values(response.data.fill_in_the_blank_answers)[0] === "")
                            {
                                this.setState({pageFormat : response.data,fibArray : ["","",""]})
                            }
                            else
                            {
                                //create custom fibArray with algorithm 
                                //this means that fib has saved values before 
                                var fibPrompt = response.data.fill_in_the_blank_prompt
                                var tempArr=[]
                                var num=0;
                                for(var j = 0; j < Object.keys(response.data.fill_in_the_blank_answers).length;j++)
                                {
                                    var pos = Object.keys(response.data.fill_in_the_blank_answers)[j];
                                    pos = parseInt(pos, 10)
                                    console.log(num,pos)
                                    var str="";
                                    if(num === 0)
                                    {
                                        str = fibPrompt.substring(num,pos-1)
                                    }
                                    else
                                    {
                                        str = fibPrompt.substring(num+1,pos-1)
                                    }
                                    tempArr.push(str)
                                    tempArr.push(Object.values(response.data.fill_in_the_blank_answers)[j])
                                    num = pos;
                                }
                                //after still need to substring once more 

                                var endStr = fibPrompt.substring(num+1)
                                tempArr.push(endStr)

                                console.log(tempArr)


                                this.setState({pageFormat : response.data,fibArray : tempArr})
                            }
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
        <div>
            <LoggedInNav props={this.props}/>
            <div style = {{display: "flex"}}>
                <div style={{marginLeft: "2%"}}>
                    <button style = {{color: 'white', fontSize: "45px"}} onClick={() =>  this.props.history.push("/editplatform/" + this.props.location.pathname.substring(14,38))} className="x_button"><FontAwesomeIcon icon={faArrowLeft} /></button>
                </div>
                <div style={{margin: "auto", color: "rgb(0,219,0)", fontSize: "30px", borderBottom: "2px solid white", width: "fit-content"}}>
                    Edit Question: 
                </div>
            </div>
            {this.state.pageFormat.type === "Multiple Choice"
                ?
                    <div>
                        <div style={{display: "flex", justifyContent: "center", color: "white", marginTop: "2%", marginBottom: "2%"}}>
                            <div style={{display: "flex", margin: "auto"}}>
                                <div style={{marginLeft: "-2%", fontSize: "25px", height: "fit-content"}}>
                                    Question Name: 
                                </div>
                                <input style={{marginLeft: "2%", fontSize: "20px", borderRadius: "8px", padding: "5px", height: "fit-content"}} type="text" id="changePageName" value = {this.state.pageFormat.page_title} onChange = {this.changePageName}/> 
                            </div>
                            <div style={{display: "flex", margin: "auto"}}>
                                <div style={{marginLeft: "-2%", fontSize: "25px", height: "fit-content"}}>
                                    Question Type: 
                                </div>
                                <select style={{marginLeft: "2%", fontSize: "20px", borderRadius: "8px", padding: "5px"}} onChange = {this.changePageType} value = {this.state.pageFormat.type} id = "pType">
                                    <option value="Multiple Choice">Multiple Choice</option>
                                    <option value="Fill in the Blank">Fill in the Blank</option>
                                    <option value="Matching">Matching</option>
                                    <option value="Timer">Timer</option>
                                </select>
                            </div>
                            <button style={{margin: "auto", fontSize: "20px", borderRadius: "8px", padding: "5px", background: "white"}} onClick={this.addMCC} disabled = {this.state.pageFormat.multiple_choices.length > 4 ? true : false}>Add Choice</button>
                        </div>
                        <div style={{background: "#edd2ae", textAlign: "center", marginLeft: "5%", marginRight: "5%", borderRadius: "8px", padding: "5%"}}>
                            <div>
                                <div style={{display: "flex", justifyContent: "center", marginBottom: "2%", marginRight: "3%"}}>
                                    <div style={{marginLeft: "-1%", fontSize: "25px"}}>
                                        Question:
                                    </div>
                                    <input style={{marginLeft: "1%", width: "41%", fontSize: "20px", borderRadius: "8px", padding: "5px"}} type="text" id="changePrompt" value = {this.state.pageFormat.prompt} placeholder= "Enter your multiple choice question: " onChange = {this.changePrompt}/>
                                </div>
                                <div>
                                    {this.state.pageFormat.multiple_choices.map((choice,index) => (
                                        <div style={{display:"flex", justifyContent: "center", marginTop: "0.5%"}}>
                                            <div style={{marginLeft: "-1%", fontSize: "20px"}}>
                                                Incorrect Option: 
                                            </div>
                                            <input style={{marginLeft: "1%", width: "40%", fontSize: "15px", borderRadius: "8px", padding: "5px"}} type="text" id={"changeMCC"+ index} value = {choice} onChange = {()=>this.changeMCC(index)}/>
                                            <button style = {{background: "red", border: "transparent", borderRadius: "8px", marginLeft: "1%"}} onClick={()=>this.removeMCC(index)} disabled = {this.state.pageFormat.multiple_choices.length < 2 ? true : false}>X</button>
                                        </div>
                                    ))}
                                </div>
                                <div style={{display: "flex", justifyContent: "center", marginTop: "2%", marginRight: "7%"}}>
                                    <div style={{marginLeft: "-1%", fontSize: "20px"}}>
                                        Correct Answer: 
                                    </div>
                                    <input style={{marginLeft: "1%", width: "43%", fontSize: "15px", borderRadius: "8px", padding: "5px"}} type="text" id="changeMCA" value = {this.state.pageFormat.multiple_choice_answer} onChange = {this.changeMCA}/>
                                </div>
                            </div>
                        </div>
                    </div>
                :
                    (this.state.pageFormat.type === "Fill in the Blank"
                    ?
                            <div >
                                <div style={{display: "flex", justifyContent: "center", color: "white", marginTop: "2%", marginBottom: "2%"}}>
                                    <div style={{display: "flex", margin: "auto"}}>
                                        <div style={{marginLeft: "-2%", fontSize: "25px", height: "fit-content"}}>
                                            Question Name: 
                                        </div>
                                        <input style={{marginLeft: "2%", fontSize: "20px", borderRadius: "8px", padding: "5px", height: "fit-content"}} type="text" id="changePageName" value = {this.state.pageFormat.page_title} onChange = {this.changePageName}/> 
                                    </div>
                                    <div style={{display: "flex", margin: "auto"}}>
                                        <div style={{marginLeft: "-2%", fontSize: "25px", height: "fit-content"}}>
                                            Question Type: 
                                        </div>
                                        <select style={{marginLeft: "2%", fontSize: "20px", borderRadius: "8px", padding: "5px"}} onChange = {this.changePageType} value = {this.state.pageFormat.type} id = "pType">
                                            <option value="Multiple Choice">Multiple Choice</option>
                                            <option value="Fill in the Blank">Fill in the Blank</option>
                                            <option value="Matching">Matching</option>
                                            <option value="Timer">Timer</option>
                                        </select>
                                    </div>
                                    <button style={{margin: "auto", fontSize: "20px", borderRadius: "8px", padding: "5px", background: "white"}} onClick={this.insertBlank} disabled = {this.state.fibArray.length <11 ? false : true}>Insert Blank</button>
                                </div>
                                <div style={{background: "#edd2ae", marginLeft: "5%", marginRight: "5%", borderRadius: "8px", padding: "2% 5% 5% 5%"}}>
                                    <div style={{display: "flex", flexWrap: "wrap"}}>
                                        <div style={{marginLeft: "auto", fontSize: "25px", marginTop: "2%"}}>
                                            Prompt:
                                        </div>
                                        {this.state.fibArray.map((input,index) => (
                                            (index %2 ==0    
                                            ?
                                                <div style={{maxWidth: "325px", marginRight: "2%", marginTop: "2%"}}>
                                                    <input style={{width: "-webkit-fill-available", fontSize: "15px", borderRadius: "8px", padding: "5px", marginLeft: "3%"}} type="text" id={"fibInput"+index} value = {input} placeholder = "If needed, enter your prompt here:" onChange = {() => this.updateFIBInput(index)} size={50}></input>
                                                </div>
                                            :
                                                <div style={{display: "flex", maxWidth: "195px", marginRight: "2%", marginTop: "2%"}}>
                                                    <input type="text" id={"fibInput"+index} style={{borderColor: "red", width: "-webkit-fill-available", fontSize: "15px", borderRadius: "8px", padding: "5px"}} placeholder = "Answer is required: " value = {input} onChange = {() => this.updateFIBInput(index)} size={50}></input>
                                                    <button style = {{background: "red", border: "transparent", borderRadius: "8px", marginLeft: "1%"}} onClick={()=>this.removeFIB(index)} disabled = {Object.keys(this.state.pageFormat.fill_in_the_blank_answers).length < 2 ? true : false}>X</button>
                                                </div>
                                            )
                                        ))}
                                        <Alert show = {this.state.showEmptyAlert3} variant = 'danger'>
                                            The text fields can not be empty
                                        </Alert>
                                        <Alert show = {this.state.showBothEndsAlert} variant = 'danger'>
                                            Front and End Prompt can not be empty when there is only one blank 
                                        </Alert>
                                    </div>
                                </div>
                                <div style={{textAlign: "center", marginTop: "4%"}}>
                                    <button className="continue_button_correct" onClick={this.submitFIB}>Save Changes</button>
                                </div>

                        </div>
                        
                    :

                        (this.state.pageFormat.type === "Matching"
                        ?
                            <div >
                                <div style={{display: "flex", justifyContent: "center", color: "white", marginTop: "2%", marginBottom: "2%"}}>
                                    <div style={{display: "flex", margin: "auto"}}>
                                        <div style={{marginLeft: "-2%", fontSize: "25px", height: "fit-content"}}>
                                            Question Name: 
                                        </div>
                                        <input style={{marginLeft: "2%", fontSize: "20px", borderRadius: "8px", padding: "5px", height: "fit-content"}} type="text" id="changePageName" value = {this.state.pageFormat.page_title} onChange = {this.changePageName}/> 
                                    </div>
                                    <div style={{display: "flex", margin: "auto"}}>
                                        <div style={{marginLeft: "-2%", fontSize: "25px", height: "fit-content"}}>
                                            Question Type: 
                                        </div>
                                        <select style={{marginLeft: "2%", fontSize: "20px", borderRadius: "8px", padding: "5px"}} onChange = {this.changePageType} value = {this.state.pageFormat.type} id = "pType">
                                            <option value="Multiple Choice">Multiple Choice</option>
                                            <option value="Fill in the Blank">Fill in the Blank</option>
                                            <option value="Matching">Matching</option>
                                            <option value="Timer">Timer</option>
                                        </select>
                                    </div>
                                    <button style={{margin: "auto", fontSize: "20px", borderRadius: "8px", padding: "5px", background: "white"}} onClick={this.revealModal} disabled = {Object.keys(this.state.pageFormat.matching_pairs).length > 10 ? true : false}>Add Pair</button>
                                </div>
                                <div style={{background: "#edd2ae", textAlign: "center", marginLeft: "5%", marginRight: "5%", marginBottom: "5%", borderRadius: "8px", padding: "5%"}}>
                                    <div>
                                        <div style={{display: "flex", justifyContent: "center", marginBottom: "5%", marginRight: "3%"}}>
                                            <div style={{marginLeft: "-1%", fontSize: "25px"}}>
                                                Question:
                                            </div>
                                            <input style={{marginLeft: "1%", width: "41%", fontSize: "20px", borderRadius: "8px", padding: "5px"}} type="text" id="changePrompt" value = {this.state.pageFormat.prompt} onChange = {this.changePrompt}/> 
                                        </div>
                                        <div style={{background: "white", width: "50%", margin: "auto", padding: "3%", borderRadius: "8px", border: "2px solid"}}>
                                            <div style={{width: "max-content", margin: "auto"}}>
                                                {Object.keys(this.state.pageFormat.matching_pairs).map((key,index) => (
                                                    <div style={{display: "flex"}}>
                                                        <div style={{display: "flex"}}>
                                                            <p style={{background: "white", padding: "5px", borderRadius: "8px", marginLeft: "-5%", border: "1px solid"}}>
                                                                {key}
                                                            </p>
                                                            <p style={{background: "white", padding: "5px", borderRadius: "8px", marginLeft: "5%", border: "1px solid"}}>
                                                                {Object.values(this.state.pageFormat.matching_pairs)[index]}
                                                            </p>
                                                        </div>
                                                        <div style={{display: "flex", marginLeft: "auto", height: "fit-content"}}>
                                                            <button style = {{background: "red", border: "1px solid", borderRadius: "8px", marginLeft: "15%", padding: "5px"}} onClick={()=>this.removeMP(index)} disabled = {Object.keys(this.state.pageFormat.matching_pairs).length < 3 ? true : false}>X</button>
                                                            <button style = {{background: "rgb(0,219,0)", border: "1px solid", borderRadius: "8px", marginLeft: "15%", padding: "5px"}} onClick={()=>this.revealEditModal(index)}>Edit</button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                   
                                
                                <Modal show={this.state.showModal} onHide={this.handleClose} backdrop="static" keyboard={true}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Add Matching Pair</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <div className = "form-group" style={{marginLeft: "10%"}}>
                                        <label style = {{color: "black"}}>Pair Value 1:</label>
                                        <input type = "text" style = {{width: "90%", borderColor: "black"}} className = "form-control" id = "inputpair1" placeholder = "Enter Pair 1" required/>
                                    </div>
                                    <div className = "form-group" style={{marginLeft: "10%"}}>
                                        <label style = {{color: "black"}}>Pair Value 2:</label>
                                        <input type = "text" style = {{width: "90%", borderColor: "black"}} className = "form-control" id = "inputpair2" placeholder = "Enter Pair 2" required/>
                                    </div>
                                    <Alert show = {this.state.showEmptyAlert} variant = 'danger'>
                                        The text fields can not be empty
                                    </Alert>
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button variant="secondary" onClick={this.handleClose}>
                                        Close
                                    </Button>
                                    <Button variant="primary" onClick={this.handleSubmitModal}>
                                        Submit
                                    </Button>
                                </Modal.Footer>
                                </Modal>

                                <Modal show={this.state.showEditModal} onHide={this.handleEditClose} backdrop="static" keyboard={true}>
                                    <Modal.Header closeButton>
                                        <Modal.Title>Edit Matching Pair</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        <div  style={{marginLeft: "10%"}}>
                                            <label style = {{color: "black"}}>Edit Value 1:</label>
                                            <input type = "text" style = {{width: "90%", borderColor: "black"}} id = "inputedit1" value={this.state.editKey} onChange = {e => this.changeEditKey(e.target.value)} required/>
                                        </div>
                                        <div  style={{marginLeft: "10%"}}>
                                            <label style = {{color: "black"}}>Edit Value 2:</label>
                                            <input type = "text" style = {{width: "90%", borderColor: "black"}} id = "inputedit2" value={this.state.editVal} onChange = {e => this.changeEditVal(e.target.value)} required/>
                                        </div>
                                        <Alert show = {this.state.showEmptyAlert2} variant = 'danger'>
                                            The text fields can not be empty
                                        </Alert>
                                    </Modal.Body>
                                    <Modal.Footer>
                                        <Button variant="secondary" onClick={this.handleEditClose}>
                                            Close
                                        </Button>
                                        <Button variant="primary" onClick={this.handleSubmitEditModal}>
                                            Submit
                                        </Button>
                                    </Modal.Footer>
                                </Modal>
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