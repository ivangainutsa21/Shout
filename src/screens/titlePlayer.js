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
import { connect } from 'react-redux';
import Sound from 'react-native-sound';
import {AudioRecorder, AudioUtils} from 'react-native-audio';

import RNFetchBlob 			    from 'react-native-fetch-blob'
import { firebaseApp } 		    from '../firebase';
import { saveTitleRecord }   from '../actions'

class TitlePlayer extends Component {
    state = {
      currentTime: 0.0,
      recording: false,
      stoppedRecording: false,
      finished: false,
      audioPath: AudioUtils.DocumentDirectoryPath + '/titleRecord.aac',
      hasPermission: undefined,
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

    async _play() {
      if (this.state.recording) {
        await this._stop();
      }

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

    addZero = (i) =>{
		if(i < 10){
			i = '0' + i;
		}
		return i;
    }
    
    render() {
        return (
            <TouchableOpacity
                style={{alignItems: 'center', justifyContent:'center', backgroundColor: 'red', width: 240, flex: 1, borderRadius: 10, marginTop: 5,}}
                onPressIn = {() => {
                    this._record()
                    Vibration.vibrate(100);
                }} 
                onPressOut = {() => {
                    setTimeout(() => {
						            this._stop();
                        this.props.dispatch(saveTitleRecord(this.state.audioPath));
                    }, 150);
                }}>
                <Image source={require('../images/microphone.png')} style={{ height: 32, width: 32}}/>
            </TouchableOpacity>
        );
    }
}

export default connect()(TitlePlayer);