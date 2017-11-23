import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Dimensions from 'Dimensions';
import {
	StyleSheet, KeyboardAvoidingView, View, TouchableOpacity, ImageBackground, Text, TextInput, Image
} from 'react-native';
import { NavigationActions } 	from 'react-navigation';

import { firebaseApp } 			from '../firebase'
import srcSignupBackground 		from '../images/SignupBackground.png';

export default class Signup extends Component {
	constructor(props) {
		super(props);
		this.state = {
			showPass: true,
			press: false,

			fullName: '',
			email: '',
			password: '',

		};
		this.onSignUp = this.onSignUp.bind(this);
	}

	static navigationOptions = {
		header: null
	};

	onSignUp = () => {
		
		if( this.state.fullName === "" ) 
		{
			alert("Error: The name is not valid.")
			return;
		}
		if( this.state.email === "" )
		{
			alert("Error: The email address is not valid.")
			return;
		} 
		if( this.state.password === "" ) 
		{
			alert("Error: The password is not valid.")
			return;
		}
		firebaseApp.auth().createUserWithEmailAndPassword(this.state.email, this.state.password)
		.then((user) => {
			user.updateProfile({displayName : this.state.fullName});
			firebaseApp.database().ref('users/' + user.uid)
			.set({
			FullName: this.state.fullName
			})
			this.props.navigation.dispatch(backAction);
		}, function(error) {
				alert(error);
		})
		.catch((error) => {
			alert(error);
		})
	}
	
	render() {
		const backAction = NavigationActions.back({
			key: null,
		})
		return (
			<ImageBackground style={styles.container} source={srcSignupBackground}>
				<KeyboardAvoidingView behavior='padding' style={{flex: 1,}}>
					<View style={{flex: 1, justifyContent: 'flex-end'}} >
						<Text style = {{fontSize: 40, backgroundColor: 'transparent', marginLeft: 20, marginBottom: 35, color: 'black'}}>SHOUT!</Text>
					</View>
					<View style = {{flex: 1, alignItems: 'flex-end'}}>
						<TextInput //source={usernameImg}
							style={styles.input}
							placeholder='Full name'
							autoCapitalize={'none'}
							returnKeyType={'done'}
							autoCorrect={false}
							placeholderTextColor='dimgray'
							underlineColorAndroid='transparent'
							onChangeText={(text) => this.setState({ fullName: text })} />
						<TextInput //source={usernameImg}
						style={[styles.input, style = {marginTop: 30}]}
							placeholder='Email address'
							autoCapitalize={'none'}
							returnKeyType={'done'}
							autoCorrect={false}
							placeholderTextColor='dimgray'
							underlineColorAndroid='transparent'
							onChangeText={(text) => this.setState({ email: text })} />
						<TextInput //source={usernameImg}
						style={[styles.input, style = {marginTop: 30}]}
							secureTextEntry={this.state.showPass}
							placeholder='Password'
							returnKeyType={'done'}
							autoCapitalize={'none'}
							autoCorrect={false}
							placeholderTextColor='dimgray'
							underlineColorAndroid='transparent'
							onChangeText={(text) => this.setState({ password: text })} />
						<TouchableOpacity 
							style={styles.button}
							onPress={this.onSignUp}>
							<Text style={styles.text}>Register</Text>
							<Image source={require('../images/right-arrow.png')} style={{width: 20, height: 15, marginLeft: 10}}/>
						</TouchableOpacity>
						<View style={[styles.loginSection, style={marginTop: 50}]}>
							<Text style={styles.noAccount}>Already has an account with TalentS?</Text>
							<View>
								<TouchableOpacity
									onPress={() => this.props.navigation.dispatch(backAction)}>
									<Text style={styles.signUp}>  Sign in</Text>
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
	key: null,
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
	loginSection: {
		width: DEVICE_WIDTH,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'flex-start',
	},
	button: {
		flexDirection: 'row',
		alignItems: 'center',
		marginRight: 70,
		marginTop: 30,
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
