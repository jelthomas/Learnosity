import React, { Component } from 'react';
import axios from 'axios';
import {api} from "../axios_api.js";

export default class Home extends Component {
    constructor(props){
        super(props);

        this.onSubmit = this.onSubmit.bind(this);
        
        this.state = {
            username: '',
        }
    }

    onSubmit(e){
        e.preventDefault();
        console.log("Here");
        api.get('/user')
            .then(res => console.log(res.data));
        // window.location = "/";
    }


    render() {
        return (
            <div>
                Hello Robert!
                <button onClick={this.onSubmit}>This is a button</button>
            </div>
        )
    }
}