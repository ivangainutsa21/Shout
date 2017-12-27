import React, { Component } from 'react';
import Dimensions from 'Dimensions';
import {
	StyleSheet, KeyboardAvoidingView, Animated, TextInput, View,TouchableOpacity, Text, 
	ImageBackground, Easing, Keyboard,Image, StatusBar, ListView, Platform, 
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import { NavigationActions } from 'react-navigation';

import { firebaseApp } from '../firebase'
import RNFetchBlob from 'react-native-fetch-blob'

import srcLoginBackground from '../images/postbackground.png';
import ImageResizer 	from 'react-native-image-resizer';

export default class UserProfile extends Component {

	constructor(props) {
		super(props);
		this.state = {
			fullName: '',
			email: '',
			avatar: ''
		};
	}

	static navigationOptions = {
		header: null
	};

	componentDidMount() {
		var user = firebaseApp.auth().currentUser;
		firebaseApp.database().ref('/users/').child(user.uid).child('FullName').once('value').then((snapshot) => {
			this.setState({
				fullName: snapshot.val(),
			})
		}).catch((error) => {
		})

		this.setState({
			avatar: user.photoURL,
			email: firebaseApp.auth().currentUser.email,
		})
	}

	render() {
		const { navigate } = this.props.navigation;

		const backAction = NavigationActions.back({
			key: null,
		})
		var user = firebaseApp.auth().currentUser;
		const options = {
			title: '',
			storageOptions: {
			  skipBackup: true,
			  path: 'images'
			}
		};

		return (
			<View style={styles.container} >
				<View style={{height: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems:'center', marginTop: 5, marginHorizontal: 20}} >
					<TouchableOpacity
						onPress = {() => {
							this.props.navigation.goBack();
						}}>
						<Image source={require('../images/backbtn.png')} style={{height: 40, width: 40}}/>	
					</TouchableOpacity>
					<Text style = {{fontSize: 32, backgroundColor: 'transparent', color: 'black',}}>My Profile</Text>
				</View>
				
				<TouchableOpacity style={{marginTop: 50, alignSelf: 'center', }}
					onPress = {() => {
						ImagePicker.showImagePicker(options, (response) => {
							console.log('Response = ', response);
							
							if (response.didCancel) {
								console.log('User cancelled image picker');
							}
							else if (response.error) {
								console.log('ImagePicker Error: ', response.error);
							}
							else if (response.customButton) {
								console.log('User tapped custom button: ', response.customButton);
							}
							else {
								new Promise(((resolve, reject) => {
									ImageResizer.createResizedImage(response.uri, 1024, 1024, 'JPEG', 100)
									.then(({uri}) => {
										resolve(uri)
									})
								})).then((uri) => {
									var date = new Date();
									const image = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
									const Blob = RNFetchBlob.polyfill.Blob
									const fs = RNFetchBlob.fs
									window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest
									window.Blob = Blob
								
									let uploadBlob = null
									const imageRef = firebaseApp.storage().ref('avatar').child(user.uid + '.jpg')
									let mime = 'image/jpg'
									fs.readFile(image, 'base64')
										.then((data) => {
										return Blob.build(data, { type: `${mime};BASE64` })
									})
									.then((blob) => {
										uploadBlob = blob
										return imageRef.put(blob, { contentType: mime })
										})
									.then(() => {
										uploadBlob.close()
										return imageRef.getDownloadURL();
									})
									.then((url) => {
										this.setState({
											avatar: url,
										})
										user.updateProfile({
											photoURL: url,
										})
									})
								});
							}
						});	
					}}>
					{
						this.state.avatar?
						<Image source={{uri: this.state.avatar}} style={{height: 200, width: 200, borderRadius: 100}}/>
						:
						<View style={{height: 200, width: 200, backgroundColor:'black', borderRadius: 100}}/>
					}
					
				</TouchableOpacity>
				<Image source={require('../images/plus.png')} style={{height: 50, width: 50, marginTop: -60, marginLeft: 150, alignSelf:'center'}}/>
				<View style={{marginLeft: 20, marginTop: 50, flexDirection: 'row'}}>
					<View style={{flex: 1}}>
						<Text style = {{fontSize: 20, backgroundColor: 'transparent', color: 'black', fontWeight: 'bold', }}>Name: </Text>
						<Text style = {{fontSize: 20, backgroundColor: 'transparent', color: 'black', fontWeight: 'bold', marginTop: 10}}>Username: </Text>
						<Text style = {{fontSize: 20, backgroundColor: 'transparent', color: 'black', fontWeight: 'bold', marginTop: 10}}>Email: </Text>
					</View>
					<View style={{flex: 2}}>
						<Text style = {{fontSize: 20, backgroundColor: 'transparent', color: 'black', }} numberOfLines={1}>{this.state.fullName}</Text>
						<Text style = {{fontSize: 20, backgroundColor: 'transparent', color: 'black', marginTop: 10}} numberOfLines={1}>{this.state.fullName}</Text>
						<Text style = {{fontSize: 20, backgroundColor: 'transparent', color: 'black', marginTop: 10}} numberOfLines={1}>{this.state.email}</Text>
					</View>
				</View>
				<View style={{justifyContent: 'flex-end', alignItems: 'center', flex: 1, marginBottom: 50}}>
					<Text style = {{fontSize: 20, backgroundColor: 'transparent', color: 'grey',}}>Powered By Talents Essence</Text>
				</View>
			</View>
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
