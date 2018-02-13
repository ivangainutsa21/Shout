import React, { Component } from 'react';
import Dimensions from 'Dimensions';
import {
	StyleSheet, KeyboardAvoidingView, TextInput, View, TouchableOpacity, Text, ImageBackground, Keyboard, Image, Button
} from 'react-native';
import { NavigationActions } from 'react-navigation';

import { firebaseApp } 		from '../firebase'
import srcLoginBackground 	from '../images/LoginBackground.png';
import { connect } from "react-redux";

import { loggedIn, } from '../actions'

//import { startPhoneNumberVerification } from '../native/auth'

class Login extends Component {
	constructor(props) {
		super(props);
		this.state = {
			showPass: true,
			press: false,

			email: '',
			password: '',
		};
	}

	static navigationOptions = {
		header: null
	};

	render() {
		const { navigate } = this.props.navigation;

		return (
			<View style={styles.container}>
				<Text style = {{fontSize: 64, marginTop: 50, alignSelf: 'center', color: 'white'}}>SHOUT!</Text>
				<Text style = {{fontSize: 18, marginTop: 40, marginLeft: 20, color: 'white'}}>Please enter your mobile number:</Text>
				<TextInput 
					style = {styles.input}
					keyboardType = 'numeric'
					underlineColorAndroid='transparent'>
				</TextInput>
				<View style={{flex: 1,}} ref='abc'>
				<Button
					key='id'
					title="Learn More"
					color="#841584"
					/>
					<TouchableOpacity style={{alignSelf: 'flex-end', marginRight: 30, flex: 0.7, justifyContent: 'flex-end'}} key={'sign'}
						onPress={() => {
							/*
							window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('sign-in-button', {
								'size': 'invisible',
								'callback': function(response) {
								  // reCAPTCHA solved, allow signInWithPhoneNumber.
								  //onSignInSubmit();
								}
							  });*/
							  //firebaseApp.auth().signInWithPhoneNumber('98734');
							  firebaseApp.auth().verifyPhoneNumber('+971582062193')
						}}>
						<Image source={require('../images/nextBtn.png')} style={{height: 30, width: 30}}/>	
					</TouchableOpacity>
					<View style = {{flex: 0.3, justifyContent: 'flex-end', marginBottom: 10}}>
						<Text style = {{fontSize: 14, color: 'white', alignSelf: 'center',}}>Powered by Talents Essence</Text>
					</View>
				</View>
			</View>
		);
	}
}

const backAction = NavigationActions.back({
})

const DEVICE_WIDTH = Dimensions.get('window').width;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#2c82c9',
	},
	input: {
		backgroundColor: 'transparent',
		marginTop: 10,
		marginLeft: 20,
		width: DEVICE_WIDTH - 100,
		padding: 0,
		paddingLeft: 5,
		fontSize: 18,
		color: 'black',
		borderBottomColor: 'white',
		borderBottomWidth: 1,
	},
	button: {
		flexDirection: 'row',
		alignItems: 'center',
		marginRight: 70,
		marginTop: 30,
	},
	SignupSection: {
		width: DEVICE_WIDTH,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'flex-start',
	},
	noAccount: {
		color: 'dimgray',
		fontSize: 16,
		backgroundColor: 'transparent',
	},
	signUp: {
		color: 'black',
		fontSize: 16,
		backgroundColor: 'transparent',
		fontWeight: 'bold'
	},
	text: {
		color: 'black',
		backgroundColor: 'transparent',
		fontSize: 18,
		fontWeight: 'bold'
	},
});

export default connect()(Login);