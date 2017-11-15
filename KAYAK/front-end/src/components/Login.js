import React, {Component} from 'react';
import * as API from '../api/SigninSignup-API';
import ReactDOM from 'react-dom';
import Search from './Home';
import FormErrors from "./FormErrors";

class Login extends Component {

  state={
    firstname:'',
    lastname:'',
    email:'',
    pass:'',

    user:'',
    messageLogin:'false',
    message:'',
    username:'',
    password:'',

    formErrors: {email: '', password: ''},
    formErrors1: {firstname: '',lastname: '',email: '', password: ''},
    emailValid: false,
    passwordValid: false,
    formValid: false,
    type:false,
    firstNameValid:false,
    lastNameValid:false,
  };

  componentWillMount(){
          this.setState({username:'',password:'',message:'',
          formErrors: {email: '', password: ''},
          formErrors1: {email: '', password: ''},
          emailValid: false,
          passwordValid: false,
          formValid: false,
          firstNameValid:false,
          lastNameValid:false,
          type:false});
        };

  validateField(fieldName, value) {
      let fieldValidationErrors = this.state.formErrors;
      let emailValid = this.state.emailValid;
      let passwordValid = this.state.passwordValid;
      switch(fieldName) {
          case 'email':
              emailValid = value.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
              fieldValidationErrors.email = emailValid ? '' : ' is invalid';
              break;
          case 'password':
              passwordValid = value.length >= 3;
              fieldValidationErrors.password = passwordValid ? '': ' is too short';
              break;
          default:
              break;
      }
      this.setState({formErrors: fieldValidationErrors,
          emailValid: emailValid,
          passwordValid: passwordValid,
      }, this.validateForm);
  }

  validateForm() {
      this.setState({formValid: this.state.emailValid && this.state.passwordValid});
  }

  validateField1(fieldName, value) {
      let fieldValidationErrors = this.state.formErrors1;
      let emailValid = this.state.emailValid;
      let passwordValid = this.state.passwordValid;
      let firstNameValid=this.state.firstNameValid;
      let lastNameValid=this.state.lastNameValid;
      switch(fieldName) {
        case 'firstname':
            firstNameValid = value.length !== 0;
            fieldValidationErrors.firstname = firstNameValid ? '': ' is required';
            break;
        case 'lastname':
            lastNameValid = value.length !== 0 ;
            fieldValidationErrors.lastname = lastNameValid ? '': ' is required';
            break;
          case 'email':
              emailValid = value.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
              fieldValidationErrors.email = emailValid ? '' : ' is invalid';
              break;
          case 'password':
              passwordValid = value.length >= 3;
              fieldValidationErrors.password = passwordValid ? '': ' is too short';
              break;

          default:
              break;
      }
      this.setState({formErrors1: fieldValidationErrors,
        firstNameValid:firstNameValid,
        lastNameValid:lastNameValid,
          emailValid: emailValid,
          passwordValid: passwordValid,
      }, this.validateForm1);
  }

  validateForm1() {
      this.setState({formValid: this.state.firstNameValid && this.state.lastNameValid && this.state.emailValid && this.state.passwordValid});
  }

  errorClass(error) {
      return(error.length === 0 ? '' : 'has-error');
  }

     handleLogin = (input) => {
          console.log(input.loginemail);
            API.login(input)
                .then((output) => {
                    if (output === 0) {
                      console.log("OUPUT= "+output);
                      this.setState({islogged: 'false', message:"Invalid credentials. Login again." });
                        console.log("Wrong login: "+this.state.islogged);
                    } else {
                      this.setState({messageLogin: 'true', user: output, message:"Login Failed."});

                        console.log("Success login= "+output.uid);
                        this.props.handleLogged(output.uid);
                    }
                });
        };

        handleSignup = (user) => {
          console.log("CHECK: "+user.firstname);
            API.signup(user)
                .then((output) => {
                    if (output === 0) {
                        console.log("Failed signup");
                    } else {
                        console.log("Success signup");
                    }
                });
        };

    render() {
        return (
          <div>
            {this.state.messageLogin==='false' ? (
            //   <div id="fh5co-wrapper">
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
                  <input type="text" ref="fn" className="form-control" onChange={(event)=>{const name="firstname"
                                                                        const value=event.target.value
                                                                        this.setState({firstname: event.target.value,
                                                                        type:true},() => { this.validateField1(name, value) });}} required/>
                  </div>
                  </div>

                  <div className="col-xxs-12 col-xs-6 mt">
                  <div className="input-field">
                  <label>Last Name:</label>
                  <input type="text" ref="ln" className="form-control" onChange={(event)=>{const name="lastname"
                                                                  const value=event.target.value
                                                                  this.setState({lastname: event.target.value,
                                                                    type:true},() => { this.validateField1(name, value) });}} required/>
                   </div>
                  </div>

                  <div className="col-xxs-12 col-xs-6 mt">
                  <div className="input-field">
                  <div className={'form-group ${this.errorClass(this.state.formErrors1.email)}'}>
                  <label>Email:</label>
                  <input type="text" ref="em" className="form-control" onChange={(event)=>{const name="email"
                                              const value=event.target.value
                                             this.setState({email: event.target.value,type:true}, () => { this.validateField1(name, value) });}} required/>
                </div>
              </div>
            </div>
            <div className="col-xxs-12 col-xs-6 mt">
              <div className="input-field">
              <div className={'form-group ${this.errorClass(this.state.formErrors1.password)}'}>
                <label>Password:</label>
                <input type="password" ref="pwd" className="form-control" onChange={(event)=>{const name="password"
                                          const value=event.target.value
                                              this.setState({pass: event.target.value,type:true}, () => { this.validateField1(name, value) });}} required/>
                  </div>
              </div>
            </div>

            <div className="col-xs-12">
<input type="submit" disabled={!this.state.formValid} className="btn btn-primary btn-block" value="Submit" onClick={() => this.handleSignup(this.state)}/>
            </div>
          </div>
          </form>
<FormErrors formErrors={this.state.formErrors1} />
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
              <div className={'form-group ${this.errorClass(this.state.formErrors.email)}'}>
                      <label>Email:</label>
                      <input type="text" className="form-control" onChange={(event) => {
                          const name="email"
                          const value=event.target.value
                          this.setState({
                              username: event.target.value,
                              type:true

                          }, () => { this.validateField(name, value) });
                      }} required/>
                      </div>
                    </div>
                  </div>

                  <div className="col-xxs-12 col-xs-6 mt">
                    <div className="input-field">
                    <div className={'form-group ${this.errorClass(this.state.formErrors.password)}'}>
                      <label>Password:</label>
                      <input type="password" className="form-control" onChange={(event) => {
                          const name="password"
                          const value=event.target.value
                          this.setState({
                              password: event.target.value,
                              type:true
                          }, () => { this.validateField(name, value) });
                      }} required/>
                    </div>
                  </div>
                  </div>

                  <div className="col-xs-12">
                  <button type="button" disabled={!this.state.formValid} className="btn btn-primary btn-block" value="Submit" onClick={() => this.handleLogin(this.state)}>Submit</button>
                  </div>
                </div>
                </form>
                <FormErrors formErrors={this.state.formErrors} />
                <font color="red">{this.state.message}</font>
                </div>
              </div>
              </div>
        </div>
        </div>

    </div>
  </div>
</div>


</div>) :(<Search/>)}
</div>
        );
    }
    /*
    <form  >
        <fieldset>
            <div className="form-group" controlId="formHorizontalEmail">
                <FormControl className={`form-group ${this.errorClass(this.state.formErrors.email)}`}
                    type="text"
                    name="email"
                    placeholder="Email"
                    value={this.state.username}
                    onChange={(event) => {
                        const name="email"
                        const value=event.target.value
                        this.setState({
                            username: event.target.value,
                            type:true

                        }, () => { this.validateField(name, value) });
                    }} required autofocus
                />
            </div>

            <div className="form-group" controlId="formHorizontalPassword">
                <FormControl className={`form-group ${this.errorClass(this.state.formErrors.password)}`}
                    type="password"
                    name="password"
                             value={this.state.password}
                    placeholder="Password"
                    onChange={(event) => {
                        const name="password"
                        const value=event.target.value
                        this.setState({
                            password: event.target.value,
                            type:true
                        }, () => { this.validateField(name, value) });
                    }} required
                />
            </div>
            <font color="red">{this.state.message}</font>
            <Button disabled={!this.state.formValid} onClick={() => this.handleLogin(this.state)} bsSize="large" bsStyle="success" block>Login</Button>

        </fieldset>
    </form>

    */
}

export default Login;
