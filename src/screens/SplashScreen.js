import React, { Component } from 'react';
import Dimensions from 'Dimensions';
import {
	StyleSheet, KeyboardAvoidingView, Animated, TextInput, View,TouchableOpacity, AppState,
	Text, ImageBackground, Easing, Keyboard,Image, StatusBar, BackHandler, ToastAndroid,
} from 'react-native';
import { NavigationActions } from 'react-navigation'
import { firebaseApp } from '../firebase'

import Spinner from 'react-native-loading-spinner-overlay';

const resetLogin = NavigationActions.reset({
	index: 0,
	actions: [
	  NavigationActions.navigate({ routeName: 'Login'})
	]
  })

  const resetHome = NavigationActions.reset({
	index: 0,
	actions: [
	  NavigationActions.navigate({ routeName: 'Home'})
	]
  })
export default class SplashScreen extends Component {
	
	constructor(props) {
		super(props);
	
			this.state = {
				isLoading: true,	
			}
		}
	static navigationOptions = {
		header: null
	};

	componentDidMount() {
		firebaseApp.auth().onAuthStateChanged((user) => {
			this.setState({
				isLoading: false,
			})
			if (user) {
				this.props.navigation.dispatch(resetHome);
				
			} else {
                this.props.navigation.dispatch(resetLogin);
			}
		});
	}

	render() {
	
	const { navigate } = this.props.navigation;
		return (
			<View>
				<Spinner visible={this.state.isLoading} textContent={"Loading..."} textStyle={{color: '#FFF'}} />
			</View>
		);
	}
}

