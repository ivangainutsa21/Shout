import React, { Component } from 'react';
import Dimensions from 'Dimensions';
import {
	StyleSheet, TextInput, View, TouchableOpacity, Text, ImageBackground, Image, ListView,
	Platform,	PermissionsAndroid, ToastAndroid,
} from 'react-native';
import { connect } from "react-redux";
import { NavigationActions } 		from 'react-navigation';
import {AudioRecorder, AudioUtils} 	from 'react-native-audio';
import Sound 		from 'react-native-sound';
import ImagePicker 	from 'react-native-image-picker';
import Spinner 		from 'react-native-loading-spinner-overlay';
import OneSignal 	from 'react-native-onesignal';

import { firebaseApp } 			from '../firebase'
import RNFetchBlob 					from 'react-native-fetch-blob'
import srcLoginBackground 	from '../images/postbackground.png';
import srcAddPost 					from '../images/addpost.png';
import store 								from '../store'

class Post extends Component {
	constructor(props) {
		super(props);
		const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
		
		this.state = {
			postUrl: null,
			dataSource: ds.cloneWithRows(['row 1', 'row 2']),
			shoutTitle: null,
			userName: '',

			isUploading: false,
		};
	}

	componentDidMount() {
		this.setState({
			userName: store.getState().getUserInfo.fullName,
		})
	}

	static navigationOptions = {
		header: null
	};

	addZero = (i) =>{
		if(i < 10){
			i = '0' + i;
		}
		return i;
	}

	postShout = () => {
		var date = new Date();
		var uploadName = 'post' + 
			date.getUTCFullYear().toString() + '_' +
			this.addZero(date.getUTCMonth()) +	 '_' +
			this.addZero(date.getUTCDate()) + '_' +
			this.addZero(date.getUTCHours()) + '_' +
			this.addZero(date.getUTCMinutes()) + '_' +
			this.addZero(date.getUTCSeconds()) + '_' +
			this.addZero(date.getUTCMilliseconds());
		var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "June",
			"July", "Aug", "Sep", "Oct", "Nov", "Dec"
		];
	
		var postDate = date.getDate().toString() + 'th of ' + monthNames[date.getMonth()];
		const image = this.state.postUrl.uri
		const Blob = RNFetchBlob.polyfill.Blob
		const fs = RNFetchBlob.fs
		window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest
		window.Blob = Blob
	
		let uploadBlob = null
		const imageRef = firebaseApp.storage().ref('posts').child(uploadName + '.jpg')
		let mime = 'image/jpg'
		fs.readFile(image, 'base64')
			.then((data) => {
			return Blob.build(data, { type: `${mime};BASE64` })
		})
		.then((blob) => {
			uploadBlob = blob
			return imageRef.put(blob, { contentType: mime })
			})
		.then((snapshot) => {
			uploadBlob.close()
			return imageRef.getDownloadURL();
		})
		.then((url) => {

			ToastAndroid.show('Your shout has been posted successfully', ToastAndroid.LONG);
			firebaseApp.database().ref('posts/').child(uploadName).set({
				filename: uploadName + '.jpg',
				downloadUrl: url,
				userName: this.state.userName,
				shoutTitle: this.state.shoutTitle,
				views: 0,
				comments: 0,
				likes: 0,
				date: postDate,
				playerIds: this.props.playerIds,
			})
			
			this.setState({
				isUploading: false,
			})

			let data = []; // some array as payload
			let contents = {
				'en': this.state.userName + ' just shouted!'
			}
			firebaseApp.database().ref().child('playerIds').on('value', (snap) => {
				snap.forEach((child) => {
					OneSignal.postNotification(contents, data, child.key);
				});
			});
			this.props.navigation.goBack();
		})
		.catch((error) => {
		})
	}

	render() {
		const { navigate } = this.props.navigation;
		const options = {
			title: '',
			storageOptions: {
			  skipBackup: true,
			  path: 'images'
			}
		};
		return (
			<ImageBackground style={styles.container} source={srcLoginBackground}>
				<Spinner visible={this.state.isUploading} textContent={"Uploading..."} textStyle={{color: '#FFF'}} />
			
				<View style={{flex: 2, }} >
					<View style={{alignItems: 'flex-start'}} >
						<TouchableOpacity style={{marginLeft: 30, marginTop: 30}} 
							onPress = {() => {
								this.props.navigation.goBack();
							}}>
							<Image source={require('../images/backbtn.png')} style={{height: 40, width: 40}}/>	
						</TouchableOpacity>
					</View>
					<View style={{alignItems: 'flex-end'}} >
						<Text style = {{fontSize: 40, backgroundColor: 'transparent', color: 'black', marginRight: 20}}>Shout Here</Text>
					</View>
				</View>
				<View style={{flex: 5.5, paddingHorizontal: 20}}>
					<TouchableOpacity 
						style={[this.state.postUrl == null ? styles.button : null, style={backgroundColor: 'black',flex: 4}]}
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
									let source = { uri: response.uri };
									this.setState({
										postUrl: source
									})
								}
								});	
						}}>
						{
						this.state.postUrl == null ?
							<Image source={require('../images/addimage.png')} style={{height: 60, width: 60}}/>
							:
							<Image source={this.state.postUrl} style={{flex: 1,borderWidth: 3, borderColor: 'black'}}/>
						}
					</TouchableOpacity>
					<View style={{backgroundColor: 'whitesmoke', flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent:'center', }}>
							<TextInput //source={usernameImg}
								style={styles.input}
								placeholder='Shout Title Goes Here'
								autoCapitalize={'none'}
								returnKeyType={'done'}
								autoCorrect={false}
								placeholderTextColor='black'
								underlineColorAndroid='transparent'
								onChangeText={(text) => this.setState({ shoutTitle: text })}/>
					</View>
				</View>
				<View style={{alignItems: 'center', flex: 2.5, justifyContent: 'center'}}>
						<TouchableOpacity
							disabled={true}
							onPressIn = {() => {
							}}
							onPressOut = {() => {
							}}>
							<Image source={require('../images/recordshoutdisabled.png')} style={{ height: 60, width: 60}}/>	
						</TouchableOpacity>
						<TouchableOpacity 
							style={[styles.button, {backgroundColor: '#7ca0eb', width: 120, borderRadius: 25, marginTop: 5,}]}
							onPress = {() => {
								if(this.state.postUrl == null || this.state.shoutTitle == null)
								{
									alert("Fill required fields.");
									return;
								}
								this.setState({
									isUploading: true,
								})
								this.postShout();
								
								setTimeout(() => {

									if(this.state.isUploading == true)
										ToastAndroid.show('Net error: Upload failed. Please try again.', ToastAndroid.LONG);
									this.setState({
										isUploading: false,
									})
								}, 10000);
							}}>
							<Image source={require('../images/postshout.png')} style={{width: 50, height: 50, marginLeft: 10}}/>
						</TouchableOpacity>
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
		padding: 0,
		paddingLeft:20,
		fontSize: 18,
		color: 'black',
		borderRadius: 20,
		width: 220,
		height: 40,
	},
	button: {
		flexDirection: 'row',
		justifyContent:'center',
		alignItems: 'center',
	},
	text: {
		color: 'black',
		backgroundColor: 'transparent',
		fontSize: 32,
		fontWeight: 'normal'
	},
});

function mapStateToProps(state) {
	return {
	  playerIds: state.getUserInfo.playerIds,
	};
}

export default connect(mapStateToProps)(Post)