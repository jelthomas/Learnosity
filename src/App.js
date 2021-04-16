import React from 'react';
import {BrowserRouter as Router, Route} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import Home from "./components/home.component";
import SignUp from "./components/signup.component";
import Login from "./components/login.component";
// import Navbar from "./components/navbar.component";
import ForgotPassword from "./components/forgot_password.component";
import Dashboard from "./components/dashboard.component";

function App() {
  return (
    <Router>
      <div className="Learn">
        {/* <Navbar /> */}
        {/* <br/> */}
        <Route path="/" exact component={Home} />
        <Route path="/signup" exact component={SignUp}/>
        <Route path="/login" exact component={Login} />
        <Route path="/forgot" exact component={ForgotPassword} />
        <Route path="/dashboard" exact component={Dashboard} />
      </div>
    </Router>
  ); 
}

export default App;
