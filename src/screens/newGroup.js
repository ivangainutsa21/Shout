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

class NewGroup extends Component {
	constructor(props) {
        super(props);
        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

        this.state = {
            dataSource: ds.cloneWithRows(['row 1', 'row 2']),

            privacy: [{label: 'Public', value: 'public'}, {label: 'Private', value: 'private'},],
            value: this.props.navigation.state.params.privacy,
            valueIndex: this.props.navigation.state.params.privacy == 'public' ? 0 : 1,
            groupName: this.props.navigation.state.params.groupName,
            isUploading: false,
            allEmails: [],
            invitatedUsers: [],
        }
        this.onChangeSearch = this.onChangeSearch.bind(this);
        this.renderRow = this.renderRow.bind(this);
        this.createNewGroup = this.createNewGroup.bind(this);
	}

	static navigationOptions = {
		header: null
	};

	componentDidMount() {
        
        var allEmails = [];
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(allEmails)
        });
        firebaseApp.database().ref('users/').on('value', (snap) => {
            snap.forEach((child) => {
                allEmails.push({
                    email: child.val().email,
                    name: child.val().FullName,
                    userId: child.key,
                    invitatedUsers: [],
                })
            })
            this.setState({
                allEmails: allEmails,
            })
        })
	}

	addZero = (i) =>{
		if(i < 10){
			i = '0' + i;
		}
		return i;
    }
    onPress() {
        
    }
    createNewGroup() {

        if(this.props.navigation.state.params.isEdit == true)
        {

            var date = new Date();
            var lastModified = date.getUTCFullYear().toString() + '_' +
            this.addZero(date.getUTCMonth()) +	 '_' +
            this.addZero(date.getUTCDate()) + '_' +
            this.addZero(date.getUTCHours()) + '_' +
            this.addZero(date.getUTCMinutes()) + '_' +
            this.addZero(date.getUTCSeconds()) + '_' +
            this.addZero(date.getUTCMilliseconds());
            firebaseApp.database().ref('groups').child(this.props.navigation.state.params.groupKey).update({
                lastModified: lastModified
            });
            var promises = [];
            this.state.invitatedUsers.forEach((invitatedUser) => {
                promises.push(new Promise((resolve, reject) => {
                    firebaseApp.database().ref().child('users').child(invitatedUser).child('pendingRequests').child(this.props.navigation.state.params.groupKey).update({
                        groupName: this.state.groupName,
                        playerIds: this.props.playerIds,
                        userName: this.props.fullName,
                    })
                    .then(() => {
                        firebaseApp.database().ref().child('users').child(invitatedUser).child('playerIds').on(('value'), (snap) => {
                            fetch('https://onesignal.com/api/v1/notifications', {  
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    "Authorization": "Basic NzliM2FkMzItYmViNy00ZmFkLTg1MTUtNjk1MTllNGFjNGQ2"
                                },
                                body: JSON.stringify({
                                    app_id: "1198e53e-f4a9-4d2d-abe2-fec727b94e11",
                                    include_player_ids: [snap.val()],
                                    data: {
                                        'nfType': 'nf_invitation',
                                    },
                                    headings:{"en": "Invitation"},
                                    contents: {'en': this.props.fullName + ' want to invite you to ' + this.state.groupName},
                                })
                            })
                        })
                        resolve()
                    })
                    .catch(() => {
                        reject();
                    })
                }))
            })
            Promise.all(promises)
            .then(() => {
                
                this.setState({
                    isUploading: false,
                })
                this.props.navigation.goBack();
            })
            .catch(() =>{
                this.setState({
                    isUploading: false,
                })
            })

        } else {
            var date = new Date();
            var groupName = 'group' + 
                date.getUTCFullYear().toString() + '_' +
                this.addZero(date.getUTCMonth()) +	 '_' +
                this.addZero(date.getUTCDate()) + '_' +
                this.addZero(date.getUTCHours()) + '_' +
                this.addZero(date.getUTCMinutes()) + '_' +
                this.addZero(date.getUTCSeconds()) + '_' +
                this.addZero(date.getUTCMilliseconds());

            var userId = firebaseApp.auth().currentUser.uid;
            if(this.state.value == 'private') {
                firebaseApp.database().ref().child('groups').child(groupName).child('privacy').push({
                    userId
                });
                this.state.invitatedUsers.forEach((invitatedUser) => {
                    new Promise((resolve, reject) => {
                        firebaseApp.database().ref().child('users').child(invitatedUser).child('pendingRequests').child(groupName).update({
                            groupName: this.state.groupName,
                            playerIds: this.props.playerIds,
                            userName: this.props.fullName,
                        })
                    })
                    .then(() => {
                        firebaseApp.database().ref().child('users').child(invitatedUser).child('playerIds').on(('value'), (snap) => {
                            fetch('https://onesignal.com/api/v1/notifications', {  
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    "Authorization": "Basic NzliM2FkMzItYmViNy00ZmFkLTg1MTUtNjk1MTllNGFjNGQ2"
                                },
                                body: JSON.stringify({
                                    app_id: "1198e53e-f4a9-4d2d-abe2-fec727b94e11",
                                    include_player_ids: [snap.val()],
                                    data: {
                                        'nfType': 'nf_invitation',
                                    },
                                    headings:{"en": "A new comment on your shout"},
                                    contents: {'en': this.props.fullName + ' want to invite you to ' + this.state.groupName},
                                })
                            })
                        })
                        
                    })
                })
            }

            var date = new Date();
            var lastModified = date.getUTCFullYear().toString() + '_' +
            this.addZero(date.getUTCMonth()) +	 '_' +
            this.addZero(date.getUTCDate()) + '_' +
            this.addZero(date.getUTCHours()) + '_' +
            this.addZero(date.getUTCMinutes()) + '_' +
            this.addZero(date.getUTCSeconds()) + '_' +
            this.addZero(date.getUTCMilliseconds());
            firebaseApp.database().ref().child('groups').child(groupName).update({
                groupName: this.state.groupName,
                groupCreator: userId,
                lastModified: lastModified
            })
            .then(() => {

                this.setState({
                    isUploading: false,
                })
                ToastAndroid.show(this.state.groupName + ' group has been successfully created', ToastAndroid.SHORT);
                this.props.navigation.goBack();
            })
            .catch(() => {
                ToastAndroid.show('Failed', ToastAndroid.SHORT);
                this.setState({
                    isUploading: false,
                })
            })
        }
    }
    onChangeSearch(text) {
        var searchResult = [];
        //var allEmails = this.state.allEmails;
        this.state.allEmails.forEach((field) => {
            var email = field.email;
            if(email.indexOf(text) > -1)
            {
                searchResult.push(field);
            }
            
        })
        console.log(searchResult);
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(searchResult)
        });
    }
    renderRow(item, sectionId, rowId){
        return(
            <View style={{marginTop: 5, }}>
                <TouchableOpacity 
                    style={{borderBottomColor: 'black', borderBottomWidth: 1, marginHorizontal: 10}}
                    onPress = {() => {
                        Alert.alert(
                        'Confirm',
                        'Are you sure you want to Inviate ' + item.name + '(' + item.email + ')' + 'to this group',
                        [
                            {text: 'Yes', onPress: () => {
                                this.setState({
                                    invitatedUsers: [...this.state.invitatedUsers, item.userId],
                                })
                            }},
                            {text: 'No',  },
                        ],
                        { cancelable: false }
                        
                    )

                }}>
                {/*<Image source={require('../images/addgroup.png')} style={{height: 100, width: 200, }}/>*/}
                <Text style={{fontSize: 14}}>{item.name + ' | ' + item.email}</Text>
                </TouchableOpacity>
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
					<Text style = {{fontSize: 32, backgroundColor: 'transparent', color: 'black', }}>{this.props.navigation.state.params.title}</Text>
				</View>
                    <Text style = {[styles.text, style={marginTop: 20}]}>Group details</Text>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: 50, marginTop: 10}}>
                        <Text style = {{fontSize: 18, backgroundColor: 'transparent', color: 'black', fontWeight: 'bold'}}>Name</Text>
                        {
                            this.props.navigation.state.params.groupName == undefined ?
                                <TextInput
                                    style={[styles.detail_input, style={marginLeft: 50}]}
                                    placeholder=''
                                    autoCapitalize={'none'}
                                    returnKeyType={'done'}
                                    autoCorrect={false}
                                    placeholderTextColor='dimgray'
                                    underlineColorAndroid='transparent'
                                    maxLength={15}
                                    onChangeText={(text) => this.setState({groupName: text})}
                                    value={this.state.groupName}/>
                            :
                                <Text style = {{marginLeft: 50, fontWeight: 'bold', fontSize: 18}}>{this.props.navigation.state.params.groupName}</Text>
                        }
                    </View>
                    
                    <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: 50, marginTop: 10}}>
                        <Text style = {{fontSize: 18, backgroundColor: 'transparent', color: 'black', fontWeight: 'bold'}}>Privacy</Text>
                        <View style={{marginLeft: 30}}>
                            <RadioForm 
                                formHorizontal={true} 
                                animation={true} 
                                accessible={false}
                            >
                            {this.state.privacy.map((obj, i) => {
                                var onPress = (value, index) => {
                                    if(this.props.navigation.state.params.isEdit == true)
                                    {
                                        this.setState({
                                            value: 'private',
                                            valueIndex: 1
                                        })
                                        return;
                                    }
                                    this.setState({
                                        value: value,
                                        valueIndex: index
                                    })
                                }
                                return (
                                <RadioButton labelHorizontal={true} key={i} >
                                    {/*  You can set RadioButtonLabel before RadioButtonInput */}
                                    <RadioButtonInput
                                    obj={obj}
                                    index={i}
                                    isSelected={this.state.valueIndex === i}
                                    onPress={onPress}
                                    buttonInnerColor={'#000'}
                                    buttonOuterColor={'#000'}
                                    buttonSize={10}
                                    buttonStyle={{}}
                                    buttonWrapStyle={{marginLeft: 10}}
                                    />
                                    <RadioButtonLabel
                                    style={{marginLeft: 10}}
                                    obj={obj}
                                    index={i}
                                    onPress={onPress}
                                    labelStyle={{color: '#000', marginLeft: 5}}
                                    labelWrapStyle={{}}
                                    />
                                </RadioButton>
                                )
                            })}
                            </RadioForm>
                        </View>
                    </View>
                <View style={{flex: 1, marginTop: 20}}>

                    <View style={{display: this.state.value == 'public' ? 'none' : null, flex: 1}}>
                        <Text style = {styles.text}>Adding Users</Text>
                        <Text style = {{fontSize: 18, backgroundColor: 'transparent', color: 'black', marginLeft: 20, marginTop: 20}}>Invite Users</Text>
                        <View style={{flexDirection: 'row', marginTop: 20, marginHorizontal: 20, alignItems: 'center'}}>
                            <TextInput
                                style={styles.input}
                                placeholder='email address'
                                autoCapitalize={'none'}
                                returnKeyType={'done'}
                                autoCorrect={false}
                                placeholderTextColor='grey'
                                underlineColorAndroid='transparent'
                                onChangeText={(text) => this.onChangeSearch(text)}
                                >
                            </TextInput>
                            <Image source={require('../images/search.png')} style={{width: 24, height: 24, marginLeft: -32, marginRight: 8}}/>
                        </View>
                        <View style={{flex: 1, marginHorizontal: 20, borderColor: 'black', borderWidth: 1, borderRadius: 10}}>
                            <ListView
                                style = {{flex: 1}}
                                dataSource={this.state.dataSource}
                                renderRow={this.renderRow}
                                enableEmptySections={true}
                            />
                        </View>
                    </View>
                    <TouchableOpacity
                        style={{flexDirection: 'row', alignItems: 'center', alignSelf: 'center', height: 60}}
                        onPress = {() => {
                            if(this.state.groupName == undefined)
                                return;
                            this.setState({
                                isUploading: true,
                            })
                            if(this.state.value == 'public') {
                                firebaseApp.database().ref().child('groups').once('value', (snap, b) => {
                                    
                                    var isAlready = false;
                                    snap.forEach((child) => {
                                        console.log(child.val().groupName);
                                        if(child.val().groupName == this.state.groupName)
                                        {
                                            this.setState({
                                                isUploading: false,
                                            })
                                            isAlready = true;
                                            alert('The group name already exist');
                                            return;
                                        }
                                    })
                                    if(isAlready == false)
                                        this.createNewGroup();
                                })
                            } else {
                                this.createNewGroup();
                            }

                        }}>
                        <Image source={this.props.navigation.state.params.isEdit == true ? require('../images/update.png') : require('../images/newGroup.png')} style={{width: 24, height: 24, }}/>
                        <Text style = {{fontSize: 22, backgroundColor: 'transparent', color: 'black', marginLeft: 10}}>{this.props.navigation.state.params.isEdit == true ? 'Update Group' : 'Create Group'}</Text>
                    </TouchableOpacity>
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
        fullName: state.getUserInfo.fullName,
	};
}

export default connect(mapStateToProps)(NewGroup);