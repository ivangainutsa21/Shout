import React from 'react';
import { TextInput, FlatList, View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';

var curIndex = 0;
class AutoComplete extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      text: '',
      listVisible: false,
      listDataSource: [],
			height: 40,
    }
  }

  componentDidMount() {
    this.users = [];
    for (var i = 0; i < this.props.users.length; i++) {
      this.users.push(this.props.users[i].name);
    }
  }

  _onChangeText = (text) => {
    this.setState({text});
    this.props.onChangeText(text);
    let index = text.lastIndexOf('@');
    curIndex = index;
    if (index != -1) {
      if (index == 0 || text[index - 1] == ' ') {
        const key = text.substring(index + 1);
        // console.log(nextStr);
        // const nextSpaceIndex = nextStr.indexOf(' ');
        // console.log(nextSpaceIndex);
        // if (nextSpaceIndex == -1) {
        //   nextSpaceIndex = nextStr.length;
        // }
        // const key = nextStr.substring(0, nextSpaceIndex);
        const listDataSource = this.users.filter((user) => {
          if (user.startsWith(key)) {
            return user;
          }
        })
        if (listDataSource.length != 0) {
          if (listDataSource.indexOf(key) == -1) {
            this.setState({listDataSource, listVisible: true});
          }
          else {
            this.setState({listVisible: false});
          }
        } else {
          this.setState({listVisible: false});
        }
      }
    } else {
      this.setState({listVisible: false});
    }
  }

  _renderItem = (item, index) => {
    return (
      <TouchableOpacity key={index} onPress={() => {
        let text = this.state.text;
        const key = text.substring(curIndex + 1);
        text = text.substring(0, text.length - key.length);
        text = text.concat(item);
        this.setState({text, listVisible: false});
        this.props.onChangeText(text);
      }}>
        <Text style={{ fontSize: 20 }}>{item}</Text>
      </TouchableOpacity>
    );
  }

	updateSize = (height) => {
		this.setState({
		  height
		});
	  }
  render() {
    let textStyle = { width: 200, height: 40, borderColor: 'black', borderWidth: 1, ... this.props.style }
		const { height} = this.state;
		let newStyle = {
			height
		  }
    return (
      <View style={{ justifyContent: 'center', alignSelf: 'center', zIndex: 10, marginBottom: -55}}>
      {
          this.state.listVisible && 
          <View style={{ backgroundColor: '#F5FCFF', borderColor: 'grey', borderWidth: 1, height: 150 }}>
            <FlatList
              data={this.state.listDataSource}
              renderItem={ ({item, index}) => this._renderItem(item, index)}
              extraData={this.state}
            />
          </View>
        }
        {/*
        <TextInput
          style={textStyle}
          onChangeText={this._onChangeText}
          value={this.state.text}
        />*/
        }
        {
          Platform.OS === 'ios' ?
            <AutoGrowTextInput //source={usernameImg}
              style={[styles.input, newStyle]}
              placeholder={'Write a comment...'/*this.props.recording*/}
              placeholderTextColor='grey'
              autoCapitalize={'none'}
              returnKeyType={'done'}
              autoCorrect={false}
              editable={true}
              multiline={true}
              underlineColorAndroid='transparent'
              onChangeText={this._onChangeText}
              value={this.state.text}
            />
          :
            <TextInput //source={usernameImg}
              style={[styles.input, newStyle]}
              placeholder={'Write a comment...'/*this.props.recording*/}
              placeholderTextColor='grey'
              autoCapitalize={'none'}
              returnKeyType={'done'}
              autoCorrect={false}
              editable={true}
              multiline={true}
              underlineColorAndroid='transparent'
              onChangeText={this._onChangeText}
              value={this.props.value} //{this.state.text}
              onContentSizeChange={(e) => this.updateSize(e.nativeEvent.contentSize.height)}
            />
        }
      </View>
    )
  }
}
const styles = StyleSheet.create({
	input: {
		backgroundColor: 'silver',
		paddingHorizontal:10,
		fontSize: 16,
		alignItems: 'center',
		color: 'black',
		width: 220,
		height: 40,
		borderRadius: 20,
	},
});

export default AutoComplete;