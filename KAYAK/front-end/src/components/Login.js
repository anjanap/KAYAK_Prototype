import React, {Component} from 'react';
import { Route, Link,Switch } from 'react-router-dom';
import * as API from '../api/SigninSignup-API';
import ReactDOM from 'react-dom';

class Login extends Component {

  state={
    firstname:'',
    lastname:'',
    email:'',
    password:'',
    user:'',
    messageLogin:'',
    messageSignup:'',
    loginemail:'',
    loginpswd:''
  };

     handleLogin = (input) => {
          console.log(input.loginemail);
            /*API.login(input)
                .then((output) => {
                    if (output === 0) {
                      this.setState({islogged: 'false', message:"Invalid credentials. Login again." });
                        console.log("Wrong login: "+this.state.islogged);
                    } else {
                      this.setState({islogged: 'true', user: output});
                        console.log("Success login= "+this.state.user.firstName);
                    }
                });*/
        };

        handleSignup = (user) => {
          console.log("CHECK: "+user.firstname);
            API.signup(user)
                .then((output) => {
                    if (output === 0) {
                        console.log("Failed signup");
                        this.setState({status: "Sign up failed."});
                    } else {
                        console.log("Success signup");
                        ReactDOM.findDOMNode(this.refs.fn).value = "";
                        ReactDOM.findDOMNode(this.refs.ln).value = "";
                        ReactDOM.findDOMNode(this.refs.em).value = "";
                        ReactDOM.findDOMNode(this.refs.pwd).value = "";
                        this.setState({status: "Sign up successful."});
                    }
                });
        };
      //  <button type="button" className="btn btn-primary btn-block" value="Submit" onClick={() => this.handleSignup(this.state)}>Submit</button>
//<button type="button" className="btn btn-primary btn-block" value="Submit" onClick={() => this.handleLogin(this.state)}>Submit</button>
        componentWillMount(){
                this.setState({username:'',password:'',message:''});
              };

    render() {
        return (
          <div>
<div id="fh5co-wrapper">
<div id="fh5co-page">

<div className="fh5co-hero">
  <div className="fh5co-overlay"></div>
  <div className="fh5co-cover" data-stellar-background-ratio="0.5" style={{backgroundImage: "url(../public/images/cover_bg_1.jpg)"}}>

    <div className="desc">
      <div className="container">
        <div className="row">
        <div className="col-sm-5 col-md-5">
          <div className="tabulation animate-box">
            <div className="tab-content">
            <h3 style={{color:"rgba(0, 0, 0, 0.5)"}}>SIGN UP</h3>

            <form>
          <div className="row">
          <div className="col-xxs-12 col-xs-6 mt">
            <div className="input-field">
              <label>First Name:</label>
              <input type="text" ref="fn" className="form-control" onChange={(event)=>{
                                           this.setState({firstname: event.target.value});}}/>
            </div>
          </div>
          <div className="col-xxs-12 col-xs-6 mt">
            <div className="input-field">
              <label>Last Name:</label>
              <input type="text" ref="ln" className="form-control" onChange={(event)=>{
                                           this.setState({lastname: event.target.value});}}/>
            </div>
          </div>
            <div className="col-xxs-12 col-xs-6 mt">
              <div className="input-field">
                <label>Email:</label>
                <input type="text" ref="em" className="form-control" onChange={(event)=>{
                                             this.setState({email: event.target.value});}}/>
              </div>
            </div>
            <div className="col-xxs-12 col-xs-6 mt">
              <div className="input-field">
                <label>Password:</label>
                <input type="password" ref="pwd" className="w3-input" onChange={(event)=>{
                                              this.setState({password: event.target.value});}}/>
              </div>
            </div>
            <div className="col-xs-12">

              <input type="submit" className="btn btn-primary btn-block" value="Submit" onClick={() => this.handleSignup(this.state)}/>
            </div>
          </div>
          </form>
        </div>
      </div>
    </div>

    <div className="col-sm-2 col-md-2"></div>

    <div className="col-sm-5 col-md-5">
            <div className="tabulation animate-box">
              <div className="tab-content">
              <h3 style={{color:"rgba(0, 0, 0, 0.5)"}}>SIGN IN</h3>
              <form>
                <div className="row">
                  <div className="col-xxs-12 col-xs-6 mt">
                    <div className="input-field">

                      <label>Email:</label>
                      <input type="text" className="form-control" onChange={(event)=>{
                                                   this.setState({loginemail: event.target.value});}}/>
                    </div>
                  </div>
                  <div className="col-xxs-12 col-xs-6 mt">
                    <div className="input-field">
                      <label>Password:</label>
                      <input type="password" className="form-control" onChange={(event)=>{
                                                    this.setState({loginpswd: event.target.value});}}/>
                    </div>
                  </div>
                  <div className="col-xs-12">
                  <input type="submit" className="btn btn-primary btn-block" value="Submit" />
                  </div>
                </div>
                </form>
                </div>
              </div>
              </div>


        </div>
        </div>

    </div>
  </div>
</div>

</div>
</div>
</div>
        );
    }
}

export default Login;
