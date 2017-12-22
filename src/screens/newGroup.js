import React, { Component } from 'react';
import {
	StyleSheet, View,TouchableOpacity, Text, TextInput, Image, KeyboardAvoidingView, ToastAndroid, AlertAndroid,
} from 'react-native';
import { NavigationActions } from 'react-navigation';
import RadioForm, {RadioButton, RadioButtonInput, RadioButtonLabel} from 'react-native-simple-radio-button';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import Spinner 		from 'react-native-loading-spinner-overlay';
import { firebaseApp } 		from '../firebase'

class NewGroup extends Component {
	constructor(props) {
        super(props);

        this.state = {
            privacy: [{label: 'Public', value: 'public'}, {label: 'Private', value: 'private'},],
            value: 0,
            valueIndex: 0,
            groupName: '',
            isUploading: false,
        }
	}

	static navigationOptions = {
		header: null
	};

	componentDidMount() {
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
        var date = new Date();
        var groupName = 'group' + 
            date.getUTCFullYear().toString() + '_' +
            this.addZero(date.getUTCMonth()) +	 '_' +
            this.addZero(date.getUTCDate()) + '_' +
            this.addZero(date.getUTCHours()) + '_' +
            this.addZero(date.getUTCMinutes()) + '_' +
            this.addZero(date.getUTCSeconds()) + '_' +
            this.addZero(date.getUTCMilliseconds());
            if(this.state.value == 'private') {
                var userId = firebaseApp.auth().currentUser.uid;
                firebaseApp.database().ref().child('groups').child(groupName).child('privacy').push({
                    userId
                });
            }
            firebaseApp.database().ref().child('groups').child(groupName).update({
                groupName: this.state.groupName,
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
					<Text style = {{fontSize: 32, backgroundColor: 'transparent', color: 'black', }}>Adding New Group</Text>
				</View>
                    <Text style = {[styles.text, style={marginTop: 20}]}>Group details</Text>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: 50, marginTop: 10}}>
                        <Text style = {{fontSize: 18, backgroundColor: 'transparent', color: 'black', fontWeight: 'bold'}}>Name</Text>
						<TextInput
						    style={[styles.detail_input, style={marginLeft: 50}]}
							placeholder=''
							autoCapitalize={'none'}
							returnKeyType={'done'}
							autoCorrect={false}
							placeholderTextColor='dimgray'
                            underlineColorAndroid='transparent'
                            maxLength={15}
                            onChangeText={(text) => this.setState({ groupName: text })}
                            value={this.state.groupName}/>
                    </View>
                    
                    <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: 50, marginTop: 10}}>
                        <Text style = {{fontSize: 18, backgroundColor: 'transparent', color: 'black', fontWeight: 'bold'}}>Privacy</Text>
                        <View style={{marginLeft: 30}}>
                            <RadioForm formHorizontal={true} animation={true} >
                            {this.state.privacy.map((obj, i) => {
                                var onPress = (value, index) => {
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
                    <Text style = {styles.text}>Users details</Text>
                    <View style={{flexDirection: 'row', marginTop: 20, marginHorizontal: 20, alignItems: 'center'}}>
                        <TextInput
                            style={styles.input}
                            placeholder='Search for a user to add to this group'
                            autoCapitalize={'none'}
                            returnKeyType={'done'}
                            autoCorrect={false}
                            placeholderTextColor='grey'
                            underlineColorAndroid='transparent'>
                        </TextInput>
                        <Image source={require('../images/search.png')} style={{width: 24, height: 24, marginLeft: -32, marginRight: 8}}/>
                    </View>

                    <Text style = {{fontSize: 18, backgroundColor: 'transparent', color: 'black', marginLeft: 20, marginTop: 20}}>People in this group</Text>
                    <View style={{flex: 1, justifyContent: 'flex-end', marginBottom: 30}}>
                    <View style = {{justifyContent: 'flex-start', alignItems:'center', }}>
                        <TouchableOpacity
                            style={{flexDirection: 'row', alignItems: 'center'}}
                            onPress = {() => {
                                if(this.state.groupName == '')
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
                            <Image source={require('../images/newGroup.png')} style={{width: 24, height: 24, }}/>
                            <Text style = {{fontSize: 22, backgroundColor: 'transparent', color: 'black', marginLeft: 10}}>Create Group</Text>
                        </TouchableOpacity>
                    </View>
                    </View>
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

export default NewGroup;