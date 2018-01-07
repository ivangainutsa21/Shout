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
			avatar: '',
			shouts: 0,
			editprofile: false,
			firstName: '',
			lastName: '',
            isKeyboard: false,
		};
	}

	static navigationOptions = {
		header: null
	};
	componentWillMount () {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow);
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide);
      }
      componentWillUnmount () {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
      }
      keyboardDidShow  = ()=> {
        this.setState({isKeyboard: true})
      }
    
    keyboardDidHide = () => {
        this.setState({isKeyboard: false})
	}

	componentDidMount() {
		var user = firebaseApp.auth().currentUser;
		firebaseApp.database().ref('/users/').child(user.uid).on('value', (snap) => {
			this.setState({
				fullName: snap.val().FullName,
				shouts: snap.val().shouts,
				lastActivity: snap.val().lastActivity,
				likes: snap.val().likes,
			})
			if(user.displayName == null) {
				user.updateProfile({
					displayName: snap.val().FullName,
				})
			}
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
						style={{height: 40, width: 40, alignItems: 'center', justifyContent: 'center'}}
						onPress = {() => {
							this.props.navigation.goBack();
						}}>
						<Image source={require('../images/backbtn.png')} style={{height: 20, width: 20}}/>	
					</TouchableOpacity>
					<Text style = {{fontSize: 32, backgroundColor: 'transparent', color: 'black',}}>My Profile</Text>
				</View>
				<View style = {{flex: 1}}> 
					<TouchableOpacity style={{flex: 1}}
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
							<Image source={{uri: this.state.avatar}} style={{flex: 1}}/>
							:
							<View style={{backgroundColor: 'black', flex: 1}}/>
						}
					</TouchableOpacity>
					<View style = {{height: 80, marginTop: -80, alignSelf: 'flex-start', marginLeft: 20}}>
						<Text style = {{fontSize: 22, backgroundColor: 'transparent', color: 'white', fontWeight: 'bold'}} numberOfLines={1}>Hi, <Text style = {{fontSize: 22, backgroundColor: 'transparent', color: 'white', fontWeight: 'normal'}} numberOfLines={1}>{this.state.fullName}</Text></Text>
						<Text style = {{fontSize: 12, backgroundColor: 'transparent', color: 'white', fontWeight: 'bold'}} numberOfLines={1}>Phone: <Text style = {{fontSize: 12, backgroundColor: 'transparent', color: 'white', fontWeight: 'normal'}} numberOfLines={1}>+966 50 5050 505</Text></Text>
						<Text style = {{fontSize: 12, backgroundColor: 'transparent', color: 'white', fontWeight: 'bold'}} numberOfLines={1}>Last activity,<Text style = {{fontSize: 12, backgroundColor: 'transparent', color: 'white', fontWeight: 'normal'}} numberOfLines={1}>{this.state.lastActivity}</Text></Text>
					</View>
					<View style = {{height: 40, marginTop: -40, alignSelf: 'flex-end', marginRight: 20,}}>
						<TouchableOpacity
							onPress = {() => {
								//this.props.navigation.goBack();
								this.setState({editprofile: true})
							}}>
							<Image source={require('../images/editprofile.png')} style={{height: 32, width: 32}}/>	
						</TouchableOpacity>
					</View>
					<View style={{flexDirection: 'row', height: 40, backgroundColor: 'whitesmoke'}}>
						<View style={{borderRightColor: 'grey', borderRightWidth: 1, flex: 0.25}}>
						</View>

						<View style={{borderRightColor: 'grey', borderRightWidth: 1, flex: 0.25, alignItems: 'center'}}>
							<Text style = {{fontSize: 14, backgroundColor: 'transparent', color: 'black',}} numberOfLines={1}>Shouts</Text>
							<Text style = {{fontSize: 14, backgroundColor: 'transparent', color: 'black',}} numberOfLines={1}>{this.state.shouts}</Text>
						</View>

						<View style={{borderRightColor: 'grey', borderRightWidth: 1, flex: 0.25, alignItems: 'center'}}>
							<Text style = {{fontSize: 14, backgroundColor: 'transparent', color: 'black',}} numberOfLines={1}>Likes</Text>
							<Text style = {{fontSize: 14, backgroundColor: 'transparent', color: 'black',}} numberOfLines={1}>{this.state.likes}</Text>
						</View>

						<View style={{flex: 0.25}}>
						</View>
					</View>
				</View>
				<View style = {{flex: 0.8,}}>
					<Text style = {[styles.text, style={marginTop: 20}]}>Your Personal Info       </Text>
					<View style={{flex: 1, marginLeft: 30, marginTop: 20, flexDirection: 'row'}}>
						<View style={{flex: 1}}>
							<Text style = {{fontSize: 16, backgroundColor: 'transparent', color: 'black', }}>Name: </Text>
							<Text style = {{fontSize: 16, backgroundColor: 'transparent', color: 'black', marginTop: 10}}>Username: </Text>
							<Text style = {{fontSize: 16, backgroundColor: 'transparent', color: 'black', marginTop: 10}}>Email: </Text>
						</View>
						<View style={{flex: 2}}>
						{
							this.state.editprofile ?
								<View style={{flexDirection: 'row'}}>
									<TextInput
										style={[styles.input, ]}
										placeholder='First Name'
										autoCapitalize={'none'}
										returnKeyType={'done'}
										autoCorrect={false}
										placeholderTextColor='dimgray'
										underlineColorAndroid='transparent'
										maxLength={15}
										onChangeText={(text) => this.setState({firstName: text})}
										value={this.state.firstName}/>
									<TextInput
										style={[styles.input, style={marginLeft: 10}]}
										placeholder='Last Name'
										autoCapitalize={'none'}
										returnKeyType={'done'}
										autoCorrect={false}
										placeholderTextColor='dimgray'
										underlineColorAndroid='transparent'
										maxLength={15}
										onChangeText={(text) => this.setState({lastName: text})}
										value={this.state.lastName}/>
								</View>
								:
								<Text style = {{fontSize: 16, backgroundColor: 'transparent', color: 'black', }} numberOfLines={1}>{this.state.fullName}</Text>
						}
							<Text style = {{fontSize: 16, backgroundColor: 'transparent', color: 'black', marginTop: 10}} numberOfLines={1}>{user.displayName}</Text>
							<Text style = {{fontSize: 16, backgroundColor: 'transparent', color: 'black', marginTop: 10}} numberOfLines={1}>{this.state.email}</Text>
						</View>
					</View>
					<View style = {{flex: 0.6, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', display: this.state.isKeyboard ? 'none' : null}}>
						<TouchableOpacity
							style = {{display: this.state.editprofile ? null : 'none', borderBottomColor: 'black', borderWidth: 1, height: 30, width: 80, alignItems: 'center'}}
							onPress = {() => {
								firebaseApp.database().ref('/users/').child(user.uid).update({
									FullName: this.state.firstName + ' ' + this.state.lastName,
								})
								.then(() =>{

									this.setState({
										editprofile: false,
										firstName: '',
										lastName: '',
									})
								})
							}}>
							<Text style= {{fontSize: 18}}>Save</Text>	
						</TouchableOpacity>
						<TouchableOpacity
							style = {{display: this.state.editprofile ? null : 'none', borderBottomColor: 'black', borderWidth: 1, height: 30, width: 80, alignItems: 'center', marginLeft: 10}}
							onPress = {() => {
								this.setState({
									editprofile: false,
									firstName: '',
									lastName: '',
								})
							}}>
							<Text style= {{fontSize: 18}}>Cancel</Text>	
						</TouchableOpacity>
					</View>
				</View>
				<View style = {{flex: 0.2, marginHorizontal: 20, borderTopColor: 'black', borderTopWidth: 1, display: this.state.isKeyboard ? 'none' : null}}>
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
		width: 100,
		padding: 0,
		paddingHorizontal: 10,
		fontSize: 16,
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
        fontSize: 24, 
        backgroundColor: 'transparent', 
        color: 'black',
        marginHorizontal: 20,
		borderBottomWidth: 1,
		paddingLeft: 10,
		alignSelf: 'flex-start'
    }
});
