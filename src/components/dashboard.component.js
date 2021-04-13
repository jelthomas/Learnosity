import React, { Component } from 'react';
//import axios from 'axios';
import {api} from "../axios_api.js";

export default class Dashboard extends Component {
    constructor(props){
        super(props);

        this.state = {
            username: ""
        }

    }

    componentDidMount() {
        api.get('/users:'+this.props.match.params.id)
            .then(response => {
                if (response) {
                    this.setState({
                        username: response.username
                    })
                }
                else{
                    console.log("Could not find User with id: " + this.props.match.params.id);
                }
            })
            .catch(err => console.log("User Error: " + err));
    }

    render() {
        return (
            <div>

                <div>Dashboard Screen</div>
                <div>Hello {this.state.username}</div>
            </div>
        )
    }
}