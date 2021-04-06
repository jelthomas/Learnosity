import React from 'react';
import {BrowserRouter as Router, Route} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import Home from "./components/home.component";
// import Navbar from "./components/navbar.component";

function App() {
  return (
    <Router>
      <div className="container">
        {/* <Navbar />
        <br/> */}
        <Route path="/" exact component={Home} />
      </div>
    </Router>
  ); 
}

export default App;
