import React, { Component } from 'react';
import Dimensions from 'Dimensions';
import {
	StyleSheet, KeyboardAvoidingView, TextInput, View, TouchableOpacity, Text, ImageBackground, Keyboard, Image,
} from 'react-native';
import { NavigationActions } from 'react-navigation';

import { firebaseApp } 		from '../firebase'
import srcLoginBackground 	from '../images/LoginBackground.png';

export default class Login extends Component {
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
			<ImageBackground style={styles.container} source={srcLoginBackground}>
				<KeyboardAvoidingView behavior='padding' style={{flex: 1,}}>
					<View style={{flex: 1, justifyContent: 'flex-end'}} >
						<Text style = {{fontSize: 40, backgroundColor: 'transparent', marginLeft: 20, marginBottom: 35, color: 'black'}}>SHOUT!</Text>
					</View>
					<View style = {{flex: 1, alignItems: 'flex-end'}}>
						<TextInput //source={usernameImg}
							style={styles.input}
							placeholder='Username / Email Address'
							autoCapitalize={'none'}
							returnKeyType={'done'}
							autoCorrect={false}
							placeholderTextColor='dimgray'
							underlineColorAndroid='transparent'
							onChangeText={(text) => this.setState({ email: text })}/>
						<TextInput //source={usernameImg}
							style={[styles.input, style = {marginTop: 30}]}
							secureTextEntry={this.state.showPass}
							placeholder='Password'
							returnKeyType={'done'}
							autoCapitalize={'none'}
							autoCorrect={false} 
							placeholderTextColor='dimgray'
							underlineColorAndroid='transparent'
							onChangeText={(text) => this.setState({ password: text })}/>
						<TouchableOpacity 
							style={styles.button}
							onPress = {() => {
								
								if(this.state.email == "admin", this.state.password == "admin"){
									Keyboard.dismiss();
									setTimeout(() => {
										//go to admin page
									}, 1000);
								}
								else {
									firebaseApp.auth().signInWithEmailAndPassword(this.state.email, this.state.password)
									.then((user) => {
										Keyboard.dismiss();
										this.props.navigation.dispatch(backAction);
									})
									.catch((error) => {
										alert(error);
									})
								}
							}}>
							<Text style={styles.text}>Sign in</Text>
							<Image source={require('../images/right-arrow.png')} style={{width: 20, height: 15, marginLeft: 10}}/>
						</TouchableOpacity>
						<View style ={[styles.SignupSection, style={marginTop: 70}]}>
							<Text style={styles.noAccount}>Don't have an account?</Text>
							<View>
								<TouchableOpacity
									onPress = {() => {
										Keyboard.dismiss();
										navigate('signup');
									}}>
									<Text style={styles.signUp}>  Register Now!</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>		
				</KeyboardAvoidingView>		
			</ImageBackground>
		);
	}
}

const backAction = NavigationActions.back({
})

const DEVICE_WIDTH = Dimensions.get('window').width;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white',
		width: null,
	},
	input: {
		backgroundColor: 'transparent',
		width: DEVICE_WIDTH - 100,
		marginRight: 70,
		padding: 0,
		paddingLeft: 10,
		fontSize: 18,
		color: 'black',
		borderBottomColor: 'dimgray',
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
