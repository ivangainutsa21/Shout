import React, { Component } from 'react';
import Dimensions from 'Dimensions';
import {
	StyleSheet, View,TouchableOpacity, Text, ImageBackground,
} from 'react-native';

import { firebaseApp } from '../firebase'
import srcLoginBackground from '../images/LoginBackground.png';
import store from '../store'

export default class SideMenu extends Component {

	constructor(props) {
		super(props);
		this.state = {
			fullName: '',
			email: '',
		};
	}

	componentDidMount() {
		/*
		var userId = firebaseApp.auth().currentUser.uid;
		var userName;
		firebaseApp.database().ref('/users/').child(userId).child('FullName').once('value')
		.then((snapshot) => {
			this.setState({
				fullName: snapshot.val(),
			})
		})
		.catch((error) => {
		})
		*/
		this.setState({
			email: firebaseApp.auth().currentUser.email,
			fullName: store.getState().getUserInfo.fullName,
		})
	}
	render() {
        const { navigate } = this.props.navigation;
		return (
			<ImageBackground style={styles.container} source={srcLoginBackground}>
				<View style={{flex: 3, justifyContent: 'flex-end', alignItems: 'center', borderBottomColor: 'lightgrey', borderBottomWidth: 1}}>
                    <Text style={{backgroundColor: 'transparent', marginBottom: 15}}>{this.state.fullName}</Text>
                    <Text style={{backgroundColor: 'transparent', marginBottom: 20}}>{this.state.email}</Text>
                </View>
                <View style={{flex: 1, justifyContent:'space-between', alignItems: 'center', paddingTop: 30}}>
                    <TouchableOpacity 
                        onPress = {() => {
                            this.props.navigation.navigate('DrawerClose');
                            setTimeout(() => {
                                navigate('userProfile');
                            }, 200);
                        }}>
                        <Text style = {{fontSize : 32, fontWeight: 'bold'}}>My Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress = {() => {
                            this.props.navigation.navigate('DrawerClose');
                            setTimeout(() => {
                                navigate('settings');
                            }, 200);
                        }}>
                        {/*<Text style = {{fontSize : 32, fontWeight: 'bold'}}>Settings</Text>*/}
                    </TouchableOpacity>
                </View>
                <View style={{flex: 2, justifyContent: 'center', alignItems: 'center'}}>
                    <Text>Powered By Talents Essence</Text>
                </View>
			</ImageBackground>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		width: null,
		backgroundColor: 'white',
	},
});
