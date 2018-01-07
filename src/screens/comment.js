import React, { Component } from 'react';
import Dimensions from 'Dimensions';
import {
	StyleSheet, TextInput, View,TouchableOpacity, Text, ImageBackground, Image, 
	Platform, PermissionsAndroid, ToastAndroid, Alert, Keyboard,DeviceEventEmitter, AlertAndroid, Linking, 
	KeyboardAvoidingView, FlatList,
} from 'react-native';
import { NavigationActions } from 'react-navigation';
import ImageView 			from 'react-native-image-view';
import ImageResizer 		from 'react-native-image-resizer';
import RNAudioStreamer 		from 'react-native-audio-streamer';
import OneSignal 			from 'react-native-onesignal';

import RNFetchBlob 			from 'react-native-fetch-blob'
import { firebaseApp } 		from '../firebase';
import srcLoginBackground 	from '../images/postbackground.png';
import AudioPlayer 			from './audioPlayer';
import { connect } 			from "react-redux";
import { loggedIn, } 		from '../actions'
import Spinner 				from 'react-native-loading-spinner-overlay';
import Hyperlink 			from 'react-native-hyperlink'
import { AutoGrowTextInput } from 'react-native-auto-grow-textinput';
import AutoComplete 		from '../components/AutoComplete'
import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';
import ImagePicker 		from 'react-native-image-picker';
import Share, {ShareSheet, Button} from 'react-native-share';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';

class Comment extends Component {
	constructor(props) {
		super(props);

		this.state = {
			likeAvaialbe: true,
			comment: '',
			dataSource: [],
			isPlaying: false,
			playingRow: undefined,
			isVisible: false,
			imageWidth: 0,
			imageHeight: 0,
			showMenu: false,
			isMyPost: false,
			isAllPlaying: false,
			allRecords: [],
			isLike: false,
			currentRecord: 0,
			height: 40,
			isUploading: false,
			allUsers: [],
			thumbnail: null,
			focusedImage: null,
			showCommentMenu: undefined,
		}
		this.renderRow = this.renderRow.bind(this);
		this.onImageClose = this.onImageClose.bind(this);
		this.onUpload = this.onUpload.bind(this);
		this.onComment = this.onComment.bind(this);
		//this.onChangeComment = this.onChangeComment.bind(this);
		this.subscription = DeviceEventEmitter.addListener('RNAudioStreamerStatusChanged',this._statusChanged.bind(this));
	}

	static navigationOptions = {
		header: null
	};

	updateSize = (height) => {
		this.setState({
		  height
		});
	  }

	_statusChanged(status) {
		if(status == 'FINISHED') {
			this.setState({
				playingRow: undefined,
				isPlaying: false,
			})
			if(this.state.isAllPlaying == true) {
				var currentRecord = this.state.currentRecord;
				currentRecord ++; 
				this.setState({
					currentRecord: currentRecord,
				})
				if(currentRecord < this.state.allRecords.length)
				{
					RNAudioStreamer.setUrl(this.state.allRecords[currentRecord]);
					RNAudioStreamer.play()
				} else {
					this.setState({
						isAllPlaying: false,
						currentRecord: 0,
					})
				}
			}
		}

	}

	componentDidMount() {
		
		var allRecords = [];
		firebaseApp.database().ref('/posts/').child(this.props.navigation.state.params.groupName).child(this.props.navigation.state.params.postName).child('commentUsers').on('value', (snap) => {
			snap.forEach((child) => {
				if(child.val().recordName != undefined){
					allRecords.push(child.val().comment);
				}
			});
			this.setState({
				allRecords: allRecords,
			})
		})
		
		firebaseApp.database().ref('/posts/').child(this.props.navigation.state.params.groupName).child(this.props.navigation.state.params.postName).child('userId').on('value', (snap) => {
			if(snap.val() == firebaseApp.auth().currentUser.uid) {
				this.setState({isMyPost: true});
			}
		})
		firebaseApp.database().ref('/posts/').child(this.props.navigation.state.params.groupName).child(this.props.navigation.state.params.postName).child('likeUsers').on('value', (snap) => {
            snap.forEach((child) => {
				if(child.val().userId == firebaseApp.auth().currentUser.uid) {

					this.setState({
						likeAvaialbe: false,
						isPlaying: false,
					})
				}
            });
		});

		firebaseApp.database().ref('/posts/').child(this.props.navigation.state.params.groupName).child(this.props.navigation.state.params.postName).child('commentUsers').on('value', (snap) => {
			var workshops = [];
            snap.forEach((child) => {
				workshops.push({
					comment: child.val().comment,
					commentTime: child.val().commentTime,
					FullName: child.val().FullName,
					recordName: child.val().recordName,
					commentTitle: child.val().commentTitle,
					commentPhoto: child.val().commentPhoto,
					userId: child.val().userId,
					commentFile: child.val().commentFile,
					key: child.key,
				});
            });
            this.setState({
                dataSource: workshops
            });
		});
		firebaseApp.database().ref('/users').on('value', (snap) => {
			var allUsers = [];
			snap.forEach((child) => {
				allUsers.push({
					name: child.val().FullName,
					playerIds: child.val().playerIds,
				})
			})
			this.setState({allUsers: allUsers});
		})
		if(this.props.isLoggedIn == true) {
			this.props.dispatch(loggedIn(false));
			ToastAndroid.show("                               Tip\nPress the send button to comment, or hold it to record your voice.", ToastAndroid.SHORT);
		}
	}
    onSwipeRight(gestureState) {
		this.props.navigation.goBack();
    }
	onImageClose() {
		this.setState({
			isVisible: false,
		})
	}
	onComment() {
		
		console.log(this.state.comment);
		var addedUsers = [];
		for (var i = 0; i < this.state.allUsers.length; i++) {
			let key = "@" + this.state.allUsers[i].name;
			if (this.state.comment.indexOf(key) != -1) {
				addedUsers.push(this.state.allUsers[i].playerIds);
			}
		}
		console.log(addedUsers);
		
		fetch('https://onesignal.com/api/v1/notifications', {  
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				"Authorization": "Basic NzliM2FkMzItYmViNy00ZmFkLTg1MTUtNjk1MTllNGFjNGQ2"
			},
			body: JSON.stringify({
				app_id: "1198e53e-f4a9-4d2d-abe2-fec727b94e11",
				include_player_ids: addedUsers,
				
				/*data: {
					
					'nfType': 'nf_gotoPost',
					'postName':  this.props.postName, 
					'downloadUrl': this.props.downloadUrl, 
					'shoutTitle': this.props.shoutTitle, 
					'userName': this.props.userName, 
					'date': this.props.date, 
					'voiceTitle': this.props.voiceTitle, 
					'groupName': this.props.groupName,
					'groupKey': this.props.groupKey,
					'groupCreator': this.props.groupCreator,
				},*/
				headings:{"en": "Mention"},
				contents: {'en':  this.props.fullName + ' mentioned you.'},
			})
		})
		this.setState({
			comment: '',
			isUploading: false,
			thumbnail: null,
		})
	}
	onUpload() {
		this.setState({
			//comment: '',
			isUploading: true,
		})
	}
	
	renderRow(row){
        let item = row.item;
		let rowId = row.index;
		var userId = firebaseApp.auth().currentUser.uid;
		var locked;
		firebaseApp.database().ref('posts').child(this.props.navigation.state.params.groupName).child(this.props.navigation.state.params.postName).child('commentUsers').child(item.key).on('value', (snap) =>{
			if(snap != undefined && snap.val() != undefined && snap.val().locked != undefined)
				locked = snap.val().locked;
		})
        return(
			<View style={{backgroundColor: 'whitesmoke', marginHorizontal: 10, marginBottom: 10, paddingVertical: 5, zIndex: 0, minHeight: 70, justifyContent: 'center'}}>
				<View style={{flexDirection: 'row', alignItems: 'center', justifyContent:'space-between'}}>
					<View style={{ }}>
						<Text style={{fontSize: 14, color: 'black'}}>{item.FullName}</Text>
						<Text style={{fontSize: 10, color: 'grey', marginLeft: 10}}>{item.commentTime}</Text>
					</View>
					<View style={{flexDirection: 'row'}}>
						<View style={{width:  100, height: item.userId == userId ? 60 : 30, zIndex: 10, backgroundColor: 'lightgrey', display: this.state.showCommentMenu == rowId ? null : 'none', marginBottom: -60, paddingHorizontal: 10, justifyContent: 'center'}}>
							<TouchableOpacity style={{width: 80, height: 25, flexDirection: 'row', alignItems: 'center', borderBottomColor: 'black', borderBottomWidth: 1, display: item.userId == userId ? null : 'none'}}
								onPress = {() => {
									Alert.alert(
										'Confirm',
										'Delete this post?',
										[
											{text: 'Yes', onPress: () => {
												
												if(item.commentPhoto != undefined)
													firebaseApp.storage().ref('comment').child(item.commentFile).delete()
												if(item.recordName != undefined)
													firebaseApp.storage().ref('records').child(item.recordName).delete()
                    							firebaseApp.database().ref('posts/').child(this.props.navigation.state.params.groupName).child(this.props.navigation.state.params.postName).child('commentUsers').child(item.key).remove();
											}},
											{text: 'No',  },
										],
										{ cancelable: false }
									)
								}}>
								<ImageBackground source={require('../images/dustbin.png')} style={{ height: 24, width: 24}}/>
								<Text style={{marginLeft: 10}}>Delete</Text>
							</TouchableOpacity>

							
							<TouchableOpacity style={{width: 80, height: 25, flexDirection: 'row', alignItems: 'center', }}
								onPress = {() => {
									this.setState({isUploading: true});
									RNFetchBlob.fetch('GET', item.commentPhoto).then((res) => {
										this.setState({
											isUploading: false,
											showCommentMenu: undefined,
										});
										let shareOptions = {
											title: "Shared by Shout",
											message: item.comment + '\n',
											url: 'data:image/png;base64,' + res.base64(),
											subject: "Shared by Shout" //  for email
										};
										Share.open(shareOptions);
									})
									/*
									if(item.commentTitle != undefined) {
										RNFetchBlob.fetch('GET', item.comment).then((res) => {
											this.setState({
												isUploading: false,
												showCommentMenu: undefined,
											});
											let shareOptions = {
												title: "Shared by Shout",
												message: item.commentTitle + '\n',
												url: 'data:audio/aac;base64,' + res.base64(),
												subject: "Shared by Shout" //  for email
											};
											Share.open(shareOptions);
										})
									} else if(item.commentPhoto != undefined) {
										RNFetchBlob.fetch('GET', item.commentPhoto).then((res) => {
											this.setState({
												isUploading: false,
												showCommentMenu: undefined,
											});
											let shareOptions = {
												title: "Shared by Shout",
												message: item.comment + '\n',
												url: 'data:image/png;base64,' + res.base64(),
												subject: "Shared by Shout" //  for email
											};
											Share.open(shareOptions);
										})
									} else {
										this.setState({
											isUploading: false,
											showCommentMenu: undefined,
										});
										let shareOptions = {
											title: "Shared by Shout",
											message: item.comment,
											//url: 'data:audio/aac;base64,' + res.base64(),
											subject: "Shared by Shout" //  for email
										};
										Share.open(shareOptions);
									}*/
								}}>
								<ImageBackground source={require('../images/_share.png')} style={{ height: 22, width: 22}}/>
								<Text style={{marginLeft: 10}}>Share</Text>
							</TouchableOpacity>
						</View>
						<Menu>
							<MenuTrigger style={{width: 24, }}>
								<ImageBackground source={require('../images/more.png')} style={{height: 24, width: 8, }}/>
							</MenuTrigger>
							<MenuOptions style = {{paddingHorizontal: 10,}}>
								<MenuOption style={{flexDirection: 'row', borderBottomColor: 'grey', borderBottomWidth: 1, display: item.userId == userId ? null : 'none'}} 
									onSelect={() => {
										Alert.alert(
											'Confirm',
											'Delete this post?',
											[
												{text: 'Yes', onPress: () => {
													
													if(item.commentPhoto != undefined)
														firebaseApp.storage().ref('comment').child(item.commentFile).delete()
													if(item.recordName != undefined)
														firebaseApp.storage().ref('records').child(item.recordName).delete()
													firebaseApp.database().ref('posts/').child(this.props.navigation.state.params.groupName).child(this.props.navigation.state.params.postName).child('commentUsers').child(item.key).remove();
												}},
												{text: 'No',  },
											],
											{ cancelable: false }
										)
									}} >
									<ImageBackground source={require('../images/dustbin.png')} style={{ height: 24, width: 24}}/>
									<Text style= {{marginLeft: 10}}>Delete</Text>
								</MenuOption>
								<MenuOption style={{flexDirection: 'row', borderBottomColor: 'grey', borderBottomWidth: 1, display: item.userId == userId ? null : 'none',}}
									onSelect={() => {
										firebaseApp.database().ref('posts/').child(this.props.navigation.state.params.groupName).child(this.props.navigation.state.params.postName).child('commentUsers').child(item.key).once('value', (snap) => {
											if(snap.val().locked == true) {
												firebaseApp.database().ref('posts/').child(this.props.navigation.state.params.groupName).child(this.props.navigation.state.params.postName).child('commentUsers').child(item.key).update({locked: false});
											} else {
												firebaseApp.database().ref('posts/').child(this.props.navigation.state.params.groupName).child(this.props.navigation.state.params.postName).child('commentUsers').child(item.key).update({locked: true});
											}
										})
									}} >
									<ImageBackground source={require('../images/locked.png')} style={{ height: 24, width: 24}}/>
									<Text style= {{marginLeft: 10, textDecorationLine: locked == true ? 'line-through' : 'none'}}>Lock</Text>
								</MenuOption>
								<MenuOption style={{flexDirection: 'row', }}
									disabled = {locked}
									onSelect={() => {
										new Promise((resolve, reject) => {

											if(item.commentTitle != undefined && item.commentPhoto == undefined) {
												resolve(1);
											} else if(item.commentPhoto != undefined && item.commentTitle == undefined) {
												resolve(2);
											} else if(item.commentPhoto == undefined && item.commentTitle == undefined) {
												resolve(3);

											}else if(item.commentPhoto != undefined && item.commentTitle != undefined) {
												Alert.alert(
													'Confirm',
													'What do you want to share?',
													[
														{text: 'Photo', onPress: () => {
															
															resolve(2);
														}},
														{text: 'Record', onPress: () => {
															resolve(1);
														}},
													],
													{ cancelable: true }
												)
												
											}
										})
										.then((shareType) => {

											this.setState({
												isUploading: true,
											});
											switch(shareType) {
												case 1:
													RNFetchBlob.fetch('GET', item.comment).then((res) => {
														this.setState({
															isUploading: false,
															showCommentMenu: undefined,
														});
														let shareOptions = {
															title: "Shared by Shout",
															message: item.commentTitle + '\n',
															url: 'data:audio/aac;base64,' + res.base64(),
															subject: "Shared by Shout" //  for email
														};
														Share.open(shareOptions);
													})
												case 2:
													RNFetchBlob.fetch('GET', item.commentPhoto).then((res) => {
														this.setState({
															isUploading: false,
															showCommentMenu: undefined,
														});
														let shareOptions = {
															title: "Shared by Shout",
															message: item.comment + '\n',
															url: 'data:image/png;base64,' + res.base64(),
															subject: "Shared by Shout" //  for email
														};
														Share.open(shareOptions);
													})
												case 3:
													let shareOptions = {
														title: "Shared by Shout",
														message: item.comment,
														//url: 'data:audio/aac;base64,' + res.base64(),
														subject: "Shared by Shout" //  for email
													};
													Share.open(shareOptions);
												default:
													this.setState({
														isUploading: false,
														showCommentMenu: undefined,
													});
											}
										})

									}} >
									<ImageBackground source={require('../images/_share.png')} style={{ height: 24, width: 24}}/>
									<Text style= {{marginLeft: 10, textDecorationLine: locked == true ? 'line-through' : 'none'}}>Share</Text>
								</MenuOption>
							</MenuOptions>
							</Menu>
							{/*
						<TouchableOpacity style={{marginTop: 5, width: 24, alignItems: 'center'}}
							onPress = {() => {
								if(this.state.showCommentMenu == rowId)
									this.setState({showCommentMenu : undefined});
								else
									this.setState({showCommentMenu : rowId});
							}}>
							<ImageBackground source={require('../images/more.png')} style={{height: 24, width: 8, }}/>
						</TouchableOpacity>
						*/}
					</View>
				</View>
				{
					item.recordName ?
						<View style={{justifyContent:'flex-start',marginBottom: 5}}>
							<Text style={{marginLeft: 30}}>{item.commentTitle != undefined ? '# ' + item.commentTitle : item.commentTitle}</Text>
							<TouchableOpacity style = {{paddingHorizontal: 30, height: 100, display: item.commentPhoto == undefined ? 'none' : null}}
								onPress = {() => {
									this.setState({
										focusedImage: item.commentPhoto
									})
									Image.getSize(this.state.focusedImage, (width, height) => {
										this.setState({
											isVisible: true,
											imageWidth: 250,
											imageHeight: 250 * height / width,
										})
									}, (error) => {
										this.setState({
											isVisible: true,
											imageWidth: 250,
											imageHeight: 250
										})
									});
								}}>
								<Image source={{uri: item.commentPhoto}} style={{flex: 1, }}/>
							</TouchableOpacity>
							<View style={{flexDirection: 'row', justifyContent:'center', alignItems:'center',marginBottom: 5}}>
								{
									rowId == this.state.playingRow ?
										<Text style={{fontSize: 16, color: 'black',}}>{(this.state.isPlaying == true) ? 'Stop' : 'Play'}</Text>
										:
										<Text style={{fontSize: 16, color: 'black',}}>Play</Text>
								}
								<TouchableOpacity style={{marginLeft: 10}} 
									onPress = {() => {
										this.setState({
											isAllPlaying: false,
										})
										if(rowId == this.state.playingRow && this.state.isPlaying == true)
										{
											RNAudioStreamer.pause();
											this.setState({
												isPlaying: false,
											})
											return;
										}

										RNAudioStreamer.setUrl(item.comment);
										RNAudioStreamer.play()
										
										this.setState({
											playingRow: rowId,
											isPlaying: true,
										})
								}}>
									<ImageBackground source={(rowId == this.state.playingRow && this.state.isPlaying == true) ? require('../images/stop-button.png') : require('../images/play-button.png')} style={{height: 22, width: 22}}/>	
								</TouchableOpacity>
							</View>
						</View>
					:
						<Hyperlink linkStyle={ { color: '#2980b9', fontSize: 16 } } onPress={ url => Linking.openURL(url) }>
							<Text style={{fontSize: 12, color: 'black', marginLeft: 10}}>{item.comment}</Text>
							<TouchableOpacity style = {{paddingHorizontal: 30, height: 100, display: item.commentPhoto == undefined ? 'none' : null, marginBottom: 5}}
								onPress = {() => {
									this.setState({
										focusedImage: item.commentPhoto
									})
									Image.getSize(this.state.focusedImage, (width, height) => {
										this.setState({
											isVisible: true,
											imageWidth: 250,
											imageHeight: 250 * height / width,
										})
									}, (error) => {
										this.setState({
											isVisible: true,
											imageWidth: 250,
											imageHeight: 250
										})
									});
								}}>
								<Image source={{uri: item.commentPhoto}} style={{flex: 1, }}/>
							</TouchableOpacity>
  						</Hyperlink>
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
	onLike = () =>{
		if(this.state.likeAvaialbe == false)
			return;
		var userId = firebaseApp.auth().currentUser.uid;
		firebaseApp.database().ref('/posts/').child(this.props.navigation.state.params.groupName).child(this.props.navigation.state.params.postName).child('likeUsers').push({
			userId,
		})
		var likes;
		firebaseApp.database().ref('/posts/').child(this.props.navigation.state.params.groupName).child(this.props.navigation.state.params.postName).child('likes').once('value')
		.then((snapshot) => {
			likes = snapshot.val();
			likes ++;
			firebaseApp.database().ref('/posts/').child(this.props.navigation.state.params.groupName).child(this.props.navigation.state.params.postName).update({
				likes: likes,
			})
			ToastAndroid.show('You have liked this Shout!', ToastAndroid.SHORT);
		})
		.catch((error) => {
		})

		var d = new Date();
		firebaseApp.database().ref('users').child(userId).update({
			lastActivity: d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear(),
		})
		firebaseApp.database().ref('/posts/').child(this.props.navigation.state.params.groupName).child(this.props.navigation.state.params.postName).once('value', (snap) => {
			var postOwner = snap.val().userId;
			firebaseApp.database().ref('/users/').child(postOwner).child('likes').once('value', (snap) => {
				var likes = snap.val();
				likes ++;
				firebaseApp.database().ref('/users/').child(postOwner).update({
					likes
				})
			})
			ToastAndroid.show('You have liked this Shout!', ToastAndroid.SHORT);
		})
	}

	_onChangeText = (text) => {
		this.setState({comment: text}, () => {
			console.log(this.state.comment);
		});
	}

	render() {
        const { navigate } = this.props.navigation;
        const { state } = this.props.navigation;
        const backAction = NavigationActions.back({
			key: null
		})
		const { height} = this.state;
		let newStyle = {
			height
		}
        const config = {
            velocityThreshold: 0.3,
            directionalOffsetThreshold: 80
        };
		const options = {
			title: '',
			storageOptions: {
			  skipBackup: true,
			  path: 'images'
			}
		};
		return (
			<GestureRecognizer 
				style={styles.container}
				config={config}
				onSwipeRight={() => this.onSwipeRight()}
			>
				<Spinner visible={this.state.isUploading} textContent={"Uploading..."} textStyle={{color: '#FFF'}} />
				<View style={{height: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5, marginHorizontal: 20}} >
					<TouchableOpacity
						style={{height: 40, width: 40, alignItems: 'center', justifyContent: 'center'}}
						onPress = {() => {
							RNAudioStreamer.pause();
							this.props.navigation.dispatch(backAction);
					}}>
						<ImageBackground source={require('../images/backbtn.png')} style={{height: 20, width: 20}}/>	
					</TouchableOpacity>
					<Text style = {{fontSize: 32, backgroundColor: 'transparent', color: 'black', }}>Shout!</Text>
				</View>
				<View style={{backgroundColor: 'whitesmoke', height: 60, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between'}}>
					<View>
						<Text numberOfLines={1} style={{fontSize: 18}}>{state.params.shoutTitle}</Text>
						<Text style={{fontSize: 12, color: 'darkgray', }}>{state.params.userName}, {state.params.date}</Text>
					</View>
					<View>
						<View style = {{flexDirection: 'row', alignItems: 'center', }}>
							<TouchableOpacity style={{}} disabled = {!this.state.likeAvaialbe}
								onPress = {this.onLike}>
								{
								this.state.likeAvaialbe ?
									<ImageBackground source={require('../images/heart.png')} style={{height: 24, width: 24}}/>
									:
									<ImageBackground source={require('../images/heartdisabled.png')} style={{height: 24, width: 24}}/>
								}
							</TouchableOpacity>
							{
							this.props.navigation.state.params.voiceTitle != undefined ?
							<TouchableOpacity style={{marginLeft: 10}} 
								onPress = {() => {
									this.setState({
										isAllPlaying: false,
									})
									if(this.state.playingRow == undefined && this.state.isPlaying == true)
									{
										RNAudioStreamer.pause();
										this.setState({
											isPlaying: false,
										})
										return;
									}

									RNAudioStreamer.setUrl(this.props.navigation.state.params.voiceTitle);
									RNAudioStreamer.play()
									
									this.setState({
										playingRow: undefined,
										isPlaying: true,
									})
								}}>
								<ImageBackground source={(this.state.isPlaying == true && this.state.playingRow == undefined) ? require('../images/stop-button.png') : require('../images/play-button.png')} style={{height: 22, width: 22}}/>
							</TouchableOpacity>
							:
							null
							}
						<TouchableOpacity style={{marginLeft: 10, display: this.state.allRecords.length == 0 ? 'none' : null}}
							onPress = {() => {
								this.setState({
									playingRow: undefined,
									isPlaying: false,
								})
								if(this.state.isAllPlaying == false) {
									if(this.state.allRecords.length != 0)
									{
										RNAudioStreamer.setUrl(this.state.allRecords[0]);
										RNAudioStreamer.play()
									}
									
									this.setState({
										isAllPlaying: true,
									})
								} else {
									RNAudioStreamer.pause();
									this.setState({
										isAllPlaying: false,
									})
								}
								
							}}>
							<ImageBackground source={this.state.isAllPlaying == false ? require('../images/play-all.png') : require('../images/stop-all.png')} style={{height: 24, width: 26, }}/>
						</TouchableOpacity>
						</View>
						<TouchableOpacity style={{marginTop: 5, alignSelf:'flex-end', display: this.state.isMyPost == true ? null : 'none', width: 24, alignItems: 'center'}}
							onPress = {() => {
								this.setState({showMenu: !this.state.showMenu})
								
							}}>
							<ImageBackground source={require('../images/more.png')} style={{height: 24, width: 8, }}/>
						</TouchableOpacity>
					</View>
				</View>
				<TouchableOpacity style={{width: 100, height: 50, backgroundColor: 'lightgrey', marginBottom: -50, zIndex: 10, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', display: this.state.showMenu == false ? 'none': null}}
					onPress = {() => {
						Alert.alert(
							'Confirm',
							'Delete this post?',
							[
								{text: 'Yes', onPress: () => {
									
									firebaseApp.storage().ref('images').child(state.params.postName + '.jpg').delete()
									.then(() => {
									})
									.catch(() => {
									});
									firebaseApp.storage().ref('records').child(state.params.postName + '.aac').delete()
									.then(() => {
									})
									.catch(() => {
									});
											
									var promises = [];
									firebaseApp.database().ref('posts/').child(state.params.groupName).child(state.params.postName).child('commentUsers').on('value', (snap) => {
										snap.forEach((child) => {
											promises.push(new Promise((resolve, reject) => {
												firebaseApp.storage().ref('records').child(child.val().recordName).delete()
												.then(() => {
													resolve();
												})
												.catch(() => {
													reject();
												});
											}));
											promises.push(new Promise((resolve, reject) => {
												firebaseApp.storage().ref('comment').child(child.val().commentFile).delete()
												.then(() => {
													resolve();
												})
												.catch(() => {
													reject();
												});
											}));
										})
										Promise.all(promises).then(() => {
											firebaseApp.database().ref('posts/').child(state.params.groupName).child(state.params.postName).remove();
											this.props.navigation.dispatch(backAction);
										})
										.catch(() => {
											firebaseApp.database().ref('posts/').child(state.params.groupName).child(state.params.postName).remove();
											this.props.navigation.dispatch(backAction);
										})
									})
								}},
								{text: 'No',  },
							],
							{ cancelable: false }
						)
					}}>
					<ImageBackground source={require('../images/dustbin.png')} style={{ height: 24, width: 24}}/>
					<Text>Delete</Text>
				</TouchableOpacity>
				<View style={{backgroundColor: 'black', flex: 1 , display: state.params.downloadUrl == undefined ? 'none' : null}}>
					
					<TouchableOpacity
						activeOpacity={1}
						style={{flex: 1, zIndex: 0, display: state.params.downloadUrl == undefined ? 'none' : null}}
						onPressIn = {() => {
							this.setState({
								isLike: true,
							})
							setTimeout(() => {
								this.setState({
									isLike: false,
								}) 
							}, 500);
						}}
						onPressOut = {() => {
							if(this.state.isLike) {
								this.setState({
									focusedImage: state.params.downloadUrl
								})
								Image.getSize(this.state.focusedImage, (width, height) => {
									this.setState({
										isVisible: true,
										imageWidth: 250,
										imageHeight: 250 * height / width,
									})
								}, (error) => {
									this.setState({
										isVisible: true,
										imageWidth: 250,
										imageHeight: 250
									})
								});
							} else {
								this.onLike();
							}
						}}>
						<ImageBackground source={{uri: state.params.downloadUrl}} style={{flex: 1, display: state.params.downloadUrl == undefined ? 'none' : null}}/>
					</TouchableOpacity>
				</View>
				<View style = {{flex: 1, marginTop: 10, zIndex: 0}}>
					<FlatList
						data={this.state.dataSource}
						renderItem={this.renderRow}
						extraData={this.state}
						keyExtractor={item => item.postName}
					/>
				</View>
				{
					this.state.allUsers.length != 0 &&
						<AutoComplete style={{}} users={this.state.allUsers} onChangeText={this._onChangeText} value={this.state.comment}/>
				}
				<View style={{height:60, flexDirection: 'row', alignItems: 'center', justifyContent:'space-between', marginTop: 5, backgroundColor: 'lightgrey', paddingHorizontal: 15, zIndex: 0}}>
					<TouchableOpacity style={{}}
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
									console.log(response);
									let rotation = 0;
									if ( response.originalRotation === 90 && response.uri.indexOf('com.socialcommunityapp.provider') > 0) {
										rotation = 90
									}
									ImageResizer.createResizedImage(response.uri, 1024, 1024, 'JPEG', 100, rotation)
									.then(({uri}) => {
											this.setState({
											thumbnail: uri
										})
									}).catch((err) => {
										this.setState({
											thumbnail: null,
										})
									});
								}
							});	
						}}>
						<ImageBackground source={require('../images/photo-camera.png')} style={{height: 32, width: 32, }}/>
					</TouchableOpacity>
					{
						/*
						this.state.allUsers.length != 0 &&
						<AutoComplete style={[styles.input,]} users={this.state.allUsers} onChangeText={this._onChangeText} value={this.state.comment}/>
						*/
					}
					<AudioPlayer
						onUpload = {this.onUpload}
						onComment = {this.onComment}
						thumbnail = {this.state.thumbnail}
						postName =  { this.props.navigation.state.params.postName }
						downloadUrl = { this.props.navigation.state.params.downloadUrl}
						shoutTitle = { this.props.navigation.state.params.shoutTitle }
						userName = { this.props.navigation.state.params.userName }
						date = { this.props.navigation.state.params.date }
						voiceTitle = { this.props.navigation.state.params.voiceTitle }
						groupName = { this.props.navigation.state.params.groupName } 
						groupKey = {this.props.navigation.state.params.groupKey}
						groupCreator = { this.props.navigation.state.params.groupCreator }
						lastModified = { this.props.navigation.state.params.lastModified }
						comment = {this.state.comment}
						myName = {this.props.fullName}/>
				</View>
				<ImageView
					source={{uri: this.state.focusedImage}}
					imageWidth={this.state.imageWidth}
					imageHeight={this.state.imageHeight}
					isVisible={this.state.isVisible}
					onClose={this.onImageClose}
				/>
			</GestureRecognizer>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'aliceblue',
	},
	input: {
		backgroundColor: 'silver',
		paddingHorizontal:10,
		fontSize: 16,
		alignItems: 'center',
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

function mapStateToProps(state) {
	return {
	  recording: state.getAppInfo.recording,
	  fullName: state.getUserInfo.fullName,
	  isLoggedIn: state.getAppInfo.isLoggedIn,
	};
}

export default connect(mapStateToProps)(Comment)