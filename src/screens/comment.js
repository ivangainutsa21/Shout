import React, { Component } from 'react';
import Dimensions from 'Dimensions';
import {
	StyleSheet, TextInput, View,TouchableOpacity, Text, ImageBackground, Image, ListView,
	Platform, PermissionsAndroid, ToastAndroid,Alert,
} from 'react-native';
import { NavigationActions } from 'react-navigation';
import {
	AudioRecorder, AudioUtils
} from 'react-native-audio';
import Sound 		from 'react-native-sound';
import RNFetchBlob 	from 'react-native-fetch-blob'

import { firebaseApp } 		from '../firebase'
import srcLoginBackground 	from '../images/postbackground.png';
import srcAddPost 			from '../images/addpost.png';

export default class Comment extends Component {
	constructor(props) {
		super(props);
		const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

		this.state = {
			likeAvaialbe: true,
			comment: '',
			dataSource: ds.cloneWithRows(['row 1', 'row 2']),

			currentTime: 0.0,
			recording: false,
			stoppedRecording: false,
			finished: false,
			audioPath: AudioUtils.DocumentDirectoryPath + '/shoutRecord.aac',
			hasPermission: undefined,
			playing: false,
			playingRow: undefined,
			recordingStatus: 'Write your comment!',
		}

		this.renderRow = this.renderRow.bind(this);
	}

	static navigationOptions = {
		header: null
	};


	prepareRecordingPath(audioPath){
		AudioRecorder.prepareRecordingAtPath(audioPath, {
			SampleRate: 22050,
			Channels: 1,
			AudioQuality: "Low",
			AudioEncoding: "aac",
			AudioEncodingBitRate: 32000
		});
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
  
	  async _play(url) {
		if (this.state.recording) {
		  await this._stop();
		}
  
		const callback = (error, sound) => {
			if (error) {
				return;
			}
			// Run optional pre-play callback
			//testInfo.onPrepared && testInfo.onPrepared(sound, component);
		
			sound.play(() => {
				// Success counts as getting to the end
				// Release when it's done so we're not using up resources
				this.setState({
					playing: false,
				})
				sound.release();
			});
			
		};
	
		// If the audio is a 'require' then the second parameter must be the callback.
	 
		const sound = new Sound(url, '', error => callback(error, sound));
	
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

	componentDidMount() {
		var views;
		firebaseApp.database().ref('/posts/').child(this.props.navigation.state.params.postName).child('views').once('value')
		.then((snapshot) => {
			views = snapshot.val();
			views ++;
			firebaseApp.database().ref('/posts/').child(this.props.navigation.state.params.postName).update({
				views: views,
			})
		})
		.catch((error) => {
		})
		
		firebaseApp.database().ref('/posts/').child(this.props.navigation.state.params.postName).child('likeUsers').on('value', (snap) => {
            snap.forEach((child) => {
				if(child.val().userId == firebaseApp.auth().currentUser.uid) {

					this.setState({
						likeAvaialbe: false,
					})
				}
            });
		});

		firebaseApp.database().ref('/posts/').child(this.props.navigation.state.params.postName).child('commentUsers').on('value', (snap) => {
            var workshops = [];
            snap.forEach((child) => {
				workshops.push({
					comment: child.val().comment,
					commentTime: child.val().commentTime,
					FullName: child.val().FullName,
					recordName: child.val().recordName,
				});
            });
            this.setState({
                dataSource: this.state.dataSource.cloneWithRows(workshops)
            });
		});


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
	}

	renderRow(item, sectionId, rowId){
        return(
			<View style={{backgroundColor: 'whitesmoke', marginLeft: 10, marginBottom: 10}}>
				<View style={{flexDirection: 'row', alignItems: 'center'}}>
					<Text style={{fontSize: 14, color: 'black'}}>{item.FullName}</Text>
					<Text style={{fontSize: 10, color: 'grey', marginLeft: 10}}>{item.commentTime}</Text>
				</View>
				{
					item.recordName ?
						<View style={{flexDirection: 'row', justifyContent: 'center', alignItems:'center',marginBottom: 5}}>
							{
								rowId == this.state.playingRow ?
									<Text style={{fontSize: 16, color: 'black',}}>{this.state.playing == false ? 'Play' : 'Stop'}</Text>
									:
									<Text style={{fontSize: 16, color: 'black',}}>Play</Text>
							}
							<TouchableOpacity style={{marginLeft: 10}} 
								onPress = {() => {
									if(currnetSound != null)
									{
										currnetSound.stop();
										currnetSound.release();
									}
									if(rowId == this.state.playingRow && this.state.playing == true)
									{
										this.setState({
											playing: false,
										})
										return;
									}
									const sound = new Sound(item.comment, '', error => callback(error, sound));
									this.setState({
										playing: true,
									})
									
									this.setState({
										playingRow: rowId,
									})

									const callback = (error, sound) => {
										if (error || this.state.playing == false) {
											return;
										}
										currnetSound = sound;
										sound.play(() => {
											this.setState({
												playing: false,
											})
											sound.release();
										});
									};
							}}>
							{
							rowId == this.state.playingRow ?
								<Image source={this.state.playing == false ? require('../images/play-button.png') : require('../images/stop-button.png')} style={{height: 22, width: 22}}/>	
								:
								<Image source={require('../images/play-button.png')} style={{height: 22, width: 22}}/>	
							}
							</TouchableOpacity>
						</View>
						:
						<Text style={{fontSize: 12, color: 'black', marginLeft: 10}}>"{item.comment}"</Text>
				}
			</View>
			
        );
	}
	addZero = (i) =>{
		if(i < 10){
			i = '0' + i;
		}
		return i;
	}
	render() {
        const { navigate } = this.props.navigation;
        const { state } = this.props.navigation;
        
		return (
			<ImageBackground style={styles.container} source={srcLoginBackground}>
				<View style={{flex: 0.7,}} >
					<View style={{alignItems: 'flex-start'}} >
						<TouchableOpacity style={{marginLeft: 30, marginTop : 20}} 
							onPress = {() => {
								this.props.navigation.goBack();
						}}>
							<Image source={require('../images/backbtn.png')} style={{height: 40, width: 40}}/>	
						</TouchableOpacity>
					</View>
					<View style={{justifyContent: 'flex-start', alignItems: 'flex-end'}} >
						<Text style = {{fontSize: 40, backgroundColor: 'transparent', color: 'black', marginRight: 20,}}>Shout!</Text>
					</View>
				</View>
				<View style = {{flex: 3,paddingHorizontal: 20, }}>
					<View style = {{flex: 4, }}>
						<View style={{backgroundColor: 'black', flex: 4, borderWidth: 3, borderColor: 'black'}}>
							<Image source={{uri: state.params.downloadUrl}} style={{flex: 1,}}/>
						</View>
						<View style={{backgroundColor: 'whitesmoke',flex: 0.8, alignItems: 'center',shadowOffset:{ height: 1,  },shadowColor: 'black', shadowOpacity: 1.0,}}>
							<Text numberOfLines={1} style={{fontSize: 18}}>{state.params.shoutTitle}</Text>
							<View style = {{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
								<Text style={{fontSize: 12, color: 'darkgray', }}>{state.params.userName}, {state.params.date}</Text>
								<TouchableOpacity style={{marginLeft: 20, }} disabled = {!this.state.likeAvaialbe}
									onPress = {() => {
										var userId = firebaseApp.auth().currentUser.uid;
										firebaseApp.database().ref('/posts/').child(this.props.navigation.state.params.postName).child('likeUsers').push({
											userId,
										})
										var likes;
										firebaseApp.database().ref('/posts/').child(this.props.navigation.state.params.postName).child('likes').once('value')
										.then((snapshot) => {
											likes = snapshot.val();
											likes ++;
											firebaseApp.database().ref('/posts/').child(this.props.navigation.state.params.postName).update({
												likes: likes,
											})
											ToastAndroid.show('You have liked this Shout!', ToastAndroid.SHORT);
										})
										.catch((error) => {
										})
									}}>
									{
									this.state.likeAvaialbe ?
										<Image source={require('../images/heart.png')} style={{height: 30, width: 30}}/>
										:
										<Image source={require('../images/heartdisabled.png')} style={{height: 30, width: 30}}/>
									}
								</TouchableOpacity>

							</View>
						</View>
					</View>
					<View style = {{flex: 2, }}>
						<View style = {{flex: 3.5, marginTop: 10}}>
							<ListView
								dataSource={this.state.dataSource}
								renderRow={this.renderRow}
								enableEmptySections={true}
							/>
						</View>	
						<View style={{flex: 1.2, flexDirection: 'row', alignItems: 'center', justifyContent:'center', marginBottom: 10}}>
								{/*<Text style={{color: '#303030', fontSize: 24, fontWeight: 'bold', }}>Shout Title Goes Here</Text>*/}
								<TextInput //source={usernameImg}
									style={styles.input}
									placeholder={this.state.recordingStatus}
									placeholderTextColor='grey'
									autoCapitalize={'none'}
									returnKeyType={'done'}
									autoCorrect={false}
									underlineColorAndroid='transparent'
									onChangeText={(text) => this.setState({ comment: text })}
									value={this.state.comment}/>
								<TouchableOpacity
									onPressIn = {() => {
										if(this.state.comment == '')
										{
											this._record();
											this.setState({
												recordingStatus: 'Recording...'
											})
										}
									}}
									onPressOut = {() => {
										if(this.state.comment == '')
										{

											this.setState({
												recordingStatus: 'Write your comment!'
											})
											setTimeout(() => {
												this._stop();
												Alert.alert(
													'Post recording',
													'Are you sure you want to post this recording?',
													[
														{text: 'Yes', onPress: () => {
															var date = new Date();
															var recordName = 'record' + 
															date.getUTCFullYear().toString() + '_' +
															this.addZero(date.getUTCMonth()) +	 '_' +
															this.addZero(date.getUTCDate()) + '_' +
															this.addZero(date.getUTCHours()) + '_' +
															this.addZero(date.getUTCMinutes()) + '_' +
															this.addZero(date.getUTCSeconds()) + '_' +
															this.addZero(date.getUTCMilliseconds()) + '.aac';
			
															const image = this.state.audioPath
															const Blob = RNFetchBlob.polyfill.Blob
															const fs = RNFetchBlob.fs
															window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest
															window.Blob = Blob
														
															let uploadBlob = null
															const imageRef = firebaseApp.storage().ref('records').child(recordName)
															let mime = 'audio/aac'
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
																var userId = firebaseApp.auth().currentUser.uid;
																firebaseApp.database().ref('/users/').child(userId).child('FullName').once('value')
																.then((snapshot) => {
						
																	var d = new Date();
																	var commentTime = d.toLocaleTimeString() + ' at '+ d.toDateString();
																	firebaseApp.database().ref('/posts/').child(this.props.navigation.state.params.postName).child('commentUsers').push({
																		userId: userId,
																		FullName: snapshot.val(),
																		comment: url,
																		commentTime: commentTime,
																		recordName: recordName,
																	})
																	ToastAndroid.show('You have commented on this Shout!', ToastAndroid.SHORT);
																	this.setState({ comment: '' })
																	Keyboard.dismiss();
																})
																.catch((error) => {
																})
																var comments;
																firebaseApp.database().ref('/posts/').child(this.props.navigation.state.params.postName).child('comments').once('value')
																.then((snapshot) => {
																	comments = snapshot.val();
																	comments ++;
																	firebaseApp.database().ref('/posts/').child(this.props.navigation.state.params.postName).update({
																		comments: comments,
																	})
																})
																.catch((error) => {
																})
															})
															.catch((error) => {
															})
														}},
														{text: 'No',  },
													],
													{ cancelable: false }
												  )
											}, 50);
											return;
										}
										
										var userId = firebaseApp.auth().currentUser.uid;
										
										firebaseApp.database().ref('/users/').child(userId).child('FullName').once('value')
										.then((snapshot) => {

											var d = new Date();
											var commentTime = d.toLocaleTimeString() + ' at '+ d.toDateString();
											firebaseApp.database().ref('/posts/').child(this.props.navigation.state.params.postName).child('commentUsers').push({
												userId: userId,
												FullName: snapshot.val(),
												comment: this.state.comment,
												commentTime: commentTime,
											})
											ToastAndroid.show('You have commented on this Shout!', ToastAndroid.SHORT);
											this.setState({ comment: '' })
											Keyboard.dismiss();
										})
										.catch((error) => {
										})
										var comments;
										firebaseApp.database().ref('/posts/').child(this.props.navigation.state.params.postName).child('comments').once('value')
										.then((snapshot) => {
											comments = snapshot.val();
											comments ++;
											firebaseApp.database().ref('/posts/').child(this.props.navigation.state.params.postName).update({
												comments: comments,
											})
										})
										.catch((error) => {
										})
									}}>
									{
									this.state.comment == '' ?
										<Image source={require('../images/recordshout.png')} style={{ height: 50, width: 50}}/>
										:
										<Image source={require('../images/postshout.png')} style={{ height: 50, width: 50}}/>
									}
								</TouchableOpacity>
						</View>
					</View>
				</View>
			</ImageBackground>
		);
	}
}

const currnetSound = null;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white',
	},
	input: {
		backgroundColor: 'silver',
		padding: 0,
		paddingLeft:20,
		fontSize: 16,
		color: 'black',
		width: 220,
		height: 40,
		borderRadius: 20,
	},
	button: {
		flexDirection: 'row',
		alignItems: 'center',
		height: 40,
		width: 40,
	},
});
