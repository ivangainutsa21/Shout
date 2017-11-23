import React, { Component } from 'react';
import Dimensions from 'Dimensions';
import {
	StyleSheet, KeyboardAvoidingView, Animated, TextInput, View,TouchableOpacity, Text, 
	ImageBackground, Easing, Keyboard,Image, StatusBar, ListView
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import { NavigationActions } from 'react-navigation';

import { firebaseApp } from '../firebase'
import RNFetchBlob from 'react-native-fetch-blob'

import srcLoginBackground from '../images/postbackground.png';
import srcAddPost from '../images/addpost.png';

export default class UserProfile extends Component {

	constructor(props) {
		super(props);
		this.state = {
			fullName: '',
			email: '',
		};
	}

	static navigationOptions = {
		header: null
	};

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

		const backAction = NavigationActions.back({
			key: null,
		})

		return (
			<ImageBackground style={styles.container} source={srcLoginBackground}>
					<View style={{flex: 2, justifyContent: 'center',}} >
						<View style={{flex: 1, justifyContent: 'flex-end', alignItems: 'flex-start'}} >
							<TouchableOpacity style={{marginLeft: 30}} 
								onPress = {() => {
									this.props.navigation.dispatch(backAction);
								}}>
								<Image source={require('../images/backbtn.png')} style={{height: 40, width: 40}}/>	
							</TouchableOpacity>
						</View>
						<View style={{flex: 1, justifyContent: 'flex-start', alignItems: 'flex-end'}} >
							<Text style = {{fontSize: 48, backgroundColor: 'transparent', color: 'black', marginRight: 20}}>My Profile</Text>
						</View>
					</View>
					<View style={{flex: 2, }}>
                    </View>

                    <View style={{flex: 4, marginLeft: 20, }}>
                        <View style={{justifyContent: 'space-between', flex: 1}}>
                            <View style={{flexDirection: 'row', alignItems: 'center',}}>
                                <Text style = {{fontSize: 20, backgroundColor: 'transparent', color: 'black', fontWeight: 'bold', }}>Name: </Text>
                                <Text style = {{fontSize: 20, backgroundColor: 'transparent', color: 'black',}}>{this.state.fullName}</Text>
                            </View>
                            <View style={{flexDirection: 'row', alignItems: 'flex-end',}}>
                                <Text style = {{fontSize: 20, backgroundColor: 'transparent', color: 'black', fontWeight: 'bold',}}>Username: </Text>
                                <Text style = {{fontSize: 20, backgroundColor: 'transparent', color: 'black', }}>{this.state.fullName}</Text>
                            </View>
                            <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
                                <Text style = {{fontSize: 20, backgroundColor: 'transparent', color: 'black', fontWeight: 'bold',}}>Email: </Text>
                                <Text style = {{fontSize: 20, backgroundColor: 'transparent', color: 'black', }}>{this.state.email}</Text>
                            </View>
                            </View>
                            <View style={{justifyContent: 'center', alignItems: 'center', flex: 1.5}}>
                                <Text style = {{fontSize: 20, backgroundColor: 'transparent', color: 'grey',}}>Powered By Talents Essence</Text>
                            </View>
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
		justifyContent:'center',
		alignItems: 'center',
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
		fontSize: 32,
		fontWeight: 'normal'
	},
});
