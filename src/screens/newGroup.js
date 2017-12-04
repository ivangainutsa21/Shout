import React, { Component } from 'react';
import {
	StyleSheet, View,TouchableOpacity, Text, TextInput, Image, 
} from 'react-native';
import { NavigationActions } from 'react-navigation';
import RadioForm, {RadioButton, RadioButtonInput, RadioButtonLabel} from 'react-native-simple-radio-button';

class NewGroup extends Component {
	constructor(props) {
        super(props);

        this.state = {
            privacy: [{label: 'Public', value: 0}, {label: 'Private', value: 1},],
            value: 0,
            valueIndex: 0,
        }
	}

	static navigationOptions = {
		header: null
	};

	componentDidMount() {
	}

	render() {
        const { navigate } = this.props.navigation;
        
		return (
			<View style={[styles.container, style = {marginHorizontal: 5,}]}>
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
							placeholder='Group name'
							autoCapitalize={'none'}
							returnKeyType={'done'}
							autoCorrect={false}
							placeholderTextColor='dimgray'
							underlineColorAndroid='transparent'
							onChangeText={(text) => this.setState({ email: text })} />
                    </View>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: 50, marginTop: 10}}>
                        <Text style = {{fontSize: 18, backgroundColor: 'transparent', color: 'black', fontWeight: 'bold'}}>Hashtag</Text>
                        <TextInput
						    style={[styles.detail_input, style={marginLeft: 30}]}
							placeholder=''
							autoCapitalize={'none'}
							returnKeyType={'done'}
							autoCorrect={false}
							placeholderTextColor='dimgray'
							underlineColorAndroid='transparent'
							onChangeText={(text) => this.setState({ email: text })} />
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
                    <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: 50, marginTop: 10}}>
                        <Text style = {{fontSize: 18, backgroundColor: 'transparent', color: 'black', fontWeight: 'bold'}}>Image</Text>
                        <TouchableOpacity
                            onPress = {() => {
                            }}>
                            <Text style = {{fontSize: 18, backgroundColor: 'transparent', color: 'black', marginLeft: 50}}>Upload Image...</Text>
                        </TouchableOpacity>
                    </View>
                <View style={{flex: 1, marginTop: 20}}>
                    <Text style = {styles.text}>Users details</Text>
                    <View style={{flexDirection: 'row', marginTop: 20, marginHorizontal: 20, alignItems: 'center'}}>
                        <TextInput
                            style={styles.input}
                            placeholder='Write your shout title here...'
                            autoCapitalize={'none'}
                            returnKeyType={'done'}
                            autoCorrect={false}
                            placeholderTextColor='grey'
                            underlineColorAndroid='transparent'
                            onChangeText={(text) => this.setState({ shoutTitle: text })}>
                        </TextInput>
                        <Image source={require('../images/search.png')} style={{width: 24, height: 24, marginLeft: -32, marginRight: 8}}/>
                    </View>

                    <Text style = {{fontSize: 18, backgroundColor: 'transparent', color: 'black', marginLeft: 20, marginTop: 20}}>How's in this group</Text>
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