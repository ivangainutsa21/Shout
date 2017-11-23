import React, { Component } from 'react';
import {
	StyleSheet, View,TouchableOpacity, Text, ImageBackground, Image,
} from 'react-native';
import { NavigationActions } 	from 'react-navigation';
import ImagePicker 				from 'react-native-image-picker';
import RNFetchBlob 				from 'react-native-fetch-blob'

import { firebaseApp } 		from '../firebase'
import srcLoginBackground 	from '../images/postbackground.png';
import srcAddPost 			from '../images/addpost.png';

export default class Settings extends Component {
	static navigationOptions = {
		header: null
	};

	render() {
		const { navigate } = this.props.navigation;
		const backAction = NavigationActions.back({
			key: null,
		})

		return (
			<ImageBackground style={styles.container} source={srcLoginBackground}>
				<View style={{flex: 1, justifyContent: 'flex-start',}} >
					<View style={{alignItems: 'flex-start'}} >
						<TouchableOpacity style={{marginTop: 30, marginLeft: 30}} 
							onPress = {() => {
								this.props.navigation.dispatch(backAction);
							}}>
							<Image source={require('../images/backbtn.png')} style={{height: 40, width: 40}}/>	
						</TouchableOpacity>
					</View>
					<View style={{alignItems: 'flex-end'}} >
						<Text style = {{fontSize: 48, backgroundColor: 'transparent', color: 'black', marginRight: 20}}>Settings</Text>
					</View>
				</View>
				<View style={{flex: 1, justifyContent: 'center', paddingHorizontal: 30}}>
					<View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30}}>
						<Text style = {{fontSize: 40, backgroundColor: 'transparent', color: 'black', marginRight: 20}}>Notifications</Text>
						<Text style = {{fontSize: 20, backgroundColor: 'transparent', color: 'black', marginRight: 20}}>Enabled</Text>
					</View>
					<View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',}}>
						<Text style = {{fontSize: 24, backgroundColor: 'transparent', color: 'black', marginRight: 20}}>Posts</Text>
						<Text style = {{fontSize: 18, backgroundColor: 'transparent', color: 'black', marginRight: 20}}>Enabled</Text>
					</View>
					<View style={{flexDirection: 'row', justifyContent: 'space-between',alignItems: 'flex-end'}}>
						<Text style = {{fontSize: 24, backgroundColor: 'transparent', color: 'black', marginRight: 20}}>Comments</Text>
						<Text style = {{fontSize: 18, backgroundColor: 'transparent', color: 'black', marginRight: 20}}>Enabled</Text>
					</View>
				</View>
				<View style={{flex: 1, alignItems:'center', justifyContent: 'center'}}>
					<Text style = {{fontSize: 18, backgroundColor: 'transparent', color: 'grey', marginRight: 20}}>Powered By Talents Essence</Text>
				</View>
			</ImageBackground>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white',
		width: null,
	},
});
