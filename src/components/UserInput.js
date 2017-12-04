import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Dimensions from 'Dimensions';
import {
	StyleSheet,
	View,
	TextInput,
	ImageBackground,
} from 'react-native';

export default class UserInput extends Component {
	render() {
		return (
			<View style={styles.inputWrapper}>
				{/*<ImageBackground source={this.props.source}
					style={styles.inlineImg} />*/}
				<TextInput style={styles.input}
					placeholder={this.props.placeholder}
					secureTextEntry={this.props.secureTextEntry}
					autoCorrect={this.props.autoCorrect}
					autoCapitalize={this.props.autoCapitalize}
					returnKeyType={this.props.returnKeyType}
					onFocus = {this.props.onFocus}
					onChangeText = {this.props.onChangeText}
					value = {this.props.value}
					placeholderTextColor='black'
					underlineColorAndroid='transparent' />
			</View>
		);
	}
}

UserInput.propTypes = {
	//source: PropTypes.number.isRequired,
	placeholder: PropTypes.string.isRequired,
	secureTextEntry: PropTypes.bool,
	autoCorrect: PropTypes.bool,
	autoCapitalize: PropTypes.string,
	returnKeyType: PropTypes.string,
};

const DEVICE_WIDTH = Dimensions.get('window').width;
const DEVICE_HEIGHT = Dimensions.get('window').height;

const styles = StyleSheet.create({
	input: {
		backgroundColor: 'transparent',
		width: DEVICE_WIDTH - 40,
		marginHorizontal: 20,
		paddingLeft: 10,
		fontSize: 24,
		color: 'black',
		borderBottomColor: 'darkgrey',
		borderBottomWidth: 1,
	},
	inlineImg: {
		position: 'absolute',
		zIndex: 99,
		width: 22,
		height: 22,
		left: 35,
		top: 9,
	},
});
