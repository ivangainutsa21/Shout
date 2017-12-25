import React, { Component } from 'react';
import {
    StyleSheet, View,TouchableOpacity, Text, TextInput, Image, KeyboardAvoidingView, 
    ToastAndroid, AlertAndroid, ListView, Alert,
} from 'react-native';
import { NavigationActions } from 'react-navigation';
import RadioForm, {RadioButton, RadioButtonInput, RadioButtonLabel} from 'react-native-simple-radio-button';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import Spinner 		from 'react-native-loading-spinner-overlay';
import { firebaseApp } 		from '../firebase'
import { connect } from "react-redux";

class Notifications extends Component {
	constructor(props) {
        super(props);
        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

        this.state = {
            dataSource: ds.cloneWithRows(['row 1', 'row 2']),
            pendingRequests: [],
        }
        this.renderRow = this.renderRow.bind(this);
	}

	static navigationOptions = {
		header: null
	};

	componentDidMount() {
        var userId = firebaseApp.auth().currentUser.uid;
		firebaseApp.database().ref('users').child(userId).child('pendingRequests').on('value', (snap) => {
            var pendingRequests = [];
            snap.forEach((notification) => {
                pendingRequests.push({
                    groupKey: notification.key,
                    playerIds: notification.val().playerIds,
                    userName: notification.val().userName,
                    groupName: notification.val().groupName,
                });
            })

            this.setState({
                dataSource: this.state.dataSource.cloneWithRows(pendingRequests)
            });
        })
	}
    
    renderRow(item, sectionId, rowId){
        return(
            <View style={{marginTop: 5, flex: 1, flexDirection: 'row', alignItems: 'center', borderBottomColor: 'black', borderBottomWidth: 1, marginHorizontal: 10, paddingBottom: 5, marginTop: 10}}>
                <View style={{flex: 0.5}}> 
                    <Text style={{}}>{item.userName + ' wants to invitate you '+ item.groupName}</Text>
                </View>
                <View style={{flex: 0.5, flexDirection: 'row', justifyContent: 'center'}}>
                    <TouchableOpacity style = {{marginLeft: 10, backgroundColor: 'lightgrey'}}
                        onPress = {() => {
                            var userId = firebaseApp.auth().currentUser.uid;
                            firebaseApp.database().ref('groups').child(item.groupKey).child('privacy').push({
                                userId
                            })
                            firebaseApp.database().ref('users').child(userId).child('pendingRequests').child(item.groupKey).remove()
                        }} >
                        <Text style={{fontSize: 18, fontWeight: 'bold', paddingHorizontal: 10}}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style = {{marginLeft: 10, backgroundColor: 'lightgrey'}} 
                        onPress = {() => {
                            var userId = firebaseApp.auth().currentUser.uid;
                            firebaseApp.database().ref('users').child(userId).child('pendingRequests').child(item.groupKey).remove()
                        }} >
                        <Text style={{fontSize: 18, fontWeight: 'bold', paddingHorizontal: 10}}>Reject</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

	render() {
        const { navigate } = this.props.navigation;
        
		return (
			<View style={[styles.container, style = {marginHorizontal: 5,}]}>
                <Spinner visible={this.state.isUploading} textContent={"Creating a group..."} textStyle={{color: '#FFF'}} />
				<View style={{height: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems:'center', marginTop: 5, marginHorizontal: 20}} >
					<TouchableOpacity
						onPress = {() => {
							this.props.navigation.goBack();
					    }}>
						<Image source={require('../images/backbtn.png')} style={{height: 40, width: 40}}/>	
					</TouchableOpacity>
					<Text style = {{fontSize: 32, backgroundColor: 'transparent', color: 'black', }}>Group Requests</Text>
				</View>
                    
                    
                <View style={{flex: 1, marginTop: 20}}>
                    <ListView
                        dataSource={this.state.dataSource}
                        renderRow={this.renderRow}
                        enableEmptySections={true}
                    />
                </View>
                    
			</View>
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
		color: 'black',
        borderRadius: 5,
        borderColor: 'black',
        borderWidth: 1,
    },
	detail_input: {
		backgroundColor: 'transparent',
		width: 120,
		padding: 0,
		paddingHorizontal: 10,
		fontSize: 18,
		color: 'black',
		borderBottomColor: 'dimgray',
		borderBottomWidth: 1,
	},
    text: {
        fontSize: 24, 
        backgroundColor: 'transparent', 
        color: 'black',
        marginHorizontal: 20,
        borderBottomWidth: 1,
    }
});
function mapStateToProps(state) {
	return {
	    playerIds: state.getUserInfo.playerIds,
	};
}

export default connect(mapStateToProps)(Notifications);