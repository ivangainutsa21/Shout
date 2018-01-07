import React, { Component } from 'react';
import {
    StyleSheet, View,TouchableOpacity, Text, TextInput, ImageBackground, 
    Image, DeviceEventEmitter, BackHandler, Alert, FlatList, Modal
} from 'react-native';
import RNAudioStreamer from 'react-native-audio-streamer';
import { firebaseApp }      from '../firebase'
import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';

export default class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: [],

            isPlaying: false,
			playingRow: undefined,
			showMore: false,
			isAllPlaying: false,
            allRecords: [],
            shoutCount: 0,
            isGroupMember: false,
            displayModal: false,
			currentRecord: 0,
        };
        this.renderRow = this.renderRow.bind(this);
        this.subscription = DeviceEventEmitter.addListener('RNAudioStreamerStatusChanged',this._statusChanged.bind(this));
    }
    onSwipeRight(gestureState) {
        this.props.navigation.goBack();
    }

    onSwipeUp(gestureState) {
        RNAudioStreamer.pause();
        this.setState({
            playingRow: undefined,
            isAllPlaying: false,
            currentRecord: 0,
            displayModal: false,
        })
    }
    _statusChanged(status) {
		if(status == 'FINISHED') {
			if(this.state.isAllPlaying == true) {
                var currentRecord = this.state.currentRecord;
                currentRecord ++;
				if(currentRecord < this.state.allRecords.length)
				{
                    this.setState({
                        currentRecord: currentRecord,
                    })
					RNAudioStreamer.setUrl(this.state.allRecords[currentRecord]);
					RNAudioStreamer.play()
				} else {
					this.setState({
                        playingRow: undefined,
						isAllPlaying: false,
					})
				}
            } else {
                this.setState({
                    playingRow: undefined,
                    isPlaying: false,
                })
            }
		}
	}

    static navigationOptions = {
        header: null
    };

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.onBackPress.bind(this));
    }
    
    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.onBackPress.bind(this));
        firebaseApp.database().ref().child('posts').child(this.props.navigation.state.params.groupName).on('value', (snap) => {
            var workshops = [];
            snap.forEach((child) => {
				var allRecords = [];
				firebaseApp.database().ref('/posts/').child(this.props.navigation.state.params.groupName).child(child.key).child('commentUsers').on('value', (snap) => {
					snap.forEach((child) => {
						if(child.val().recordName != undefined){
							allRecords.push(child.val().comment);
						}
					});
					workshops.push({
						downloadUrl: child.val().downloadUrl,
						userName: child.val().userName,
						shoutTitle: child.val().shoutTitle,
						comments: child.val().comments,
						likes: child.val().likes,
						date: child.val().date,
						voiceTitle: child.val().voiceTitle,
						groupCreator: child.val().groupCreator,
						lastModified: child.val().lastModified,
						allRecords: allRecords,
						postName: child.key,
					});
				})
                
            });
            
            workshops.sort(function(a, b){
                if(a.lastModified != undefined && b.lastModified == undefined) return -1;
                if(a.lastModified == undefined && b.lastModified != undefined) return 1;
                if(a.lastModified == undefined && b.lastModified == undefined) return 0;
                if(a.lastModified < b.lastModified) return 1;
                if(a.lastModified > b.lastModified) return -1;
                return 0;
            });

            this.setState({
                shoutCount: workshops.length,
                dataSource: workshops,
            });
        });
        var userId = firebaseApp.auth().currentUser.uid;
        firebaseApp.database().ref().child('groups').child(this.props.navigation.state.params.groupKey).child('privacy').on('value', (snap) => {
            snap.forEach((child) => {
                if(child.val().userId == userId) {
                    this.setState({
                        isGroupMember: true
                    })
                }
            })            
        })
    }
    onBackPress() {
        let refreshFunc = this.props.navigation.state.params.refresh;
            if(typeof refreshFunc == 'function')
                refreshFunc();
        RNAudioStreamer.pause();
    }
    
    renderRow = (row) => {
        let item = row.item;
        let rowId = row.index;
        return(
            <View style={{backgroundColor: 'whitesmoke', paddingVertical: 10, marginTop: 10}}>
                <TouchableOpacity
                    onPress = {() => {
                        if(item.postName != null){
                            RNAudioStreamer.pause();
                            this.props.navigation.navigate('comment', {
                                postName: item.postName, 
                                downloadUrl: item.downloadUrl, 
                                shoutTitle: item.shoutTitle, 
                                userName: item.userName, 
                                date: item.date, 
                                voiceTitle: item.voiceTitle,
                                lastModified: item.lastModified,
                                groupName: this.props.navigation.state.params.groupName,
                                groupKey: this.props.navigation.state.params.groupKey,
                            });
                        }
                    }}>
                <Text style={{fontSize: 12,}}>{item.userName}{/*, {item.date}*/}</Text>
                <View style={{flexDirection: 'row'}}>
                    <TouchableOpacity style={{display: item.downloadUrl == null ? 'none' : null}} 
                        activeOpacity={1}
                        onPress = {() => {
                            if(item.postName != null){
                                RNAudioStreamer.pause();
                                this.props.navigation.navigate('comment', {
                                    postName: item.postName, 
                                    downloadUrl: item.downloadUrl, 
                                    shoutTitle: item.shoutTitle, 
                                    userName: item.userName, 
                                    date: item.date, 
                                    voiceTitle: item.voiceTitle,
                                    lastModified: item.lastModified,
                                    groupName: this.props.navigation.state.params.groupName,
                                    groupKey: this.props.navigation.state.params.groupKey,
                                });
                            }
                        }}>
                        <View style = {{}}>
                            <View style={{backgroundColor: 'black', height: 80, width: 120}}>
                                <Image source={{uri: item.downloadUrl}} style={{flex: 1, }}/>
                            </View>
                        </View>
                    </TouchableOpacity>
                    <View style={{justifyContent: 'center', backgroundColor: 'whitesmoke', marginLeft: 10, flex: 1}}>
                        <Text numberOfLines={1} style={{fontSize: 18, width: 150}}>{item.shoutTitle}</Text>
                        <View style={{height: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }}>
							<View style={{flexDirection: 'row',}}>
                            <Image source={require('../images/comment.png')} style={{width: 18, height: 18,}}/>
                            <Text style={{fontSize: 12, color: 'darkgray', marginLeft: 5}}>{item.comments}</Text>
                            <Image source={require('../images/like.png')} style={{width: 18, height: 18, marginLeft: 10}}/>
                            <Text style={{fontSize: 12, color: 'darkgray', marginLeft: 5}}>{item.likes}</Text>
                            <TouchableOpacity style={item.voiceTitle == undefined ? {marginLeft: 10, display: 'none'} : {marginLeft: 10, }}
                                onPress = {() => {
									this.setState({
										isAllPlaying: false,
									})
                                    if(rowId == this.state.playingRow && this.state.isPlaying == true)
                                    {
                                        RNAudioStreamer.pause();
                                        this.setState({isPlaying: false,});
                                        return;
                                    }

                                    RNAudioStreamer.setUrl(item.voiceTitle);
                                    RNAudioStreamer.play()

                                    this.setState({
                                        playingRow: rowId,
                                        isPlaying: true,
                                    })
                                }}>
                                <Image source={(rowId == this.state.playingRow && this.state.isPlaying == true) ? require('../images/stop-button.png') : require('../images/play-button.png')} style={{height: 22, width: 22}}/>    
                            </TouchableOpacity>
							</View>
							<TouchableOpacity style={{marginRight: 10, paddingHorizontal: 5, display: (item.allRecords && item.allRecords.length > 0) ? null : 'none'}}
								onPress = {() => {
									this.setState({
                                        displayModal: true,
										isPlaying: false,
									})

                                    if(rowId == this.state.playingRow && this.state.isAllPlaying == true)
                                    {
                                        RNAudioStreamer.pause();
                                        this.setState({isAllPlaying: false,});
                                        return;
									}
									this.setState({
                                        playingRow: rowId,
										isAllPlaying: true,
                                        allRecords: item.allRecords,
                                        currentRecord: 0,
									})
									RNAudioStreamer.setUrl(item.allRecords[0]);
									RNAudioStreamer.play()
								}}>
								<Image source={(rowId == this.state.playingRow && this.state.isAllPlaying == true) ? require('../images/stop-all.png') : require('../images/play-all.png')} style={{height: 24, width: 26, }}/>
							</TouchableOpacity>
                        </View>
                    </View>
                </View>
                </TouchableOpacity>
            </View>
        );
    }

    render() {
        const { navigate } = this.props.navigation;
        const userId = firebaseApp.auth().currentUser.uid;
        const config = {
            velocityThreshold: 0.3,
            directionalOffsetThreshold: 80
        };
        const menuHeight = this.props.navigation.state.params.groupCreator == userId ? 110 : 55;
        return (
            <GestureRecognizer 
                style={styles.container}
                config={config}
                onSwipeRight={() => this.onSwipeRight()}
                onSwipeUp={() => this.onSwipeUp()}>
                <View style={{height: 80, flexDirection: 'row', justifyContent: 'space-between', alignItems:'center', marginHorizontal: 20}} >
                    <Text style = {{fontSize: 32, backgroundColor: 'transparent', color: 'black',}}>{this.props.navigation.state.params.groupName}</Text>
                    <TouchableOpacity style={{display: this.state.isGroupMember == true ? null : 'none', width: 24, alignItems: 'center'}} 
                        onPress = {() => {
							this.setState({
								showMore: !this.state.showMore
							})
                    }}>
                        <Image source={require('../images/more.png')} style={{height: 30, width: 10}}/>
                    </TouchableOpacity>
                    
                </View>
				<View style={{height: 40, backgroundColor: 'darkgrey', paddingHorizontal: 10, flexDirection: 'row', /*justifyContent:'space-between'*/justifyContent: 'flex-end', alignItems: 'center'}}>
					<TouchableOpacity 
                        style={{flexDirection: 'row', alignItems: 'center', justifyContent:'center', display: 'none'}}
                        onPress = {() => {
                            //this.props.navigation.navigate('newGroup', {title: 'Edit Group', groupName: this.props.navigation.state.params.groupName, privacy: 'private', isEdit: true, groupKey: this.props.navigation.state.params.groupKey});
                        }}>
                        <ImageBackground source={require('../images/category.png')} style={{ height: 18, width: 18}}/>
                        <Text style={{marginLeft: 10}}>All</Text>
					</TouchableOpacity>

					<View style={{flexDirection: 'row', flex: 0.8, marginHorizontal: 20, alignItems: 'center', display: 'none'}}>
						<TextInput
							style={styles.input}
							placeholder='email address'
							autoCapitalize={'none'}
							returnKeyType={'done'}
							autoCorrect={false}
							placeholderTextColor='grey'
							underlineColorAndroid='transparent'
							>
						</TextInput>
						<Image source={require('../images/search.png')} style={{width: 24, height: 24, marginLeft: -32, marginRight: 8}}/>
					</View>
					<Text style={{}}>{this.state.shoutCount} Shouts</Text>
				</View>
                <View style = {{flex: 1, backgroundColor: 'white', paddingHorizontal: 10}}>
					<View style={{backgroundColor: 'lightgrey', height: menuHeight, width: 110, alignSelf: 'flex-end', marginBottom: -110,  paddingHorizontal: 5, zIndex: 10, display: this.state.showMore == false ? 'none' : null, paddingVertical: 5}}>
						<TouchableOpacity style={{width: 100, height: 50, flexDirection: 'row', alignItems: 'center', justifyContent:'center', }}
							onPress = {() => {
                                this.setState({
                                    showMore: false,
                                })
								this.props.navigation.navigate('newGroup', {title: 'Edit Group', groupName: this.props.navigation.state.params.groupName, privacy: 'private', isEdit: true, groupKey: this.props.navigation.state.params.groupKey, groupCreator: this.props.navigation.state.params.groupCreator});
						}}>
						    <ImageBackground source={require('../images/edit.png')} style={{ height: 24, width: 24}}/>
						    <Text style={{marginLeft: 10}}>Edit</Text>
						</TouchableOpacity>
						<TouchableOpacity style={{width: 100, height: 50, flexDirection: 'row', alignItems: 'center', justifyContent:'center', display: this.props.navigation.state.params.groupCreator == userId ? null : 'none', borderTopColor: 'black', borderTopWidth: 1}}
							onPress = {() => {
								Alert.alert(
									'Confirm',
									'Delete this group?',
									[
										{text: 'Yes', onPress: () => {
                                            if(this.state.shoutCount == 0) {
                                                firebaseApp.database().ref('posts/').child(this.props.navigation.state.params.groupName).remove();
                                                firebaseApp.database().ref('groups/').child(this.props.navigation.state.params.groupKey).remove();
                                                this.props.navigation.goBack();
                                            } else {
											firebaseApp.database().ref('posts').child(this.props.navigation.state.params.groupName).on('value', (snap) => {
												snap.forEach((child) => {
													firebaseApp.storage().ref('images').child(child.key + '.jpg').delete()
													.then(() => {
													})
													.catch(() => {
													});
													firebaseApp.storage().ref('records').child(child.key + '.aac').delete()
													.then(() => {
													})
													.catch(() => {
													});
                                                    var promises = [];
													firebaseApp.database().ref('posts/').child(this.props.navigation.state.params.groupName).child(child.key).child('commentUsers').on('value', (snap) => {
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
                                                        })
														Promise.all(promises).then(() => {
															firebaseApp.database().ref('posts/').child(this.props.navigation.state.params.groupName).remove();
															firebaseApp.database().ref('groups/').child(this.props.navigation.state.params.groupKey).remove();
															this.props.navigation.goBack();
														}).catch(() =>{
															firebaseApp.database().ref('posts/').child(this.props.navigation.state.params.groupName).remove();
															firebaseApp.database().ref('groups/').child(this.props.navigation.state.params.groupKey).remove();
															this.props.navigation.goBack();
                                                        })
													})
												})
                                            })
                                        }
                                        }},
										{text: 'No',  },
									],
									{ cancelable: false }
								)
							}}>
							<ImageBackground source={require('../images/dustbin.png')} style={{ height: 24, width: 24}}/>
							<Text style={{marginLeft: 10}}>Delete</Text>
						</TouchableOpacity>
					</View>
                    <FlatList
						style = {{zIndex: 0}}
                        data={this.state.dataSource}
                        renderItem={this.renderRow}
                        extraData={this.state}
                        keyExtractor={item => item.postName}
                    />
    
                </View>
                <View style = {{backgroundColor:'transparent', flexDirection: 'row', justifyContent:'space-between', paddingHorizontal: 20, alignItems: 'center' , height:50, }}>
                    <TouchableOpacity
                        style = {{}}
                        onPress = {() => {
                            RNAudioStreamer.pause();
                            let refreshFunc = this.props.navigation.state.params.refresh;
                            
                            if(typeof refreshFunc == 'function')
                                refreshFunc();
                            this.props.navigation.goBack();
                        }}>
                        <Image source={require('../images/home.png')} style={{width: 32, height: 32,}}/>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style = {{}}
                        onPress = {() => {
                            navigate('notifications');
                        }}>
                        <Image source={require('../images/home_notification.png')} style={{width: 32, height: 32,}}/>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style = {{}}
                        onPress = {() => {
                            navigate('post', {groupName: this.props.navigation.state.params.groupName, groupKey: this.props.navigation.state.params.groupKey, groupCreator: this.props.navigation.state.params.groupCreator});
                        }}>
                        <Image source={require('../images/home_plus.png')} style={{width: 48, height: 48,}}/>
                    </TouchableOpacity>
                    <TouchableOpacity
                        disabled={true}
                        onPress = {() => {
                            //navigate('userProfile');
                        }}>
                        <Image source={require('../images/share.png')} style={{width: 32, height: 32,}}/>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style = {{}}
                        onPress = {() => {
                            navigate('userProfile');
                        }}>
                        <Image source={require('../images/home_user.png')} style={{width: 32, height: 32,}}/>
                    </TouchableOpacity>
                </View>
                <Modal
                    visible={this.state.displayModal}
                    transparent
                    animationType="slide"
                    onRequestClose={() => {}}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <View>
                                <Text style = {{color: 'white', alignSelf: 'center', fontSize: 36}}> Playing Now </Text>
                                <View style={{flexDirection: 'row', paddingHorizontal: 20, alignItems: 'center', justifyContent: 'space-between'}}>
                                    <TouchableOpacity
                                        style={{marginRight: 30}}
                                        onPress = {() => {
                                            var currentRecord = this.state.currentRecord;
                                            currentRecord --;
                                            if(currentRecord >= 0)
                                            {
                                                this.setState({
                                                    currentRecord: currentRecord,
                                                })
                                                RNAudioStreamer.setUrl(this.state.allRecords[currentRecord]);
                                                RNAudioStreamer.play()
                                            }
                                        }}>
                                        <Image source={require('../images/backward.png')} style={{width: 32, height: 32,}}/>
                                    </TouchableOpacity>
                                    <Text style = {{color: 'white', fontSize: 96}}>{this.state.allRecords.length}<Text style = {{color: 'white', fontSize: 48}}>/{this.state.currentRecord + 1}</Text></Text>
                                    <TouchableOpacity
                                        style={{marginLeft: 30}}
                                        onPress = {() => {
                                            var currentRecord = this.state.currentRecord;
                                            currentRecord ++;
                                            if(currentRecord < this.state.allRecords.length)
                                            {
                                                this.setState({
                                                    currentRecord: currentRecord,
                                                })
                                                RNAudioStreamer.setUrl(this.state.allRecords[currentRecord]);
                                                RNAudioStreamer.play()
                                            }
                                        }}>
                                        <Image source={require('../images/forward.png')} style={{width: 32, height: 32,}}/>
                                    </TouchableOpacity>
                                </View>
                                <Text style = {{color: 'white', alignSelf: 'center', fontSize: 14, marginTop: 20}}> Swipe up to cancel the player </Text>
                                {
                                    /*
                                <TouchableOpacity onPress={() => {this.onStopPress()}}>
                                    <Image style={styles.largeIcon} source={require('./images/stop.png')} />
                                    <Text style={styles.textCenter}>Stop</Text>
                                </TouchableOpacity>
                                
                                
                                <Text style={styles.textCenter}>{this.state.currentTime}s</Text>
                                */}
                            </View>
                        </View>
                    </View>
                </Modal>
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
        flex: 1,
        padding: 0,
        paddingVertical: 5,
        paddingLeft: 10,
        paddingRight: 40,
		fontSize: 18,
		height: 30,
		color: 'black',
        borderRadius: 10,
        borderColor: 'black',
        borderWidth: 1,
    },
	modalContainer: { 
		backgroundColor: 'rgba(0, 0, 0, 0.75)',
		position: 'relative',
		flex: 1,
		justifyContent: 'center',
	},
	modalContent: {
		flex: 1, 
		flexDirection: 'row', 
		justifyContent: 'center', 
		alignItems: 'center',
	},
	textCenter: {
		color: '#ddd', 
		fontSize: 18, 
		textAlign: 'center',
	},
	largeIcon: {
		width: 80, 
		height: 80,
	},
});