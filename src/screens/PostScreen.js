import React, { Component } from 'react';
import Dimensions from 'Dimensions';
import {
	StyleSheet, KeyboardAvoidingView, Animated, TextInput, View,TouchableOpacity, Text, 
	ImageBackground, Easing, Keyboard,Image, StatusBar, ListView,
	Platform,
	PermissionsAndroid,
	ToastAndroid,
	ActivityIndicator,
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import { NavigationActions } from 'react-navigation';
import Sound from 'react-native-sound';
import {AudioRecorder, AudioUtils} from 'react-native-audio';
import Spinner from 'react-native-loading-spinner-overlay';

import OneSignal from 'react-native-onesignal';

import { firebaseApp } from '../firebase'
import RNFetchBlob from 'react-native-fetch-blob'

import srcLoginBackground from '../images/postbackground.png';
import srcAddPost from '../images/addpost.png';

export default class PostScreen extends Component {
	constructor(props) {
		super(props);
		const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
		
		this.state = {
			postUrl: null,
			dataSource: ds.cloneWithRows(['row 1', 'row 2']),
			shoutTitle: null,
			userName: '',

			currentTime: 0.0,
			recording: false,
			stoppedRecording: false,
			finished: false,
			audioPath: AudioUtils.DocumentDirectoryPath + '/test.aac',
			hasPermission: undefined,

			isUploading: false,
		};
	}

	prepareRecordingPath(audioPath){
		AudioRecorder.prepareRecordingAtPath(audioPath, {
		  SampleRate: 22050,
		  Channels: 1,
		  AudioQuality: "Low",
		  AudioEncoding: "aac",
		  AudioEncodingBitRate: 32000
		});
	  }
	componentDidMount() {

		this._checkPermission().then((hasPermission) => {
		  this.setState({ hasPermission });
  
		  if (!hasPermission) return;
  
		  this.prepareRecordingPath(this.state.audioPath);
  
		  AudioRecorder.onProgress = (data) => {
			this.setState({currentTime: Math.floor(data.currentTime)});
		  };
  
		  AudioRecorder.onFinished = (data) => {
			// Android callback comes in the form of a promise instead.
			if (Platform.OS === 'ios') {
			  this._finishRecording(data.status === "OK", data.audioFileURL);
			}
			};

		});


		
		var userId = firebaseApp.auth().currentUser.uid;
		firebaseApp.database().ref('/users/').child(userId).once('value')
		.then((snapshot) => {
			this.setState({
				userName: snapshot.val().FullName,
			})
		})
		.catch((error) => {
			alert(error);
		})
		
	  }
  
	  _checkPermission() {
		if (Platform.OS !== 'android') {
		  return Promise.resolve(true);
		}
  
		const rationale = {
		  'title': 'Microphone Permission',
		  'message': 'AudioExample needs access to your microphone so you can record audio.'
		};
  
		return PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, rationale)
		  .then((result) => {
			console.log('Permission result:', result);
			return (result === true || result === PermissionsAndroid.RESULTS.GRANTED);
		  });
	  }
  
	  _renderButton(title, onPressIn, active, onPressOut) {
		var style = (active) ? styles.activeButtonText : styles.buttonText;
  
		return (
		  <TouchableHighlight style={styles.button} onPressIn={onPressIn} onPressOut={onPressOut}>
			<Text style={style}>
			  {title}
			</Text>
		  </TouchableHighlight>
		);
	  }
  
	  async _pause() {
		if (!this.state.recording) {
		  console.warn('Can\'t pause, not recording!');
		  return;
		}
  
		this.setState({stoppedRecording: true, recording: false});
  
		try {
		  const filePath = await AudioRecorder.pauseRecording();
  
		  // Pause is currently equivalent to stop on Android.
		  if (Platform.OS === 'android') {
			this._finishRecording(true, filePath);
		  }
		} catch (error) {
		  console.error(error);
		}
	  }
  
	  async _stop() {
		if (!this.state.recording) {
		  console.warn('Can\'t stop, not recording!');
		  return;
		}
  
		this.setState({stoppedRecording: true, recording: false});
  
		try {
		  const filePath = await AudioRecorder.stopRecording();
  
		  if (Platform.OS === 'android') {
			this._finishRecording(true, filePath);
		  }
		  return filePath;
		} catch (error) {
		  console.error(error);
		}
	  }
  
	  async _play() {
		if (this.state.recording) {
		  await this._stop();
		}
  
		// These timeouts are a hacky workaround for some issues with react-native-sound.
		// See https://github.com/zmxv/react-native-sound/issues/89.
		setTimeout(() => {
		  var sound = new Sound(this.state.audioPath, '', (error) => {
			if (error) {
			  console.log('failed to load the sound', error);
			}
		  });
  
		  setTimeout(() => {
			sound.play((success) => {
			  if (success) {
				console.log('successfully finished playing');
			  } else {
				console.log('playback failed due to audio decoding errors');
			  }
			});
		  }, 100);
		}, 100);
	  }
  
	  async _record() {
		if (this.state.recording) {
		  console.warn('Already recording!');
		  return;
		}
  
		if (!this.state.hasPermission) {
		  console.warn('Can\'t record, no permission granted!');
		  return;
		}
  
		if(this.state.stoppedRecording){
		  this.prepareRecordingPath(this.state.audioPath);
		}
  
		this.setState({recording: true});
  
		try {
		  const filePath = await AudioRecorder.startRecording();
		} catch (error) {
		  console.error(error);
		}
	  }
  
	  _finishRecording(didSucceed, filePath) {
		this.setState({ finished: didSucceed });
		console.log(`Finished recording of duration ${this.state.currentTime} seconds at path: ${filePath}`);
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
								this._record();
								//AudioPlayer._record();
							}}
							onPressOut = {() => {
								setTimeout(() => {
									this._stop(); 
									this._play();
									}, 100);
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
