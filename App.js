import React, { Component } from 'react';
import {
  StyleSheet, View, TouchableOpacity, Text,
} from 'react-native';
import { connect } from "react-redux";
import OneSignal from 'react-native-onesignal';

import { firebaseApp } from './src/firebase';
import RootNavigator from './src/screens/router';

import { registerPlayerIds, save_nf } from './src/actions'
import { NavigationActions } from 'react-navigation'

class App extends Component<{}> {

	constructor(props) {
		super(props);
		
    this.onIds = this.onIds.bind(this);
    this.onOpened = this.onOpened.bind(this);
	}
	
	componentWillMount() {
		OneSignal.addEventListener('opened', this.onOpened);
		OneSignal.addEventListener('ids', this.onIds);
		OneSignal.inFocusDisplaying(2);
  	}

    componentWillUnmount() {
			OneSignal.removeEventListener('opened', this.onOpened);
			OneSignal.removeEventListener('ids', this.onIds);
	}
    onIds(device) {
      	this.props.dispatch(registerPlayerIds(device.userId));
    }

    onOpened(openResult) {
		//setTimeout(() => {
			this.props.dispatch(save_nf(openResult.notification.payload.additionalData));
			if(firebaseApp.auth().currentUser == null)
				return;

			if(openResult.notification.payload.additionalData != undefined && openResult.notification.payload.additionalData.nfType ==  'nf_gotoPost') {
				let resetPost = NavigationActions.reset({
					index: 2,
					actions: [
					NavigationActions.navigate({ routeName: 'homeGroup'}),
					NavigationActions.navigate({ 
							routeName: 'home', 
							params:{
								groupName: openResult.notification.payload.additionalData.groupName, 
								groupKey: openResult.notification.payload.additionalData.groupKey,
								groupCreator: openResult.notification.payload.additionalData.groupCreator,
							}
						}),
					NavigationActions.navigate({
							routeName: 'comment', 
							params:{
								postName:  openResult.notification.payload.additionalData.postName, 
								downloadUrl: openResult.notification.payload.additionalData.downloadUrl, 
								shoutTitle: openResult.notification.payload.additionalData.shoutTitle, 
								userName: openResult.notification.payload.additionalData.userName, 
								date: openResult.notification.payload.additionalData.date, 
								voiceTitle: openResult.notification.payload.additionalData.voiceTitle,
								groupName: openResult.notification.payload.additionalData.groupName, 
								groupKey: openResult.notification.payload.additionalData.groupKey,
								groupCreator: openResult.notification.payload.additionalData.groupCreator,
							}
						}),
					]
				})
				this.navigator && this.navigator.dispatch(resetPost);
			}
			if(openResult.notification.payload.additionalData != undefined && openResult.notification.payload.additionalData.nfType ==  'nf_invitation'){
				let resetNotification = NavigationActions.reset({
					index: 1,
					actions: [
					  NavigationActions.navigate({ routeName: 'homeGroup'}),
					  NavigationActions.navigate({ 
							routeName: 'notifications',
						}),
					]
				})
				this.navigator && this.navigator.dispatch(resetNotification);
			}
		//}, 1000);
	}

	render() {
		return (
			<View style={styles.container}>
				<RootNavigator ref={nav => {this.navigator = nav; }}/>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F5FCFF',
	},
});

export default connect()(App);