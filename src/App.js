import React from 'react';
import {BrowserRouter as Router, Route} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Home from "./components/home.component";
import SignUp from "./components/signup.component";
import Login from "./components/login.component";
import ForgotPassword from "./components/forgot_password.component";
import Dashboard from "./components/dashboard.component";
import UsePlatform from "./components/useplatform.component"
import EditPlatform from './components/editplatform.component';

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
        <Route path="/useplatform/:id" component = {UsePlatform}/>
        <Route path="/editplatform/:id" component = {EditPlatform}/>
      </div>
    </Router>
  ); 
}

export default App;
