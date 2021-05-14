import React from 'react';
import {BrowserRouter as Router, Route} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Home from "./components/home.component";
import SignUp from "./components/signup.component";
import Login from "./components/login.component";
import ForgotPassword from "./components/forgot_password.component";
//import Dashboard from "./components/dashboard.component";
import UseCategory from "./components/usecategory.component"
import EditPlatform from './components/editplatform.component';
//import EditPage from './components/editpage.component';
import TempDashboard from "./components/tempdashboard.component"
import Platform from "./components/platform.component"
import EditCategory from './components/editcategory.component';
import MyPlatforms from './components/myplatforms.component';
import TempEditPage from'./components/tempeditpage.component';
import PreviewCategory from './components/previewcategory.component';
import Leaderboard from'./components/leaderboard.component';
import Settings from './components/settings.component';

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
        <Route path="/dashboard" exact component={TempDashboard} />
        <Route path="/leaderboard" exact component={Leaderboard} />
        <Route path ="/myplatforms" exact component={MyPlatforms}></Route>
        <Route path="/platform/:id" component = {Platform} />
        <Route path="/usecategory/:id/:id" component = {UseCategory}/>
        <Route path="/editplatform/:id" component = {EditPlatform}/>
        <Route path="/editcategory/:id/:id" component = {EditCategory}/>
        <Route path="/editpage/:id/:id/:id" component = {TempEditPage}/>
        <Route path="/previewcategory/:id/:id" component = {PreviewCategory}/>
        <Route path="/settings" component = {Settings}/>
      </div>
    </Router>
  ); 
}

export default App;
