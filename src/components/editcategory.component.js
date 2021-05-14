import React, { Component } from 'react';
import {api} from "../axios_api.js";
import jwt from 'jsonwebtoken';
import jwt_decode from 'jwt-decode'
import "../format.css";
// import Card from "react-bootstrap/Card"
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faStar, faPlay, faAngleRight, faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import DefaultCoverPhoto from "../images/defaultCoverPhoto.png"
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
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
            removeIndex:''
        }

    }

    updateCategoryFormat (){
        var category_format_id = this.props.location.pathname.substring(39);
        console.log("In updateCategoryFormat:");
        
        //console.log(category_format_id)

        //get specific category format
        api.get('/categoryFormat/getSpecificCategoryFormat/'+category_format_id)
        .then(response => {
            console.log(response.data[0])
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
            console.log(response.data)
            //this.setState({categoryFormat:response.data[0]})

            var pagesArray = response.data[0].pages

            api.post('/pageFormat/getAllPages',{pages_id:pagesArray})
            .then(response =>{
                
                console.log(response)
                allPages = response.data
                console.log(allPages)

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
        this.setState({categoryFormat:tempCat,showEmptyCatAlert:false})
        // var inputVal = document.getElementById('changeCategoryName').value
        // if(inputVal.length < 1)
        // {
        //     var catName = this.state.categoryFormat;
        //     catName.category_name = inputVal;

        //     document.getElementById('changeCategoryName').placeholder = "Category Name Required";

        //     this.setState({categoryFormat: catName});
        //     return
        // }   
        // else 
        // {

        //     const newName = {
        //         categoryID : this.state.categoryFormat._id,
        //         newCatName : inputVal
        //     }

        //     //call update platname 
        //     api.post('/categoryFormat/updateCatName',newName)
        //     .then(response => {
        //         console.log("Change Cat Name:")
        //         console.log(response);
        //         //updates platform format so page is rendered properly
        //         var catName = this.state.categoryFormat;
        //         catName.category_name = inputVal;
        //         this.setState({categoryFormat: catName});
        //         // this.updateCategoryFormat();
        //     })
        //     .catch(error => {
        //         console.log(error)
        //     });
        // }
    }
    setCategoryPhoto() {
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
    
        //var catID = this.state.categoryFormat._id

        var tempCat = this.state.categoryFormat
        api(config)
        .then(response =>{
            console.log((response.data.data.link));
            tempCat.category_photo = response.data.data.link;
            this.setState({platformFormat : tempCat})
        })
        .catch(function (error) {
            console.log(error);
        });
        // api(config)
        // .then(function (response) {
        //     console.log((response.data.data.link));

        //     const updateCatPhoto = {
        //         categoryID : catID,
        //         newCategoryPhoto : response.data.data.link
        //     }

        //     api.post('/categoryFormat/update_category_photo',updateCatPhoto)
        //     .then(response => {
        //         console.log(response.data)
        //         //UPDATING PLATFORM FORMAT IS BROKEN for update cover photo 
        //         this.updateCategoryFormat();
        //       })
        //     .catch(error => {
        //         console.log(error.response)
        //     });

        // })
        // .catch(function (error) {
        // console.log(error);
        // });

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
            console.log(response.data._id)

            //add page to platform 
            const addToCat = {
                category_format_id:this.state.categoryFormat._id,
                page_format_id : response.data._id
            }
            api.post('/categoryFormat/addToPages',addToCat)
            .then(response => {
                console.log(response)
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
        //console.log(`/editPage/`+ platform_format_id +'/' + category_format_id+'/' + page_id)
        this.props.history.push(`/editPage/`+ platform_format_id +'/' + category_format_id+'/' + page_id);
        //console.log("editpage pressed")
    }

    submitChanges() {

        var tempCat = this.state.categoryFormat
        if(tempCat.category_name === "")
        {
            console.log("NAME IS EMPTY")
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
            console.log(response)
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

        console.log(tempArr)
        //console.log(tempArr.splice(ind,1))

        // console.log(tempCategory.pages)

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

        console.log("clicked preview category")
        var platform_format_id = this.props.location.pathname.substring(14,38);
        var category_format_id = this.props.location.pathname.substring(39);

        this.props.history.push(`/previewcategory/`+ platform_format_id +'/' + category_format_id);
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

                        console.log(category_format_id)

                        //get specific category format
                        api.get('/categoryFormat/getSpecificCategoryFormat/'+category_format_id)
                        .then(response => {
                            console.log(response.data)
							this.setState({categoryFormat:response.data[0]})

                            var pagesArray = response.data[0].pages

                            //grab the pages 
                            api.post('/pageFormat/getAllPages',{pages_id:pagesArray})
                            .then(response =>{
                                
                                console.log(response)
                                allPages = response.data
                                console.log(allPages)

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
                <input type="text" id="changeCategoryName" value = {this.state.categoryFormat.category_name} onChange = {(e)=>this.changeCatName(e)}/> 
                <button onClick={this.addPageToCategory}>Add Page</button>
                <img  
                src={this.state.categoryFormat.category_photo === "" ? DefaultCoverPhoto : this.state.categoryFormat.category_photo} 
                width = {200}
                alt="coverphoto"
                />
                <div className="input-group mb-3">
                    <div className="custom-file">
                    <input
                        type="file"
                        id="inputGroupFile01"
                        accept="image/*"
                        onChange={this.setCategoryPhoto}
                    />
                    {/* <label className="custom-file-label" htmlFor="inputGroupFile01">
                        {this.state.fileName === "" ? "Choose an image file" : this.state.fileName}
                    </label> */}
                    </div>
                </div>
                <Alert show = {this.state.showEmptyCatAlert} variant = 'danger'>
                The Category Name can not be empty
                </Alert>
                <button onClick = {this.submitChanges}>Submit Changes</button>
                <button onClick ={this.previewCategory} disabled = {this.state.allPagesInfo.length < 1 ? true : false}>Preview Category</button>
                <div>
                {this.state.allPagesInfo.map((page,index) => (
                    <div>
                    <button onClick={() => this.editPage(page._id)}>{page.page_title}</button>
                    <button onClick= {() => this.revealRemovePage(page._id,page.page_title,index)} disabled = {this.state.allPagesInfo.length < 2 ? true : false}>X</button>
                    </div>
                ))}
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
                    Are you sure you want to delete the page {this.state.removeName}?
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