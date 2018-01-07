/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity
} from 'react-native';
import AutoComplete from './components/AutoComplete';

const users = ['abcd', 'defg', 'abfg', 'decd ffw', 'sergey awef', 'denis', 'evgeny'];

export default class App extends Component<{}> {

  constructor(props) {
    super(props);
    this.state = {
      text: '',
      addedUsers: []
    }
  }

  _onChangeText = (text) => {
    this.setState({text});
  }

  _onPress = () => {
    var addedUsers = [];
    for (var i = 0; i < users.length; i++) {
      let key = "@" + users[i];
      if (this.state.text.indexOf(key) != -1) {
        addedUsers.push(users[i]);
      }
    }
    this.setState({addedUsers});
  }

  render() {
    return (
      <View style={styles.container}>
        <AutoComplete users={users} onChangeText={this._onChangeText} style={{ width: 200, height: 40 }}
        />
        <TouchableOpacity onPress={this._onPress}>
          <Text>Press me!</Text>
        </TouchableOpacity>
        <Text>{this.state.addedUsers}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
