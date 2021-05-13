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

export default class TempEditPage extends Component {
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
        this.submitMC = this.submitMC.bind(this);
        this.submitMatching = this.submitMatching.bind(this);

        this.updateTimerAnswer = this.updateTimerAnswer.bind(this);
        this.addTimerAnswer = this.addTimerAnswer.bind(this);
        this.editTimerAnswer = this.editTimerAnswer.bind(this);
        this.removeTimerAnswer = this.removeTimerAnswer.bind(this);
        this.submitTimer = this.submitTimer.bind(this);
        this.handleTimerEditClose = this.handleTimerEditClose.bind(this);
        this.updateEditTimer = this.updateEditTimer.bind(this);
        this.handleSubmitTimerEditModal = this.handleSubmitTimerEditModal.bind(this);

        this.state = {
            user_id: '',
            pageFormat: '',
            showModal: false,
            showEditModal:false,
            showEmptyAlert: false,
            showEmptyAlert2:false,
            showEmptyAlert3:false,
            showBothEndsAlert:false,
            showTimerEditModal:false,
            editKey:'',
            editVal:'',
            originalKey:'',
            originalVal:'',
            editIndex:0,
            fibArray:[],
            timerInput:'',
            editTimer:'',
            editTimerIndex:0,
            showEmptyPromptTitleAlert:false,
            showEmptyTimerAnswerInputAlert:false,
            showTimerAnswerExistAlert:false,
            showEmptyTimerAnswersAlert:false,
            showEmptyMCCAlert:false,
            showEmptyMCAAlert:false
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


    changePageName(e){
        var tempPage = this.state.pageFormat
        var eVal = e.target.value
        tempPage.page_title = eVal

        this.setState({pageFormat:tempPage,showEmptyPromptTitleAlert:false})
    }

    changePrompt(e){
        var tempPage = this.state.pageFormat
        var eVal = e.target.value
        tempPage.prompt = eVal

        this.setState({pageFormat:tempPage,showEmptyPromptTitleAlert:false})
    }

    changePageType(e){
        var tempPage = this.state.pageFormat
        var eVal = e.target.value
        console.log(eVal)
        tempPage.type=eVal

        this.setState({pageFormat:tempPage})
    }

    changeMCC(e,ind) {
        //method for changing value inside of a multiple choice 
        //needs to update in state and database 

        var tempPage = this.state.pageFormat
        var eVal = e.target.value
        console.log(eVal,ind)
        tempPage.multiple_choices[ind]=eVal

        this.setState({pageFormat:tempPage,showEmptyMCCAlert:false})
    }

    changeMCA(e) {
        //method for changing value of a multiple choice answer
        //needs to update in state and database 

        var tempPage = this.state.pageFormat
        var eVal = e.target.value
        tempPage.multiple_choice_answer=eVal

        this.setState({pageFormat:tempPage,showEmptyMCAAlert:false})

    }

    addMCC() {
        //adds multiple choice choice to the array 
        //will be disabled when there are 5 choices 

        var page_id = this.props.location.pathname.substring(60);
        var Questions = (this.state.pageFormat.multiple_choices.length)
        var tempPage = this.state.pageFormat

        tempPage.multiple_choices.push("New Choice" +Questions)

        this.setState({pageFormat : tempPage})

        // const newMCC = {
        //     page_format_id : page_id,
        //     value : "New Choice " + Questions
        // }

        // api.post('/pageFormat/addToMCC',newMCC)
        // .then(response => {
        //     //console.log(response)
        //     //updates page format so page is rendered properly
        //     this.updatePageFormat();
        // })
        // .catch(error => {
        //     console.log(error)
        // });
    }

    removeMCC(ind) {

        var tempPage = this.state.pageFormat
        tempPage.multiple_choices.splice(ind,1)

        this.setState({pageFormat : tempPage})
        // var mcArray = this.state.pageFormat.multiple_choices;
        // mcArray.splice(ind,1)

        // console.log(mcArray)

        // const newMCC = {
        //     pageID : this.state.pageFormat._id,
        //     newChoices : mcArray
        // }

        // //call update page name
        // api.post('/pageFormat/updateMultipleChoiceChoice',newMCC)
        // .then(response => {
        //     console.log(response)
        //     //updates platform format so page is rendered properly
        //     this.updatePageFormat();
        // })
        // .catch(error => {
        //     console.log(error)
        // });

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

        var tempPage = this.state.pageFormat
        tempPage.matching_pairs[inputP1] = inputP2
        this.setState({pageFormat:tempPage})

        // var page_id = this.props.location.pathname.substring(60);
        // inputP1 = "matching_pairs." + inputP1

        // //creating obj to insert into database
        // var testObj= {};

        // testObj[inputP1] = inputP2


        // console.log(inputP1)
        // const newMP= {
        //     page_format_id : page_id,
        //     newPair: testObj
        // }

        // api.post('/pageFormat/addToMP',newMP)
        // .then(response => {
        //     console.log(response)
        //     //updates page format so page is rendered properly
        //     this.updatePageFormat();
        // })
        // .catch(error => {
        //     console.log(error)
        // });

        this.handleClose()
    }

    removeMP(ind) {
        console.log("inside removeMP")
        console.log(this.state.pageFormat.matching_pairs)

        var tempArr = this.state.pageFormat

        var removeKey = Object.keys(tempArr.matching_pairs)[ind]

        //research if there is a better way then delete
        // tempArr[removeKey] = undefined

        delete tempArr.matching_pairs[removeKey]

        console.log(tempArr)

        this.setState({pageFormat:tempArr})

        // var page_id = this.props.location.pathname.substring(60);

        // const newMP= {
        //     pageID : page_id,
        //     newMatching: tempArr
        // }

        // api.post('/pageFormat/updateMatchingPair',newMP)
        // .then(response => {
        //     console.log(response)
        //     //updates page format so page is rendered properly
        //     this.updatePageFormat();
        // })
        // .catch(error => {
        //     console.log(error)
        // });

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
        var tempPage = this.state.pageFormat
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

        console.log(tempArr)

        tempPage.matching_pairs = tempArr

        this.setState({pageFormat : tempPage})

        // var page_id = this.props.location.pathname.substring(60);

        // const newMP= {
        //     pageID : page_id,
        //     newMatching: tempArr
        // }

        // api.post('/pageFormat/updateMatchingPair',newMP)
        // .then(response => {
        //     console.log(response)
        //     //updates page format so page is rendered properly
        //     this.updatePageFormat();
        // })
        // .catch(error => {
        //     console.log(error)
        // });
        
    
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
        console.log("MADE IT");
        var tempPage = this.state.pageFormat;
        var inputArr = this.state.fibArray;
        console.log(inputArr);
        var newPrompt = "";
        var newAnswers = {};
        var newKey = "";

        if(tempPage.page_title=== "")
        {
            this.setState({showEmptyPromptTitleAlert:true})
            return
        }

        for(var i = 0; i < inputArr.length; i++)
        {
            if(inputArr.length === 3 && document.getElementById('fibInput'+0).value === "" && document.getElementById('fibInput'+(inputArr.length-1)).value === "")
            {
                this.setState({showBothEndsAlert:true});
                return;
            } 
            //console.log('fibInput'+i,document.getElementById('fibInput'+i).value)

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
                    // if(i === 0 )
                    // {
                    //     newPrompt = newPrompt + " "

                    // }
                    // else 
                    // {
                    //     newPrompt = newPrompt + "  "
                    // }
                    // console.log("BLANK ADDED")
                    newPrompt = newPrompt + "  "

                    // console.log(newPrompt)
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
            newPageTitle : tempPage.page_title,
            newType :tempPage.type,
            newfibAnswers : newAnswers,
            newfibPrompt : newPrompt,

        }

        api.post('/pageFormat/updateWholeFIBPage',newFIB)
        .then(response => {
            console.log(response)
        })
        .catch(error => {
            console.log(error)
        });
        // const newFIB = {
        //     pageID : page_id,
        //     newfibAnswers: newAnswers,
        //     newfibPrompt: newPrompt
        // }
        
        
        // api.post('/pageFormat/updatefibPromptAnswer',newFIB)
        // .then(response => {
        //     console.log(response)
        //     //updates page format so page is rendered properly
        //     this.updatePageAndFIB();
        // })
        // .catch(error => {
        //     console.log(error)
        // });

    }

    insertBlank(){
        var tempArr = this.state.fibArray

        tempArr.push("")
        tempArr.push("")

        //update the 
        this.setState({fibArray:tempArr})
    }

    removeFIB(ind){
        // var tempArr = this.state.pageFormat.fill_in_the_blank_answers

        // var removeIndex = Math.round(ind/2) - 1

        // var deleteKey = Object.keys(tempArr)[removeIndex]

        // delete tempArr[deleteKey]

        // console.log(tempArr)
        var tempArr = this.state.fibArray
        var Val

        console.log("THIS IS THE INDEX " +ind)

        if(ind === 1)
        {
            Val = tempArr[0]
            tempArr[2] = Val + tempArr[2]

            console.log(tempArr)
            tempArr.splice(0, 1)
            //console.log("One Remove " + tempArr)
            tempArr.splice(0, 1)
            //console.log("Two Remove " + tempArr)
        }
        else
        {
            Val = tempArr[ind+1]
            tempArr[ind-1] = tempArr[ind-1] + Val 

            tempArr.splice(ind,1)
            //console.log("One Remove " + tempArr)
            tempArr.splice(ind, 1)
            //console.log("Two Remove " + tempArr)

        }


        this.setState({fibArray:tempArr})

        console.log(tempArr)

        var page_id = this.props.location.pathname.substring(60);


        // const newInfo = {
        //     pageID : page_id,
        //     newfibAnswers:tempArr,
        // }

        // api.post('/pageFormat/updatefibAnswer',newInfo)
        // .then(response => {
        //     //updates page format and fib state array
        //     this.updatePageAndFIB();
        // })
        // .catch(error => {
        //     console.log(error)
        // });

    }
    
    submitMC()
    {
        //NEED TO ADD CHECKS FOR ALL THESE FIELDS 
        console.log("SUBMIT MC")
        var tempPage = this.state.pageFormat
        var page_id = this.props.location.pathname.substring(60)

        //just check page_title and prompt 
        //check if prompt or page_title are empty 
        if(tempPage.prompt === "" || tempPage.page_title=== "")
        {
            this.setState({showEmptyPromptTitleAlert:true})
            return
        }

        //checks if choices are empty 
        for(var i = 0; i <tempPage.multiple_choices.length;i++)
        {
            console.log(tempPage.multiple_choices)
            if(tempPage.multiple_choices[i] === "")
            {
                this.setState({showEmptyMCCAlert:true})
                return 
            }
        }

        if(tempPage.multiple_choice_answer === "")
        {
            this.setState({showEmptyMCAAlert:true})
            {
                return
            }
        }

        const newMCInfo = {
            pageID : page_id,
            newType : tempPage.type,
            newPrompt : tempPage.prompt,
            newPageTitle : tempPage.page_title,
            newMCC : tempPage.multiple_choices,
            newMCA : tempPage.multiple_choice_answer
        }

        api.post('/pageFormat/updateWholeMCPage',newMCInfo)
        .then(response => {
            console.log(response)
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

    submitMatching(){
        console.log("Submit Matching")
        var tempPage = this.state.pageFormat
        var page_id = this.props.location.pathname.substring(60)

        //check if prompt or page_title are empty 
        if(tempPage.prompt === "" || tempPage.page_title=== "")
        {
            this.setState({showEmptyPromptTitleAlert:true})
            return
        }

        //create const
        const newMatching = {
            pageID : page_id,
            newType : tempPage.type,
            newPageTitle : tempPage.page_title,
            newPrompt : tempPage.prompt,
            newMatchingPairs: tempPage.matching_pairs
        }

        api.post('/pageFormat/updateWholeMatchingPage',newMatching)
        .then(response => {
            console.log(response)
        })
        .catch(error => {
            console.log(error)
        });

    }

    updateTimerAnswer(e){
        this.setState({showEmptyTimerAnswerInputAlert:false,showTimerAnswerExistAlert:false})
      
        var eVal = e.target.value

        this.setState({timerInput:eVal})
    }

    addTimerAnswer(){
        var val = document.getElementById('timerInput').value
        //checks if input is not empty 
        if(val === "")
        {
            this.setState({showEmptyTimerAnswerInputAlert:true})
            return 
        }

        //checks if input already exists
        if(this.state.pageFormat.timer_answers.includes(val))
        {
            this.setState({showTimerAnswerExistAlert:true})
            return
        }
        //just appends value to array 
        console.log(val)

        var tempPage =this.state.pageFormat
        tempPage.timer_answers.push(val)

        this.setState({pageFormat:tempPage,timerInput:'',showEmptyTimerAnswersAlert:false})
        

    }

    //acts as reveal for timer edit 
    editTimerAnswer(ind){
        var tempPage = this.state.pageFormat

        var Val = tempPage.timer_answers[ind]

        console.log(Val)

        this.setState({editTimer:Val,editTimerIndex:ind})
        
        this.setState({showTimerEditModal:true})
    }
    
    removeTimerAnswer(ind){
        var tempPage = this.state.pageFormat
        tempPage.timer_answers.splice(ind,1)

        console.log(tempPage.timer_answers)

        this.setState({pageFormat:tempPage})
    }
    submitTimer(){
        console.log("SUBMITTED TIMER")
        var tempPage = this.state.pageFormat
        var page_id = this.props.location.pathname.substring(60)

        //check if prompt empty,page_title empty,timer_answers
        if(tempPage.prompt === "" || tempPage.page_title=== "")
        {
            this.setState({showEmptyPromptTitleAlert:true})
            return
        }

        if(tempPage.timer_answers.length === 0)
        {
            this.setState({showEmptyTimerAnswersAlert:true})
            return
        }

        //create const
        const newTimer= {
            pageID : page_id,
            newType : tempPage.type,
            newPageTitle : tempPage.page_title,
            newPrompt : tempPage.prompt,
            newTimer : tempPage.timer_answers
        }

        api.post('/pageFormat/updateWholeTimerPage',newTimer)
        .then(response => {
            console.log(response)
        })
        .catch(error => {
            console.log(error)
        });
    }

    handleTimerEditClose() {
        this.setState({
            showTimerEditModal:false
        })
    }

    updateEditTimer() {
        var val = document.getElementById('editTimer').value
        this.setState({editTimer:val})
    }

    handleSubmitTimerEditModal(){
        if(this.state.editTimer === "")
        {
            console.log("EMPTY NEED TO POP UP ALERT")
            return
        }

        var tempPage = this.state.pageFormat
        tempPage.timer_answers[this.state.editTimerIndex] = this.state.editTimer

        this.setState({pageFormat:tempPage})

        this.handleTimerEditClose()
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
                                    if(num === 0 && j === 0)
                                    {
                                        str = fibPrompt.substring(num,pos-1)
                                    }
                                    else
                                    {
                                        if(j === 1 && num === 0)
                                        {
                                            str = fibPrompt.substring(num+2,pos-1)
                                        }
                                        else
                                        {
                                            str = fibPrompt.substring(num+1,pos-1)
                                        }
                                    }
                                    console.log(fibPrompt)
                                    console.log("PROMPT "+ str)
                                    console.log("BLANK "+ Object.values(response.data.fill_in_the_blank_answers)[j])
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
            <div style={{margin: "auto", color: "white", fontSize: "30px", borderBottom: "2px solid white", width: "fit-content"}}>
                Edit Question: 
            </div>
            {this.state.pageFormat.type === "Multiple Choice"
                ?
                    <div>
                        <div style={{display: "flex", justifyContent: "center", color: "white", marginTop: "2%", marginBottom: "2%"}}>
                            <div style={{display: "flex", margin: "auto"}}>
                                <div style={{marginLeft: "-2%", fontSize: "25px", height: "fit-content"}}>
                                    Question Name: 
                                </div>
                                <input style={{marginLeft: "2%", fontSize: "20px", borderRadius: "8px", padding: "5px", height: "fit-content"}} type="text" id="changePageName" value = {this.state.pageFormat.page_title} onChange = {(e)=> this.changePageName(e)}/> 
                            </div>
                            <div style={{display: "flex", margin: "auto"}}>
                                <div style={{marginLeft: "-2%", fontSize: "25px", height: "fit-content"}}>
                                    Question Type: 
                                </div>
                                <select style={{marginLeft: "2%", fontSize: "20px", borderRadius: "8px", padding: "5px"}} onChange = {(e)=>this.changePageType(e)} value = {this.state.pageFormat.type} id = "pType">
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
                                        Prompt:
                                    </div>
                                    <input style={{marginLeft: "1%", width: "41%", fontSize: "20px", borderRadius: "8px", padding: "5px"}} type="text" id="changePrompt" value = {this.state.pageFormat.prompt} placeholder= "Enter your multiple choice question: " onChange = {(e)=>this.changePrompt(e)}/>
                                </div>
                                <div>
                                    {this.state.pageFormat.multiple_choices.map((choice,index) => (
                                        <div style={{display:"flex", justifyContent: "center", marginTop: "0.5%"}}>
                                            <div style={{marginLeft: "-1%", fontSize: "20px"}}>
                                                Incorrect: 
                                            </div>
                                            <input style={{marginLeft: "1%", width: "40%", fontSize: "15px", borderRadius: "8px", padding: "5px"}} type="text" id={"changeMCC"+ index} value = {choice} onChange = {(e)=>this.changeMCC(e,index)}/>
                                            <button style = {{background: "red", border: "transparent", borderRadius: "8px", marginLeft: "1%"}} onClick={()=>this.removeMCC(index)} disabled = {this.state.pageFormat.multiple_choices.length < 2 ? true : false}>X</button>
                                        </div>
                                    ))}
                                </div>
                                <div style={{display: "flex", justifyContent: "center", marginTop: "2%", marginRight: "7%"}}>
                                    <div style={{marginLeft: "-1%", fontSize: "20px"}}>
                                        Correct Answer: 
                                    </div>
                                    <input style={{marginLeft: "1%", width: "43%", fontSize: "15px", borderRadius: "8px", padding: "5px"}} type="text" id="changeMCA" value = {this.state.pageFormat.multiple_choice_answer} onChange = {(e)=> this.changeMCA(e)}/>
                                </div>
                            </div>
                            <div>
                            <Alert show = {this.state.showEmptyPromptTitleAlert} variant = 'danger'>
                                The question name or prompt can not be empty
                            </Alert>           
                            <Alert show = {this.state.showEmptyMCCAlert} variant = 'danger'>
                                The choices can not be empty 
                            </Alert>      
                            <Alert show = {this.state.showEmptyMCAAlert} variant = 'danger'>
                                The answer can not be empty
                            </Alert>      
                            </div>
                            <div>
                                <button onClick={this.submitMC}>Submit Changes</button>
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
                                        <input style={{marginLeft: "2%", fontSize: "20px", borderRadius: "8px", padding: "5px", height: "fit-content"}} type="text" id="changePageName" value = {this.state.pageFormat.page_title} onChange = {(e)=> this.changePageName(e)}/> 
                                    </div>
                                    <div style={{display: "flex", margin: "auto"}}>
                                        <div style={{marginLeft: "-2%", fontSize: "25px", height: "fit-content"}}>
                                            Question Type: 
                                        </div>
                                        <select style={{marginLeft: "2%", fontSize: "20px", borderRadius: "8px", padding: "5px"}} onChange = {(e)=>this.changePageType(e)} value = {this.state.pageFormat.type} id = "pType">
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
                                            (index %2 === 0    
                                            ?
                                                <div style={{maxWidth: "325px", marginRight: "2%", marginTop: "2%"}}>
                                                    <input style={{width: "-webkit-fill-available", fontSize: "15px", borderRadius: "8px", padding: "5px", marginLeft: "3%"}} type="text" id={"fibInput"+index} value = {input} placeholder = "If needed, enter your prompt here:" onChange = {() => this.updateFIBInput(index)} size={50}></input>
                                                </div>
                                            :
                                                <div style={{display: "flex", maxWidth: "195px", marginRight: "2%", marginTop: "2%"}}>
                                                    <input type="text" id={"fibInput"+index} style={{borderColor: "red", width: "-webkit-fill-available", fontSize: "15px", borderRadius: "8px", padding: "5px"}} placeholder = "Answer is required: " value = {input} onChange = {() => this.updateFIBInput(index)} size={50}></input>
                                                    <button style = {{background: "red", border: "transparent", borderRadius: "8px", marginLeft: "1%"}} onClick={()=>this.removeFIB(index)} disabled = {this.state.fibArray.length < 4 ? true : false}>X</button>
                                                </div>
                                            )
                                        ))}
                                        {/* <Alert show = {this.state.showEmptyAlert3} variant = 'danger'>
                                            The text fields can not be empty
                                        </Alert>
                                        <Alert show = {this.state.showBothEndsAlert} variant = 'danger'>
                                            Front and End Prompt can not be empty when there is only one blank 
                                        </Alert> */}
                                    </div> 
                                    <Alert show = {this.state.showEmptyPromptTitleAlert} variant = 'danger'>
                                        The Question Name can not be empty
                                    </Alert>           
                                    <Alert show = {this.state.showEmptyAlert3} variant = 'danger'>
                                        The text inputs can not be empty
                                    </Alert>
                                    <Alert show = {this.state.showBothEndsAlert} variant = 'danger'>
                                        Front and End Prompt can not be empty when there is only one blank 
                                    </Alert>
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
                                        <input style={{marginLeft: "2%", fontSize: "20px", borderRadius: "8px", padding: "5px", height: "fit-content"}} type="text" id="changePageName" value = {this.state.pageFormat.page_title} onChange = {(e)=> this.changePageName(e)}/> 
                                    </div>
                                    <div style={{display: "flex", margin: "auto"}}>
                                        <div style={{marginLeft: "-2%", fontSize: "25px", height: "fit-content"}}>
                                            Question Type: 
                                        </div>
                                        <select style={{marginLeft: "2%", fontSize: "20px", borderRadius: "8px", padding: "5px"}} onChange = {(e)=>this.changePageType(e)} value = {this.state.pageFormat.type} id = "pType">
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
                                                Prompt:
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
                                <div>
                                    <Alert show = {this.state.showEmptyPromptTitleAlert} variant = 'danger'>
                                        The text fields can not be empty
                                    </Alert>        
                                </div>           
                                <div>
                                    <button onClick= {this.submitMatching}>Submit Changes</button>
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
                            <div>
                                <div style={{display: "flex", justifyContent: "center", color: "white", marginTop: "2%", marginBottom: "2%"}}>
                                    <div style={{display: "flex", margin: "auto"}}>
                                        <div style={{marginLeft: "-2%", fontSize: "25px", height: "fit-content"}}>
                                            Question Name: 
                                        </div>
                                        <input style={{marginLeft: "2%", fontSize: "20px", borderRadius: "8px", padding: "5px", height: "fit-content"}} type="text" id="changePageName" value = {this.state.pageFormat.page_title} onChange = {(e)=> this.changePageName(e)}/> 
                                    </div>
                                    <div style={{display: "flex", margin: "auto"}}>
                                        <div style={{marginLeft: "-2%", fontSize: "25px", height: "fit-content"}}>
                                            Question Type: 
                                        </div>
                                        <select style={{marginLeft: "2%", fontSize: "20px", borderRadius: "8px", padding: "5px"}} onChange = {(e)=>this.changePageType(e)} value = {this.state.pageFormat.type} id = "pType">
                                            <option value="Multiple Choice">Multiple Choice</option>
                                            <option value="Fill in the Blank">Fill in the Blank</option>
                                            <option value="Matching">Matching</option>
                                            <option value="Timer">Timer</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{background: "#edd2ae", textAlign: "center", marginLeft: "5%", marginRight: "5%", borderRadius: "8px", padding: "5%"}}>
                                    <div>
                                        <div style={{display: "flex", justifyContent: "center", marginBottom: "2%", marginRight: "3%"}}>
                                            <div style={{marginLeft: "-1%", fontSize: "25px"}}>
                                                Prompt:
                                            </div>
                                            <input style={{marginLeft: "1%", width: "41%", fontSize: "20px", borderRadius: "8px", padding: "5px"}} type="text" id="changePrompt" value = {this.state.pageFormat.prompt} placeholder= "Enter your multiple choice question: " onChange = {(e)=>this.changePrompt(e)}/>
                                        </div>
                                        <div>
                                            <input id = "timerInput" value= {this.state.timerInput} onChange={(e)=>this.updateTimerAnswer(e)}></input>
                                            <button onClick={this.addTimerAnswer} disabled = {this.state.pageFormat.timer_answers.length > 49 ? true : false}>Add Answer</button>
                                        </div>
                                        <div>
                                            <Alert show = {this.state.showEmptyTimerAnswerInputAlert} variant = 'danger'>
                                                The input can not be empty
                                            </Alert>
                                            <Alert show = {this.state.showTimerAnswerExistAlert} variant = 'danger'>
                                                The answer has already been added
                                            </Alert>
                                            <Alert show = {this.state.showEmptyTimerAnswersAlert} variant = 'danger'>
                                                There are no answers entered
                                            </Alert>
                                        </div>

                                    </div>
                                    <div>
                                        <Alert show = {this.state.showEmptyPromptTitleAlert} variant = 'danger'>
                                                The text fields can not be empty
                                        </Alert>
                                    </div>
                                    <div>
                                        <button onClick={this.submitTimer}>Submit Changes</button>
                                    </div>
                                    <div>
                                        {this.state.pageFormat.timer_answers.map((answer,index) => (
                                            <div style={{display: "flex", justifyContent: "center"}}>
                                                <p>{answer}</p>
                                                <button onClick={()=>this.editTimerAnswer(index)}>Edit</button>
                                                <button onClick={()=>this.removeTimerAnswer(index)} disabled = {this.state.pageFormat.timer_answers.length < 2 ? true : false}>X</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Modal show={this.state.showTimerEditModal} onHide={this.handleTimerEditClose} backdrop="static" keyboard={true}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Edit Timer Answer</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <div className = "form-group" style={{marginLeft: "10%"}}>
                                        <label style = {{color: "black"}}>Answer:</label>
                                        <input type = "text" style = {{width: "90%", borderColor: "black"}} className = "form-control" value = {this.state.editTimer} id = "editTimer" onChange = {this.updateEditTimer} required/>
                                    </div>
                                    <Alert show = {this.state.showEmptyAlert} variant = 'danger'>
                                        The text field can not be empty
                                    </Alert>
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button variant="secondary" onClick={this.handleTimerEditClose}>
                                        Close
                                    </Button>
                                    <Button variant="primary" onClick={this.handleSubmitTimerEditModal}>
                                        Submit
                                    </Button>
                                </Modal.Footer>
                                </Modal>
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