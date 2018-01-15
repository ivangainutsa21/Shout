import React, { Component } from 'react';
import {
    StyleSheet, View,TouchableOpacity, Text, TextInput, Image, KeyboardAvoidingView, 
    ToastAndroid, AlertAndroid, ListView, Alert, Keyboard
} from 'react-native';
import { NavigationActions } from 'react-navigation';
import RadioForm, {RadioButton, RadioButtonInput, RadioButtonLabel} from 'react-native-simple-radio-button';

import Spinner 		from 'react-native-loading-spinner-overlay';
import { firebaseApp } 		from '../firebase'
import { connect } from "react-redux";

class NewGroup extends Component {
	constructor(props) {
        super(props);
        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

        this.state = {
            dataSource: ds.cloneWithRows([]),
            dsAllMembers: ds.cloneWithRows([]),
            allMembers: [],
            privacy: [{label: 'Public', value: 'public'}, {label: 'Private', value: 'private'}, {label: 'Domain', value: 'domain'}],
            value: this.props.navigation.state.params.privacy,
            valueIndex: this.props.navigation.state.params.privacy == 'public' ? 0 : 1,
            groupName: this.props.navigation.state.params.groupName,
            isUploading: false,
            allEmails: [],
            invitatedUsers: [],
            isKeyboard: false,
            groupUsers: [],
            allDomains: [],
            domain: ''
        }
        this.onChangeSearch = this.onChangeSearch.bind(this);
        this.renderRow = this.renderRow.bind(this);
        this.renderMember = this.renderMember.bind(this);
        this.createNewGroup = this.createNewGroup.bind(this);
	}

	static navigationOptions = {
		header: null
	};

    componentWillMount () {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow);
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide);
      }
      componentWillUnmount () {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
      }
      keyboardDidShow  = ()=> {
        this.setState({isKeyboard: true})
      }
    
    keyboardDidHide = () => {
        this.setState({isKeyboard: false})
    }
	componentDidMount() {
        var allEmails = [];
        var allDomains = [];
        var myEmail = firebaseApp.auth().currentUser.email;
        var domain = myEmail.slice(myEmail.indexOf('@'));
        this.setState({domain});
        firebaseApp.database().ref('users/').on('value', (snap) => {
            snap.forEach((child) => {
                allEmails.push({
                    email: child.val().email,
                    name: child.val().FullName,
                    userId: child.key,
                })
                var email = child.val().email;
                if(email != undefined && email.slice(email.indexOf('@')) == domain){
                    allDomains.push({
                        email: child.val().email,
                        name: child.val().FullName,
                        userId: child.key,
                    })
                }
            })
            this.setState({
                allEmails: allEmails,
                allDomains: allDomains,
            })

            this.setState({
                dataSource: this.state.dataSource.cloneWithRows(allEmails)
            });
        })
        if(this.props.navigation.state.params.isEdit == true)
        {
            firebaseApp.database().ref('groups/').child(this.props.navigation.state.params.groupKey).child('privacy').once('value', (snap) => {
                var promises = [];
                var allMembers = [];
                snap.forEach((child) =>{
                    promises.push(new Promise((resolve, reject) => {
                        firebaseApp.database().ref('users/').child(child.val().userId).on('value', (snap) => {
                            allMembers.push({
                                member: snap.val().FullName + ' is a member',
                            })
                            resolve();
                        })
                    }))
                })
                Promise.all(promises).then(() => {
                    firebaseApp.database().ref('groups/').child(this.props.navigation.state.params.groupKey).child('pending').once('value', (snap) => {
                        snap.forEach((child) =>{
                            allMembers.push({
                                member: child.val().name + ' is pending',
                            })
                        })
                        this.setState({
                            allMembers,
                            dsAllMembers: this.state.dsAllMembers.cloneWithRows(allMembers)
                        });
                    })
                })
            })
        }
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
            if(this.state.invitatedUsers.length == 0) {
                this.setState({
                    isUploading: false,
                })
                this.props.navigation.goBack();
            }

            this.state.invitatedUsers.forEach((invitatedUser) => {
                promises.push(new Promise((resolve, reject) => {
                    firebaseApp.database().ref().child('groups').child(this.props.navigation.state.params.groupKey).child('pending').child(invitatedUser.userId).set({
                        name: invitatedUser.name
                    })
                    firebaseApp.database().ref().child('users').child(invitatedUser.userId).child('pendingRequests').child(this.props.navigation.state.params.groupKey).update({
                        groupName: this.state.groupName,
                        playerIds: this.props.playerIds,
                        userName: this.props.fullName,
                    })
                    .then(() => {
                        firebaseApp.database().ref().child('users').child(invitatedUser.userId).child('playerIds').on(('value'), (snap) => {
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
            var promises = [];
            var groupName = 'group' + 
                date.getUTCFullYear().toString() + '_' +
                this.addZero(date.getUTCMonth()) +	 '_' +
                this.addZero(date.getUTCDate()) + '_' +
                this.addZero(date.getUTCHours()) + '_' +
                this.addZero(date.getUTCMinutes()) + '_' +
                this.addZero(date.getUTCSeconds()) + '_' +
                this.addZero(date.getUTCMilliseconds());

            var userId = firebaseApp.auth().currentUser.uid;

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
                this.props.navigation.goBack();
            })
            .catch(() => {
            })
            
            if(this.state.value == 'private') {
                firebaseApp.database().ref().child('groups').child(groupName).child('privacy').push({
                    userId
                });
                this.state.invitatedUsers.forEach((invitatedUser) => {
                    firebaseApp.database().ref().child('groups').child(groupName).child('pending').child(invitatedUser.userId).set({
                        name: invitatedUser.name
                    })
                    firebaseApp.database().ref().child('users').child(invitatedUser.userId).child('pendingRequests').child(groupName).update({
                        groupName: this.state.groupName,
                        playerIds: this.props.playerIds,
                        userName: this.props.fullName,
                    })
                    .then(() => {
                        firebaseApp.database().ref().child('users').child(invitatedUser.userId).child('playerIds').once(('value'), (snap) => {
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
                    .catch(() => {
                    })
                })
            } else if(this.state.value == 'domain') {
                firebaseApp.database().ref().child('groups').child(groupName).child('privacy').push({
                    userId
                });
                firebaseApp.database().ref().child('groups').child(groupName).update({
                    domain: this.state.domain
                });
                this.state.allDomains.forEach((domain) => {
                    if(domain.userId != userId) {
                        firebaseApp.database().ref().child('users').child(domain.userId).child('pendingRequests').child(groupName).update({
                            groupName: this.state.groupName,
                            playerIds: this.props.playerIds,
                            userName: this.props.fullName,
                        })
                        .then(() => {
                            firebaseApp.database().ref().child('users').child(domain.userId).child('playerIds').once(('value'), (snap) => {
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
                        .catch(() => {
                        })
                    }
                })

            }

            
        }
    }
    onChangeSearch(text) {
        var searchResult = [];
        //var allEmails = this.state.allEmails;
        this.state.allEmails.forEach((field) => {
            var email = field.email;
            if(email != undefined && email.indexOf(text) > -1)
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
                                    invitatedUsers: [...this.state.invitatedUsers, { userId: item.userId, name: item.name}],
                                })
                                var allMembers = [...this.state.allMembers];
                                allMembers.push({
                                    member: 'Invite ' + item.name,
                                })
                                this.setState({
                                    allMembers,
                                    dsAllMembers: this.state.dsAllMembers.cloneWithRows(allMembers)
                                });
                            }},
                            {text: 'No',  },
                        ],
                        { cancelable: false }
                        
                    )

                }}>
                <Text style={{fontSize: 14}}>{item.name }</Text>
                </TouchableOpacity>
        </View>
        );
    }


    renderMember(item, sectionId, rowId){
        return(
            <View style={{marginTop: 5, }}>
                <TouchableOpacity 
                    style={{borderBottomColor: 'black', borderBottomWidth: 1, marginHorizontal: 10}}
                    onPress = {() => {
                       
                    }}
                >
                <Text style={{fontSize: 14}}>{item.member}</Text>
                </TouchableOpacity>
        </View>
        );
    }
	render() {
        const { navigate } = this.props.navigation;
        const userId = firebaseApp.auth().currentUser.uid;
        
		return (
			<View style={styles.container}>
                <Spinner visible={this.state.isUploading} textContent={"Creating a group..."} textStyle={{color: '#FFF'}} />

				<View style={{height: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems:'center', marginTop: 5, marginHorizontal: 20, display: this.state.isKeyboard == true ? 'none' : null}} >
					<TouchableOpacity
						style={{height: 40, width: 40, alignItems: 'center', justifyContent: 'center'}}
						onPress = {() => {
							this.props.navigation.goBack();
					    }}>
						<Image source={require('../images/backbtn.png')} style={{height: 20, width: 20}}/>	
					</TouchableOpacity>
					<Text style = {{fontSize: 32, backgroundColor: 'transparent', color: 'black', }}>{this.props.navigation.state.params.title}</Text>
				</View>
                    <Text style = {[styles.text, style={marginTop: 10}]}>Group details</Text>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: 30, marginTop: 10}}>
                        <Text style = {{fontSize: 18, backgroundColor: 'transparent', color: 'black', }}>Name</Text>
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
                                <Text style = {{marginLeft: 50, fontSize: 18}}>{this.props.navigation.state.params.groupName}</Text>
                        }
                    </View>
                    
                    <Text style = {{fontSize: 18, backgroundColor: 'transparent', color: 'black', marginLeft: 30, marginVertical: 10}}>Is this group for public or private</Text>
                    <View style={{alignSelf: 'center'}}>
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
                <View style={{flex: 0.7, marginTop: 10, display: this.state.isKeyboard == true ? 'none' : null}}>
                    <View style={{flex: 1, display: this.state.value == 'private' ? null: 'none'}}>
                        <Text style = {styles.text}>Members</Text>
                        <View style={{flex: 1, marginHorizontal: 20, marginTop: 10, borderColor: 'black', borderWidth: 1, borderRadius: 10}}>
                            <ListView
                                style = {{flex: 1}}
                                dataSource={this.state.dsAllMembers}
                                renderRow={this.renderMember}
                                enableEmptySections={true}
                            />
                        </View>
                    </View>
                </View>
                <View style={{flex: 1, marginTop: 10,}}>
                    <View style={{flex: 1, display: this.state.value == 'private' ? null: 'none'}}>
                        <Text style = {styles.text}>Adding Users</Text>
                        <Text style = {{fontSize: 18, backgroundColor: 'transparent', color: 'black', marginLeft: 20, marginTop: 10}}>Invite Users</Text>

                        <View style={{flexDirection: 'row', marginTop: 10, marginHorizontal: 20, alignItems: 'center'}}>
                            <TextInput
                                style={[styles.input, style={height: 40}]}
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
                </View>
                <View style={{flexDirection: 'row', alignItems: 'center', alignSelf: 'center', height:60, display: this.state.isKeyboard == true ? 'none' : null}}>
                    <TouchableOpacity
                        style={{flexDirection: 'row', alignItems: 'center', }}
                        onPress = {() => {
                            if(this.state.groupName == undefined)
                                return;
                            this.setState({
                                isUploading: true,
                            })
                            if(this.props.navigation.state.params.isEdit != true) {
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
                        <Image source={this.props.navigation.state.params.isEdit == true ? require('../images/update.png') : require('../images/newGroup.png')} style={{width: 22, height: 22, }}/>
                        <Text style = {{fontSize: 18, backgroundColor: 'transparent', color: 'black', marginLeft: 10}}>{this.props.navigation.state.params.isEdit == true ? 'Update Group' : 'Create Group'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{flexDirection: 'row', alignItems: 'center', display: (this.props.navigation.state.params.groupCreator == userId || this.props.navigation.state.params.isEdit != true) ? 'none' : null}}
                        onPress = {() => {
                            Alert.alert(
                                'Confirm',
                                'Leave this group?',
                                [
                                    {text: 'Yes', onPress: () => {
                                        firebaseApp.database().ref('groups').child(this.props.navigation.state.params.groupKey).child('privacy').on('value', (snap) =>{
                                            snap.forEach((child) => {
                                                if(child.val().userId == userId) {
                                                    firebaseApp.database().ref('groups').child(this.props.navigation.state.params.groupKey).child('privacy').child(child.key).remove()
                                                    this.props.navigation.goBack();
                                                }
                                            })
                                        })
                                    }},
                                    {text: 'No',  },
                                ],
                                { cancelable: false }
                            )
                        }}>
                        <Text style = {{fontSize: 18, backgroundColor: 'transparent', color: 'black', marginLeft: 20}}>Leave group</Text>
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