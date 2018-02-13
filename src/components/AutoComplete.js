import React from 'react';
import { TextInput, FlatList, View, Text, TouchableOpacity, StyleSheet, Platform, } from 'react-native';
import { AutoGrowTextInput } from 'react-native-auto-grow-textinput';
import { firebaseApp } 		from '../firebase';
import Contacts from 'react-native-contacts';

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


  componentWillMount() {
    firebaseApp.database().ref('groups/').child(this.props.groupKey).child('privacy').once('value', (snap) => {
      var promises = [];
      var allMembers = [];
      snap.forEach((child) =>{
          promises.push(new Promise((resolve, reject) => {
              firebaseApp.database().ref('users/').child(child.val().userId).on('value', (snap) => {
                  allMembers.push({
                      email: snap.val().email,
                      name: snap.val().FullName
                  })
                  resolve();
              })
          }))
      })
      Promise.all(promises).then(() => {

          this.users = [];
          this.contacts = [];
          Contacts.getAll((err, contacts) => {
            if(err === 'denied'){
              // error
            } else {
              //contacts.forEach(contact => {
                //contact.emailAddresses.forEach(email => {        
                  if(allMembers.length == 0 ){
                    firebaseApp.database().ref('users').on('value', (snap) => {
                      snap.forEach((child) => {
                          //if(child.val().email == email.email)
                            this.users.push(child.val().FullName);
                        })
                    })
                  } else {
                    allMembers.forEach((child) => {
                      //if(child.email == email.email)
                        this.users.push(child.name);
                    })
                  }
                //})
              //});
            }
          })
      })
    })
  }

  _onChangeText = (text) => {
    this.setState({text});
    this.props.onChangeText(text);
    let index = text.lastIndexOf('@');
    curIndex = index;
    if (index != -1 && this.users.length > 0) {
      if (index == 0 || text[index - 1] == ' ') {
        const key = text.substring(index + 1).toLowerCase();
        const listDataSource = this.users.filter((user) => {
          if (user.toLowerCase().startsWith(key)) {
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
        this.myTextInput.focus();
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
      <View style={{ justifyContent: 'center', alignSelf: 'flex-start', zIndex: 10, marginBottom: -55,marginLeft: 60}}>
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
        {
          Platform.OS === 'ios' ?
            <AutoGrowTextInput //source={usernameImg}
            ref={(ref)=>{this.myTextInput = ref}}
              style={[styles.input, newStyle, style={paddingTop: 10, width: this.props.width}]}
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
              minHeight={40}
            />
          :
            <TextInput //source={usernameImg}
              ref={(ref)=>{this.myTextInput = ref}}
              style={[styles.input, newStyle, style={width: this.props.width}]}
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
    textAlignVertical: 'center',
		color: 'black',
		height: 40,
		borderRadius: 20,
	},
});

export default AutoComplete;