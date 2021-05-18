import React, { Component } from 'react';
import {api} from "../axios_api.js";
import jwt from 'jsonwebtoken';
import { Link } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import LoggedInNav from "./loggedInNav.component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import {Prompt} from "react-router-dom";
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
        this.changeMinuteTime = this.changeMinuteTime.bind(this);
        this.changeSecondTime = this.changeSecondTime.bind(this);

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
            showEmptyQuestion: false,
            showEmptyTimerAnswerInputAlert:false,
            showTimerAnswerExistAlert:false,
            showEmptyTimerAnswersAlert:false,
            showEmptyMCCAlert:false,
            showEmptyMCAAlert:false,
            showLessThanTwoAlert: false,
            has_changes: false,
            submit_alert: false,
            showQuestionNameAlert: false,
            minuteTime : 0,
            secondTime : 0,
            showEmptyTimerAlert: false,
            showEmptyAlert4: false
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

        this.setState({pageFormat:tempPage, showEmptyQuestion:false, showQuestionNameAlert: false, has_changes: true})
    }

    changePrompt(e){
        var tempPage = this.state.pageFormat
        var eVal = e.target.value
        tempPage.prompt = eVal

        this.setState({pageFormat:tempPage,showEmptyPromptTitleAlert:false, has_changes: true})
    }

    changePageType(e){
        var tempPage = this.state.pageFormat
        var eVal = e.target.value
        tempPage.type=eVal

        this.setState({pageFormat:tempPage, has_changes: true})
    }

    changeMCC(e,ind) {
        //method for changing value inside of a multiple choice 
        //needs to update in state and database 

        var tempPage = this.state.pageFormat
        var eVal = e.target.value
        console.log(eVal,ind)
        tempPage.multiple_choices[ind]=eVal

        this.setState({pageFormat:tempPage,showEmptyMCCAlert:false, has_changes: true})
    }

    changeMCA(e) {
        //method for changing value of a multiple choice answer
        //needs to update in state and database 

        var tempPage = this.state.pageFormat
        var eVal = e.target.value
        tempPage.multiple_choice_answer=eVal

        this.setState({pageFormat:tempPage,showEmptyMCAAlert:false, has_changes: true})

    }

    addMCC() {
        //adds multiple choice choice to the array 
        //will be disabled when there are 5 choices 

        var page_id = this.props.location.pathname.substring(60);
        var Questions = (this.state.pageFormat.multiple_choices.length)
        var tempPage = this.state.pageFormat

        tempPage.multiple_choices.push("New Choice" +Questions)

        this.setState({pageFormat : tempPage, has_changes: true})

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

        this.setState({pageFormat : tempPage, has_changes: true})

    }

    revealModal(ind){
        this.setState({
            showModal:true, showLessThanTwoAlert: false
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
        this.setState({pageFormat:tempPage, has_changes: true});

        this.handleClose()
    }

    removeMP(ind) {

        var tempArr = this.state.pageFormat

        var removeKey = Object.keys(tempArr.matching_pairs)[ind]

        //research if there is a better way then delete
        // tempArr[removeKey] = undefined

        delete tempArr.matching_pairs[removeKey]

        console.log(tempArr)

        this.setState({pageFormat:tempArr, has_changes: true})


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
        if(this.state.editKey.trim() === "" || this.state.editVal.trim() === "")
        {
            this.setState({showEmptyAlert2:true})
            return
        }
        else if (this.state.editKey.trim() === this.state.originalKey)
        {
            tempArr = this.state.pageFormat.matching_pairs
            tempArr[this.state.editKey.trim()] = this.state.editVal.trim()
        }   
        else 
        {
            console.log(this.state.editKey)
            console.log(this.state.editVal)


            var convertArr = Object.entries(this.state.pageFormat.matching_pairs)

            convertArr.splice(this.state.editIndex,0,[this.state.editKey.trim(),this.state.editVal.trim()])

            var changedArr = Object.fromEntries(convertArr)

            delete changedArr[this.state.originalKey]

            console.log(changedArr)

            tempArr = changedArr

        }

        console.log(tempArr)

        tempPage.matching_pairs = tempArr

        this.setState({pageFormat : tempPage, has_changes: true})

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
        if(!this.state.has_changes){
            return;
        }

        var tempPage = this.state.pageFormat;
        var inputArr = this.state.fibArray;
        console.log(inputArr);
        var newPrompt = "";
        var newAnswers = {};
        var newKey = "";

        if(tempPage.page_title === "")
        {
            this.setState({showEmptyPromptTitleAlert:true})
            return
        }

        if(tempPage.page_title.trim().length > 25){
            this.setState({showQuestionNameAlert: true});
            return;
        }

        for(var i = 0; i < inputArr.length; i++)
        {
            if(inputArr.length === 3 && document.getElementById('fibInput'+0).value === "" && document.getElementById('fibInput'+(inputArr.length-1)).value === "")
            {
                this.setState({showBothEndsAlert:true});
                return;
            } 
            //console.log('fibInput'+i,document.getElementById('fibInput'+i).value)

            var input = (document.getElementById('fibInput'+i).value).trim()
            //showEmptyAlert4 is for prompts that are in between two blanks being empty
            
            if(input === "" && i !== 0 && i !== inputArr.length-1)
            {
                if(i%2 === 0)
                {
                    //issue is when there are empty prompts and blanks
                    //even is for prompts
                    this.setState({showEmptyAlert4:true}); 
                    return;
                }
                else
                {
                    //odd is for blanks
                    this.setState({showEmptyAlert3:true});   
                    return;
                }
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
            newPageTitle : tempPage.page_title,
            newType :tempPage.type,
            newfibAnswers : newAnswers,
            newfibPrompt : newPrompt,

        }

        api.post('/pageFormat/updateWholeFIBPage',newFIB)
        .then(response => {
            this.setState({has_changes: false, submit_alert: true});
            setTimeout(() => {this.setState({submit_alert: false})}, 3000);
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
        this.setState({fibArray:tempArr, has_changes: true})
    }

    removeFIB(ind){
       
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


        this.setState({fibArray:tempArr, has_changes: true})

        console.log(tempArr)

        var page_id = this.props.location.pathname.substring(60);

    }
    
    submitMC()
    {
        if(!this.state.has_changes){
            return;
        }
        //NEED TO ADD CHECKS FOR ALL THESE FIELDS 
        console.log("SUBMIT MC")
        var tempPage = this.state.pageFormat
        var page_id = this.props.location.pathname.substring(60)

        //just check page_title and prompt 
        //check if prompt or page_title are empty 
        if(tempPage.prompt.trim() === "")
        {
            this.setState({showEmptyPromptTitleAlert:true});
            return
        }

        if(tempPage.page_title.trim() == ""){
            this.setState({showEmptyQuestion: true});
            return;
        }

        if(tempPage.page_title.trim().length > 25){
            this.setState({showQuestionNameAlert: true});
            return;
        }

        //checks if choices are empty 
        for(var i = 0; i <tempPage.multiple_choices.length;i++)
        {
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
            newPrompt : tempPage.prompt.trim(),
            newPageTitle : tempPage.page_title.trim(),
            newMCC : tempPage.multiple_choices,
            newMCA : tempPage.multiple_choice_answer
        }

        api.post('/pageFormat/updateWholeMCPage',newMCInfo)
        .then(response => {
            this.setState({has_changes: false, submit_alert: true});
            setTimeout(() => {this.setState({submit_alert: false})}, 3000);
        })
        .catch(error => {
            console.log(error)
        });

    }

    updateFIBInput(ind){
        var val = document.getElementById('fibInput'+ind).value

        var tempArr = this.state.fibArray.slice()

        tempArr[ind]=val;

        this.setState({fibArray:tempArr,showEmptyAlert4:false,showEmptyAlert3:false,showBothEndsAlert:false, has_changes: true})
    }

    submitMatching(){
        if(!this.state.has_changes){
            return;
        }

        var tempPage = this.state.pageFormat
        var page_id = this.props.location.pathname.substring(60)

        //check if prompt or page_title are empty 
        if(tempPage.prompt.trim() === "")
        {
            this.setState({showEmptyPromptTitleAlert:true})
            return
        }

        if(tempPage.page_title.trim().length > 25){
            this.setState({showQuestionNameAlert: true});
            return;
        }

        if(tempPage.page_title.trim() === ""){
            this.setState({showEmptyQuestion: true})
            return
        }

        if(Object.keys(tempPage.matching_pairs).length < 2){
            this.setState({showLessThanTwoAlert:true})
            return
        }

        //create const
        const newMatching = {
            pageID : page_id,
            newType : tempPage.type,
            newPageTitle : tempPage.page_title.trim(),
            newPrompt : tempPage.prompt.trim(),
            newMatchingPairs: tempPage.matching_pairs
        }

        api.post('/pageFormat/updateWholeMatchingPage',newMatching)
        .then(response => {
            this.setState({has_changes: false, submit_alert: true})
            setTimeout(() => {this.setState({submit_alert: false})}, 3000)
        })
        .catch(error => {
            console.log(error)
        });

    }

    updateTimerAnswer(e){
        this.setState({showEmptyTimerAnswerInputAlert:false, showTimerAnswerExistAlert:false})
      
        var eVal = e.target.value

        this.setState({timerInput:eVal})
    }

    addTimerAnswer(){
        var val = document.getElementById('timerInput').value
        //checks if input is not empty 
        if(val.trim() === "")
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

        var tempPage =this.state.pageFormat
        tempPage.timer_answers.push(val)

        this.setState({pageFormat:tempPage,timerInput:'',showEmptyTimerAnswersAlert:false, has_changes: true})
        

    }

    //acts as reveal for timer edit 
    editTimerAnswer(ind){
        var tempPage = this.state.pageFormat

        var Val = tempPage.timer_answers[ind].trim()

        this.setState({editTimer:Val, editTimerIndex:ind, showTimerEditModal:true, has_changes: true})
    
    }
    
    removeTimerAnswer(ind){
        var tempPage = this.state.pageFormat
        tempPage.timer_answers.splice(ind,1)

        this.setState({pageFormat:tempPage, has_changes: true})
    }

    submitTimer(){
        if(!this.state.has_changes){
            return;
        }

        console.log("SUBMITTED TIMER")
        var tempPage = this.state.pageFormat
        var page_id = this.props.location.pathname.substring(60)

        //check if prompt empty,page_title empty,timer_answers
        if(tempPage.prompt.trim() === "")
        {
            this.setState({showEmptyPromptTitleAlert:true})
            return
        }

        if(this.state.minuteTime == 0 && this.state.secondTime == 0){
            this.setState({showEmptyTimerAlert:true})
            return
        }

        if(tempPage.page_title.trim() === ""){
            this.setState({showEmptyQuestion:true})
            return
        }

        if(tempPage.page_title.trim().length > 25){
            this.setState({showQuestionNameAlert: true});
            return;
        }

        if(tempPage.timer_answers.length === 0)
        {
            this.setState({showEmptyTimerAnswersAlert:true})
            return
        }

        var newCVal = (parseInt(this.state.minuteTime) ) *60  + parseInt(this.state.secondTime);

        //create const
        const newTimer= {
            pageID : page_id,
            newType : tempPage.type,
            newPageTitle : tempPage.page_title.trim(),
            newPrompt : tempPage.prompt.trim(),
            newTimer : tempPage.timer_answers,
            newClock : newCVal
        }

        api.post('/pageFormat/updateWholeTimerPage',newTimer)
        .then(response => {
            this.setState({has_changes: false, submit_alert: true})
            setTimeout(() => {this.setState({submit_alert: false})}, 3000)
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
        if(this.state.editTimer.trim() === "")
        {
            this.setState({showEmptyAlert:true})
            return
        }

        if(this.state.editTimer.trim() === "")
        {
            this.setState({showEmptyAlert:true})
            return
        }


        var tempPage = this.state.pageFormat
        tempPage.timer_answers[this.state.editTimerIndex] = this.state.editTimer

        this.setState({pageFormat:tempPage})

        this.handleTimerEditClose()
    }

    changeMinuteTime(e){
        var eVal = e.target.value

        this.setState({minuteTime:eVal, has_changes: true, showEmptyTimerAlert: false})
    }

    changeSecondTime(e){
        var eVal = e.target.value

        this.setState({secondTime:eVal,has_changes:true, showEmptyTimerAlert: false})
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
                                

                                this.setState({pageFormat : response.data,fibArray : tempArr})
                            }

                            var min = Math.floor(response.data.clock/60);
                            var sec = response.data.clock%60;
                                
                            this.setState({minuteTime:min,secondTime:sec})

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
                    <button style = {{color: 'white', fontSize: "45px"}} onClick={() =>  this.props.history.push("/editCategory/" + this.props.location.pathname.substring(10,59))} className="x_button"><FontAwesomeIcon icon={faArrowLeft} /></button>
                </div>
                <div style={{marginLeft: "40%", color: "rgb(0,219,0)", fontSize: "35px", marginTop: "1%", textDecoration: "underline", textUnderlinePosition: "under", width: "fit-content"}}>
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

                            <button style={{margin: "auto", fontSize: "20px", borderRadius: "8px", padding: "5px", background: "white"}} onClick={this.addMCC} disabled = {this.state.pageFormat.multiple_choices.length > 4 ? true : false}>Add New Option</button>
                        </div>
                        <Prompt when={this.state.has_changes} message="You have unsaved changes! Are you sure you want to leave this page?" />
                        <Alert style={{textAlign: "center", margin: "auto", width:"fit-content", marginLeft: "16%", fontSize: "20px", marginBottom: "1%"}} show = {this.state.showEmptyQuestion} variant = 'danger'>
                            The Question name cannot be empty
                        </Alert> 
                        <Alert style={{textAlign: "center", marginLeft: "16%", fontSize: "20px", width: "fit-content"}} show = {this.state.showQuestionNameAlert} variant = 'danger'>
                            The Question name cannot be greater than 25 characters long
                        </Alert>
                        <div style={{background: "#edd2ae", textAlign: "center", marginLeft: "5%", marginRight: "5%", borderRadius: "8px", padding: "5%"}}>
                            <div>
                                <Alert style={{textAlign: "center", margin: "auto", width:"fit-content", marginBottom: "1%", fontSize: "20px"}} show = {this.state.showEmptyPromptTitleAlert} variant = 'danger'>
                                    The Question prompt cannot be empty
                                </Alert> 
                                <div style={{display: "flex", justifyContent: "center", marginBottom: "2%"}}>
                                    <div style={{marginLeft: "-1%", fontSize: "25px"}}>
                                        Question:
                                    </div>
                                    <input style={{marginLeft: "1%", width: "40.5%", fontSize: "20px", borderRadius: "8px", padding: "5px"}} type="text" id="changePrompt" value = {this.state.pageFormat.prompt} placeholder= "Enter your multiple choice question: " onChange = {(e)=>this.changePrompt(e)}/>
                                </div>
                                <div>
                                    {this.state.pageFormat.multiple_choices.map((choice,index) => (
                                        <div style={{display:"flex", justifyContent: "center", marginTop: "0.5%", marginRight: "5%"}}>
                                            <div style={{marginLeft: "-1%", fontSize: "25px"}}>
                                                Incorrect Option: 
                                            </div>
                                            <input style={{marginLeft: "1%", width: "40%", fontSize: "20px", borderRadius: "8px", padding: "5px"}} type="text" id={"changeMCC"+ index} value = {choice} onChange = {(e)=>this.changeMCC(e,index)}/>
                                            <button style = {{background: "red", border: "transparent", borderRadius: "8px", marginLeft: "1%"}} onClick={()=>this.removeMCC(index)} disabled = {this.state.pageFormat.multiple_choices.length < 2 ? true : false}>X</button>
                                        </div>
                                    ))}
                                </div>
                                <Alert style={{textAlign: "center", width: "fit-content", margin: "auto", marginTop: "1%", fontSize: "20px"}} show = {this.state.showEmptyMCCAlert} variant = 'danger'>
                                    The incorrect options cannot be empty 
                                </Alert>  
                                <div style={{display: "flex", justifyContent: "center", marginTop: "2%", marginRight: "3%"}}>
                                    <div style={{marginLeft: "-1%", fontSize: "25px"}}>
                                        Correct Answer: 
                                    </div>
                                    <input style={{marginLeft: "1%", width: "43%", fontSize: "20px", borderRadius: "8px", padding: "5px"}} type="text" id="changeMCA" value = {this.state.pageFormat.multiple_choice_answer} onChange = {(e)=> this.changeMCA(e)}/>
                                </div>
                            </div>
                            <div>         
                            <Alert style={{textAlign: "center", width: "fit-content", margin: "auto", marginTop: "1%", fontSize: "20px"}} show = {this.state.showEmptyMCAAlert} variant = 'danger'>
                                The correct answer cannot be empty
                            </Alert>      
                            </div>
                            
                        </div>
                        {this.state.submit_alert
                            ?
                                <div style={{color: "rgb(0,219,0", textAlign: "center", marginTop: "1%", fontSize: "20px"}}>
                                    Your changes have successfully been saved!
                                </div>
                            :
                                <p></p>
                            }
                        <div style={{marginTop: "2%", marginBottom: "2%", textAlignLast: "center"}}>
                            <button style={{color: "white", background: "rgb(0,219,0)", padding: "10px", borderRadius: "10px", border: "transparent", fontSize: "20px"}} onClick={this.submitMC}>Submit Changes</button>
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
                                <Alert style={{textAlign: "center", marginLeft: "16%", fontSize: "20px", width: "fit-content"}} show = {this.state.showEmptyPromptTitleAlert} variant = 'danger'>
                                        The Question Name cannot be empty
                                    </Alert>     
                                    <Alert style={{textAlign: "center", marginLeft: "16%", fontSize: "20px", width: "fit-content"}} show = {this.state.showQuestionNameAlert} variant = 'danger'>
                                        The Question name cannot be greater than 25 characters long
                                    </Alert>   
                                <div style={{background: "#edd2ae", marginLeft: "5%", marginRight: "5%", borderRadius: "8px", padding: "2% 5% 5% 5%"}}>
                                    <div style={{display: "flex", flexWrap: "wrap"}}>
                                        <div style={{fontSize: "25px", marginTop: "2%"}}>
                                            Question:
                                        </div>
                                        {this.state.fibArray.map((input,index) => (
                                            (index %2 === 0    
                                            ?
                                                <div style={{maxWidth: "325px", marginRight: "2%", marginTop: "2%"}}>
                                                    <input style={{width: "-webkit-fill-available", fontSize: "20px", borderRadius: "8px", padding: "5px", marginLeft: "3%"}} type="text" id={"fibInput"+index} value = {input} placeholder = "If needed, enter your prompt here:" onChange = {() => this.updateFIBInput(index)} size={50}></input>
                                                </div>
                                            :
                                                <div style={{display: "flex", maxWidth: "195px", marginRight: "2%", marginTop: "2%"}}>
                                                    <input type="text" id={"fibInput"+index} style={{borderColor: "red", width: "-webkit-fill-available", fontSize: "20px", borderRadius: "8px", padding: "5px"}} placeholder = "Answer is required: " value = {input} onChange = {() => this.updateFIBInput(index)} size={50}></input>
                                                    <button style = {{background: "red", border: "transparent", borderRadius: "8px", marginLeft: "1%"}} onClick={()=>this.removeFIB(index)} disabled = {this.state.fibArray.length < 4 ? true : false}>X</button>
                                                </div>
                                            )
                                        ))}
                                    </div>    
                                    <Alert style={{width: "fit-content", margin: "auto"}} show = {this.state.showEmptyAlert3} variant = 'danger'>
                                        The blank inputs cannot be empty
                                    </Alert>
                                    <Alert style={{width: "fit-content", margin: "auto"}} show = {this.state.showEmptyAlert4} variant = 'danger'>
                                        Prompts that are in between two blanks cannot be empty
                                    </Alert>
                                    <Alert style={{width: "fit-content"}} show = {this.state.showBothEndsAlert} variant = 'danger'>
                                        Front and End Prompt cannot be empty when there is only one blank 
                                    </Alert>
                                </div>
                                <Prompt when={this.state.has_changes} message="You have unsaved changes! Are you sure you want to leave this page?" />
                                {this.state.submit_alert
                                ?
                                <div style={{color: "rgb(0,219,0", textAlign: "center", marginTop: "1%", fontSize: "20px"}}>
                                    Your changes have successfully been saved!
                                </div>
                                :
                                <p></p>
                                }
                                <div style={{textAlign: "center", marginTop: "2%"}}>
                                    <button style={{color: "white", background: "rgb(0,219,0)", padding: "10px", borderRadius: "10px", border: "transparent", fontSize: "20px"}} onClick={this.submitFIB}>Submit Changes</button>
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
                                    <button style={{margin: "auto", fontSize: "20px", borderRadius: "8px", padding: "5px", background: "white"}} onClick={this.revealModal} disabled = {Object.keys(this.state.pageFormat.matching_pairs).length > 10 ? true : false}>Add New Pair</button>
                                </div>
                                <Prompt when={this.state.has_changes} message="You have unsaved changes! Are you sure you want to leave this page?" />
                                <Alert style={{textAlign: "center", marginLeft: "16%", fontSize: "20px", width: "fit-content"}} show = {this.state.showEmptyQuestion} variant = 'danger'>
                                    The Question name cannot be empty
                                </Alert>
                                <Alert style={{textAlign: "center", marginLeft: "16%", fontSize: "20px", width: "fit-content"}} show = {this.state.showQuestionNameAlert} variant = 'danger'>
                                    The Question name cannot be greater than 25 characters long
                                </Alert>
                                <div style={{background: "#edd2ae", textAlign: "center", marginLeft: "5%", marginRight: "5%", marginBottom: "2%", borderRadius: "8px", padding: "5%"}}>
                                    <div>
                                        <Alert style={{textAlign: "center", margin: "auto", marginBottom: "1%", fontSize: "20px", width: "fit-content"}} show = {this.state.showEmptyPromptTitleAlert} variant = 'danger'>
                                            The Question prompt cannot be empty
                                        </Alert>
                                        <div style={{display: "flex", justifyContent: "center", marginBottom: "5%", marginRight: "3%"}}>
                                            <div style={{marginLeft: "-1%", fontSize: "25px"}}>
                                                 Question:
                                            </div>
                                            <input style={{marginLeft: "1%", width: "41%", fontSize: "20px", borderRadius: "8px", padding: "5px"}} type="text" id="changePrompt" value = {this.state.pageFormat.prompt} onChange = {this.changePrompt}/> 
                                        </div>
                                        {Object.keys(this.state.pageFormat.matching_pairs).length > 0
                                        ?
                                          <p style={{fontSize: "20px"}}>When playing, the element on the right side of the pair is the one that is draggable by the user </p>  
                                        :
                                        <p></p>
                                        }
                                        <div style={{background: "white", width: "50%", margin: "auto", padding: "3%", borderRadius: "8px", border: "2px solid"}}>
                                            <div style={{width: "max-content", margin: "auto"}}>
                                                {Object.keys(this.state.pageFormat.matching_pairs).map((key,index) => (
                                                    <div style={{display: "flex", fontSize: "20px"}}>
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
                                        <Alert style={{textAlign: "center", width: "fit-content", margin: "auto", marginTop: "1%", fontSize: "20px"}} show = {this.state.showLessThanTwoAlert} variant = 'danger'>
                                            A minimum of two unique pairs is required
                                        </Alert> 
                                    </div>
                                </div>
                                {this.state.submit_alert
                                ?
                                <div style={{color: "rgb(0,219,0", textAlign: "center", marginBottom: "1%", fontSize: '20px'}}>
                                    Your changes have successfully been saved!
                                </div>
                                :
                                <p></p>
                                }
                                <div style={{textAlignLast: "center", marginBottom: "1%"}}>
                                    <button style={{color: "white", background: "rgb(0,219,0)", padding: "10px", borderRadius: "10px", border: "transparent", fontSize: "20px"}} onClick= {this.submitMatching}>Submit Changes</button>
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
                                    <Alert style={{textAlign: "center"}} show = {this.state.showEmptyAlert} variant = 'danger'>
                                        The text fields cannot be empty
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
                                        <Alert style={{textAlign: "center"}} show = {this.state.showEmptyAlert2} variant = 'danger'>
                                            The text fields cannot be empty
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
                                    <div style={{display: "flex", margin: "auto"}}>
                                        <div style={{marginLeft: "-2%", fontSize: "25px", height: "fit-content"}}>
                                            Minutes: 
                                        </div>
                                        <select style={{marginLeft: "4%", fontSize: "20px", borderRadius: "8px", padding: "5px"}} onChange = {(e)=>this.changeMinuteTime(e)} value = {this.state.minuteTime} id = "changeMin">
                                            <option value="0">0</option>,<option value="1">1</option>,<option value="2">2</option>,<option value="3">3</option>,<option value="4">4</option>,,<option value="5">5</option>
                                            <option value="6">6</option>,<option value="7">7</option>,<option value="8">8</option>,<option value="9">9</option>,<option value="10">10</option>
                                        </select>
                                        <div style={{marginLeft: "8%", fontSize: "25px", height: "fit-content"}}>
                                            Seconds: 
                                        </div>
                                        <select style={{marginLeft: "4%", fontSize: "20px", borderRadius: "8px", padding: "5px"}} onChange = {(e)=>this.changeSecondTime(e)} value = {this.state.secondTime} id = "changeSec">
                                            <option value="0">0</option>,<option value="1">1</option>,<option value="2">2</option>,<option value="3">3</option>,<option value="4">4</option>,,<option value="5">5</option>
                                            <option value="6">6</option>,<option value="7">7</option>,<option value="8">8</option>,<option value="9">9</option>,<option value="10">10</option>,
                                            <option value="11">11</option>,<option value="12">12</option>,<option value="13">13</option>,<option value="14">14</option>,<option value="15">15</option>
                                            <option value="16">16</option>,<option value="17">17</option>,<option value="18">18</option>,<option value="19">19</option>,<option value="20">20</option>
                                            <option value="21">21</option>,<option value="22">22</option>,<option value="23">23</option>,<option value="24">24</option>,<option value="25">25</option>
                                            <option value="27">27</option>,<option value="28">28</option>,<option value="29">29</option>,<option value="30">30</option>,<option value="31">31</option>
                                            <option value="32">32</option>,<option value="33">33</option>,<option value="34">34</option>,<option value="35">35</option>,<option value="36">36</option>
                                            <option value="37">37</option>,<option value="38">38</option>,<option value="39">39</option>,<option value="40">40</option>,<option value="41">41</option>
                                            <option value="42">42</option>,<option value="43">43</option>,<option value="44">44</option>,<option value="45">45</option>,<option value="46">46</option>
                                            <option value="47">47</option>,<option value="48">48</option>,<option value="49">49</option>,<option value="50">50</option>,<option value="51">51</option>
                                            <option value="52">52</option>,<option value="53">53</option>,<option value="54">54</option>,<option value="55">55</option>,<option value="56">56</option>
                                            <option value="57">57</option>,<option value="58">58</option>,<option value="59">59</option>
                                        </select>
                                    </div>
                                    </div>
                                
                                <Alert style={{width: "fit-content", marginLeft: '70%', fontSize: "20px"}} show = {this.state.showEmptyTimerAlert} variant = 'danger'>
                                    Minutes and seconds cannot both be zero
                                </Alert>
                                <Alert style={{textAlign: "center", marginLeft: "16%", fontSize: "20px", width: "fit-content"}} show = {this.state.showEmptyQuestion} variant = 'danger'>
                                    The Question name cannot be empty
                                </Alert>
                                <div style={{background: "#edd2ae", textAlign: "center", marginLeft: "5%", marginRight: "5%", borderRadius: "8px", padding: "5%", paddingBottom: "2%"}}>
                                    <div>
                                        <div style={{display: "flex", justifyContent: "center", marginBottom: "2%", marginRight: "3%"}}>
                                            <div style={{marginLeft: "-1%", fontSize: "25px"}}>
                                                Question:
                                            </div>
                                            <input style={{marginLeft: "1%", width: "41%", fontSize: "20px", borderRadius: "8px", padding: "5px"}} type="text" id="changePrompt" value = {this.state.pageFormat.prompt} placeholder= "Enter your multiple choice question: " onChange = {(e)=>this.changePrompt(e)}/>
                                        </div>
                                        <div>
                                            <Alert style={{textAlign: "center", width: "fit-content", margin: "auto", marginBottom: "1%", fontSize: "20px"}} show = {this.state.showEmptyPromptTitleAlert} variant = 'danger'>
                                                    The Question Prompt cannot be empty
                                            </Alert>
                                        </div>
                                        <div style={{display: "flex", marginLeft: "32%"}}>
                                            <div style={{fontSize: "25px", marginLeft: "-1%", marginTop: "-0.5%"}}>
                                                Enter a new correct answer: 
                                            </div>
                                            <div style={{marginLeft: "1%"}}>
                                                <input id = "timerInput" value= {this.state.timerInput} onChange={(e)=>this.updateTimerAnswer(e)}></input>
                                            </div>
                                            <div style={{marginLeft: "1%"}}>
                                                <button style={{borderRadius: "5px", background: "rgb(0,219,0)"}} onClick={this.addTimerAnswer} disabled = {this.state.pageFormat.timer_answers.length > 50 ? true : false}>Add Answer</button>
                                            </div>
                                        </div>
                                        <div>
                                            <Prompt when={this.state.has_changes} message="You have unsaved changes! Are you sure you want to leave this page?" />
                                            <Alert style={{width: "fit-content", margin: "auto", marginTop: "1%", fontSize: "20px"}} show = {this.state.showEmptyTimerAnswerInputAlert} variant = 'danger'>
                                                The input cannot be empty
                                            </Alert>
                                            <Alert style={{width: "fit-content", fontSize: "20px", margin: "auto"}} show = {this.state.showTimerAnswerExistAlert} variant = 'danger'>
                                                This answer already exists! Please add unique answers only
                                            </Alert>
                                            <Alert style={{width: "fit-content", fontSize: "20px", margin: "auto"}} show = {this.state.showEmptyTimerAnswersAlert} variant = 'danger'>
                                                At least one answer is required before submitting
                                            </Alert>
                                        </div>

                                    </div>
                                    <div style={{marginTop: "1%", fontSize: "25px", fontWeight: "600", textDecoration: 'underline'}}>
                                        Correct Answers: 
                                    </div>
                                    <div className="user_timer_answers">
                                        <div style={{display: "flex", flexWrap: "wrap", marginLeft: "0.5%", marginRight: "0.5%", overflowY: "auto", height: "100%"}}>
                                        {this.state.pageFormat.timer_answers.map((answer,index) => (
                                            <div style={{background: "white", color: "black", padding: "10px", border: "1px solid black", borderRadius: "10px", marginTop: "1%", marginRight: "1%", minWidth: "100px"}}>
                                                <p>{answer}</p>
                                                <button  style={{background: "rgb(0,219,0)", border: "1px solid", borderRadius: "8px", marginLeft: "15%", padding: "5px"}} onClick={()=>this.editTimerAnswer(index)}>Edit</button>
                                                <button style = {{background: "red", border: "transparent", borderRadius: "8px", marginLeft: "5%", padding: "5px"}} onClick={()=>this.removeTimerAnswer(index)} disabled = {this.state.pageFormat.timer_answers.length < 2 ? true : false}>X</button>
                                            </div>
                                        ))}
                                        </div>
                                    </div>

                                </div>
                                {this.state.submit_alert
                                ?
                                <div style={{color: "rgb(0,219,0", textAlign: "center", marginTop: "1%", marginBottom: "1%", fontSize: "20px"}}>
                                    Your changes have successfully been saved!
                                </div>
                                :
                                <p></p>
                                }
                                <div style={{textAlignLast: "center", marginBottom: "2%"}}>
                                    <button style={{color: "white", background: "rgb(0,219,0)", padding: "10px", borderRadius: "10px", border: "transparent", fontSize: "20px"}} onClick= {this.submitTimer}>Submit Changes</button>
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
                                    <Alert style={{textAlign: "center"}} show = {this.state.showEmptyAlert} variant = 'danger'>
                                        The answer cannot be empty
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
                                    <p></p>
                                </div>
                            )
                        )
                    )
            }
        </div>
    );
}
}