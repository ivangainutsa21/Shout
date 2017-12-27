import React, {Component} from 'react';

import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Platform,
    PermissionsAndroid,
    Image,
    Vibration,
    Alert,
} from 'react-native';
import { connect } from "react-redux";
import {AudioRecorder, AudioUtils} from 'react-native-audio';

import RNFetchBlob 			    from 'react-native-fetch-blob'
import { firebaseApp } 		    from '../firebase';
import { getRecordingStatus }   from '../actions'
import OneSignal 			from 'react-native-onesignal';

class AudioPlayer extends Component {
    state = {
      currentTime: 0.0,
      recording: false,
      stoppedRecording: false,
      finished: false,
      audioPath: AudioUtils.DocumentDirectoryPath + '/shoutRecord.aac',
      hasPermission: undefined,
      isPressed: true,
      comment: '',
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

    addZero = (i) => {
		if(i < 10){
			i = '0' + i;
		}
		return i;
    }
    
    render() {
        return (
            <TouchableOpacity
                style = {{backgroundColor:'royalblue',width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems:'center'}}
                onPressIn = {() => {
                    this._record()
                    this.props.dispatch(getRecordingStatus(true));
                    Vibration.vibrate(100);
                    
                    this.setState({
                        isPressed: true,
                    });
                    this.setState({
                        comment: this.props.comment,
                    })
                    setTimeout(() => {
                        this.setState({
                            isPressed: false,
                        }) 
                    }, 500);
                    
                }}
                onPressOut = {() => {
                    var commentType = -1;
                    if(this.state.isPressed) {
                        commentType = 1;
                    } else {
                        commentType = 2;
                    }

                    this.props.onUpload();
                    setTimeout(() => {
                        this.props.onComment();
                        this.props.dispatch(getRecordingStatus(false));
                        this._stop();
                        if(this.state.comment == '' && commentType == 1)
                        {
                            return;
                        }
                        var commentPromise;
                        var recordName = null;
                        commentPromise = new Promise((resolve, reject) => {
                            if(commentType == 2) {
                                var date = new Date();
                                recordName = 'record' + 
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
                                    resolve(url);
                                })
                                .catch((error) => {
                                    reject(error);
                                })
                            } else {
                                resolve(this.state.comment);
                            }
                        });
                        commentPromise.then((url) =>{
                            var userId = firebaseApp.auth().currentUser.uid;
                            var d = new Date();
                            var commentTime = d.toLocaleTimeString() + ' at '+ d.toDateString();
                            firebaseApp.database().ref('/posts/').child(this.props.groupName).child(this.props.postName).child('commentUsers').push({
                                userId: userId,
                                FullName: this.props.fullName,
                                comment: url,
                                commentTitle: (commentType == 2 && this.state.comment != '') ? this.state.comment : null,
                                commentTime: commentTime,
                                recordName: recordName,
                            })
                            .then(() => {
                                ToastAndroid.show('You have commented on this Shout!', ToastAndroid.SHORT);
                            })
                            .catch((error) => {
                            })
                            var comments;
                            firebaseApp.database().ref('/posts/').child(this.props.groupName).child(this.props.postName).child('comments').once('value')
                            .then((snapshot) => {
                                comments = snapshot.val();
                                comments ++;

                                var date = new Date();
                                var lastModified = date.getUTCFullYear().toString() + '_' +
                                this.addZero(date.getUTCMonth()) +	 '_' +
                                this.addZero(date.getUTCDate()) + '_' +
                                this.addZero(date.getUTCHours()) + '_' +
                                this.addZero(date.getUTCMinutes()) + '_' +
                                this.addZero(date.getUTCSeconds()) + '_' +
                                this.addZero(date.getUTCMilliseconds());
                                firebaseApp.database().ref('/posts/').child(this.props.groupName).child(this.props.postName).update({
                                    comments: comments,
                                    lastModified: lastModified,
                                })
                                .then(() => {
                                    firebaseApp.database().ref('groups').child(this.props.groupKey).update({
                                        lastModified: lastModified
                                    });
                                    
                                    if(this.props.fullName == this.props.userName)
                                        return;
                                    firebaseApp.database().ref().child('playerIds').on('value', (snap) => {
                                        snap.forEach((child) => {
                                            if(child.val().fullName == this.props.userName) {
                                                fetch('https://onesignal.com/api/v1/notifications', {  
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                        "Authorization": "Basic NzliM2FkMzItYmViNy00ZmFkLTg1MTUtNjk1MTllNGFjNGQ2"
                                                    },
                                                    body: JSON.stringify({
                                                        app_id: "1198e53e-f4a9-4d2d-abe2-fec727b94e11",
                                                        include_player_ids: [child.key],
                                                        data: {
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
                                                        },
                                                        headings:{"en": "Comment"},
                                                        contents: {'en':  this.state.comment != '' ? this.props.myName + ': ' + this.state.comment : this.props.myName + ': ' + 'said something'},
                                                    })
                                                })
                                            }
                                        });
                                    });
                                })
                            })
                            .catch((error) => {
                            })
                        })
                    }, 150);
                }}
                >
                <Image source={require('../images/recordshout.png')} style={{ height: 35, width: 35,}}/>
              </TouchableOpacity>
        );
    }
}

function mapStateToProps(state) {
	return {
      fullName: state.getUserInfo.fullName,
      playerIds: state.getUserInfo.playerIds,
	};
}

export default connect(mapStateToProps)(AudioPlayer);