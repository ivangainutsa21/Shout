import React, { Component } from 'react';
import {
	StyleSheet, View,TouchableOpacity, Text, TextInput, Image, 
} from 'react-native';
import { NavigationActions } from 'react-navigation';

class HomeGroup extends Component {
	constructor(props) {
		super(props);
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
				<View style={{height: 60, flexDirection: 'row', justifyContent: 'space-between', marginTop: 5, marginHorizontal: 20}} >
					<TouchableOpacity style={{marginTop : 10}} 
						onPress = {() => {
							this.props.navigation.goBack();
					}}>
						<Image source={require('../images/backbtn.png')} style={{height: 40, width: 40}}/>	
					</TouchableOpacity>
					<Text style = {{fontSize: 40, backgroundColor: 'transparent', color: 'black', }}>Shout Groups</Text>
				</View>
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
                <Text style = {styles.text}>Shout Groups</Text>
                <View style={{flex: 1, marginTop: 40, }}>
                    <View style={{flexDirection: 'row', justifyContent:'space-between', marginHorizontal: 40}}>
                        <TouchableOpacity style={{marginTop : 10}} 
                            onPress = {() => {
                                //this.props.navigation.goBack();
                                navigate('newGroup');
                            }}>
                            <Image source={require('../images/addgroup.png')} style={{height: 100, width: 100}}/>
                        </TouchableOpacity>

                        <TouchableOpacity style={{marginTop : 10}} 
                            onPress = {() => {
                                //this.props.navigation.goBack();
                            }}>
                            <Image source={require('../images/addgroup.png')} style={{height: 100, width: 100}}/>
                        </TouchableOpacity>
                    </View>
                    <View style={{flexDirection: 'row', justifyContent:'space-between', marginHorizontal: 40, marginTop: 40}}>
                        <TouchableOpacity style={{marginTop : 10}} 
                            onPress = {() => {
                                //this.props.navigation.goBack();
                            }}>
                            <Image source={require('../images/addgroup.png')} style={{height: 100, width: 100}}/>
                        </TouchableOpacity>

                        <TouchableOpacity style={{marginTop : 10}} 
                            onPress = {() => {
                                //this.props.navigation.goBack();
                            }}>
                            <Image source={require('../images/addgroup.png')} style={{height: 100, width: 100}}/>
                        </TouchableOpacity>
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
    text: {
        fontSize: 24, 
        backgroundColor: 'transparent', 
        color: 'black',
        marginTop: 20,
        marginHorizontal: 20,
        borderBottomWidth: 1,
    }
});

export default HomeGroup;