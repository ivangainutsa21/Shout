import React, { Component } from 'react';
import Dimensions from 'Dimensions';
import {
	StyleSheet, KeyboardAvoidingView, Animated, TextInput, View,TouchableOpacity, Text, ImageBackground, Easing, Keyboard,Image, StatusBar
} from 'react-native';

import { firebaseApp } from '../firebase'
import srcLoginBackground from '../images/LoginBackground.png';

export default class SideMenu extends Component {

	constructor(props) {
		super(props);
		this.state = {
			fullName: '',
			email: '',
		};
	}

	componentDidMount() {
		var userId = firebaseApp.auth().currentUser.uid;
		var userName;
		firebaseApp.database().ref('/users/').child(userId).child('FullName').once('value')
		.then((snapshot) => {
			this.setState({
				fullName: snapshot.val(),
			})
		})
		.catch((error) => {
		})
		
		this.setState({
			email: firebaseApp.auth().currentUser.email,
		})
	}
	render() {
        const { navigate } = this.props.navigation;
		return (
			<ImageBackground style={styles.container} source={srcLoginBackground}>
				<View style={{flex: 3, justifyContent: 'flex-end', alignItems: 'center', borderBottomColor: 'lightgrey', borderBottomWidth: 1}}>
                    <Text style={{backgroundColor: 'transparent', marginBottom: 15}}>{this.state.fullName}</Text>
                    <Text style={{backgroundColor: 'transparent', marginBottom: 20}}>{this.state.email}</Text>
                </View>
                <View style={{flex: 1, justifyContent:'space-between', alignItems: 'center', paddingTop: 30}}>
                    <TouchableOpacity 
                        onPress = {() => {
                            this.props.navigation.navigate('DrawerClose');
                            setTimeout(() => {
                                navigate('MyProfile');
                            }, 200);
                        }}>
                        <Text style = {{fontSize : 32, fontWeight: 'bold'}}>My Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress = {() => {
                            this.props.navigation.navigate('DrawerClose');
                            setTimeout(() => {
                                navigate('Settings');
                            }, 200);
                        }}>
                        {/*<Text style = {{fontSize : 32, fontWeight: 'bold'}}>Settings</Text>*/}
                    </TouchableOpacity>
                </View>
                <View style={{flex: 2, justifyContent: 'center', alignItems: 'center'}}>
                    <Text>Powered By Talents Essence</Text>
                </View>
			</ImageBackground>
		);
	}
}

const DEVICE_WIDTH = Dimensions.get('window').width;
const DEVICE_HEIGHT = Dimensions.get('window').height;
const MARGIN = 40;

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
