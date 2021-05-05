import React, { Component } from 'react'

export default class Timer extends Component {
    constructor(props){
        super(props);
    
        this.state = {
            minutes: this.props.minutes,
            seconds: this.props.seconds
        }
      }
    
    // state = {
    //     minutes: this.props.minutes,
    //     seconds: this.props.seconds,
    // }

    componentDidMount() {
        this.myInterval = setInterval(() => {
            const seconds = this.state.seconds;
            const minutes = this.state.minutes;

            if (seconds > 0) {
                this.setState(({ seconds }) => ({
                    seconds: seconds - 1
                }))
            }
            if (seconds === 0) {
                if (minutes === 0) {
                    clearInterval(this.myInterval)
                    this.props.end_clock();
                } else {
                    this.setState(({ minutes }) => ({
                        minutes: minutes - 1,
                        seconds: 59
                    }))
                }
            } 
        }, 1000)
    }

    componentWillUnmount() {
        clearInterval(this.myInterval)
    }

    render() {
        const minutes = this.state.minutes;
        const seconds = this.state.seconds;
        return (
            <div>
                { minutes === 0 && seconds === 0
                    ? <h1></h1>
                    : <p>Time Remaining: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}</p>
                }
            </div>
        )
    }
}