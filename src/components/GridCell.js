import React, {Component} from 'react';
import { 
  View, Text, Dimensions, TouchableOpacity, Image, AsyncStorage
} from 'react-native'
import { firebaseApp } 		from '../firebase';

const width = Dimensions.get('screen').width / 3;
  
export default class GridCell extends Component {

  constructor(props) {
    super(props);
    this.state = {
      newShouts: 0,
    }
  }
  componentDidMount() {
    this.refreshFunc();
  }

  refreshFunc = () => {
    
    firebaseApp.database().ref('posts').child(this.props.item.groupName).on('value', (snap) => {
      var shoutCount = 0;
      snap.forEach((child) => {
        shoutCount ++;
      });
      AsyncStorage.getItem(this.props.item.groupName).then((value) => {
        this.setState({
          newShouts: shoutCount - value,
        })
      })
    })
  }
  onPress =() => {
    
    firebaseApp.database().ref('posts').child(this.props.item.groupName).once('value', (snap) => {
      var shoutCount = 0;
      snap.forEach((child) => {
        shoutCount ++;
      });
      AsyncStorage.setItem(this.props.item.groupName, shoutCount.toString());
      var v1 = Object.assign({'refresh': this.refreshFunc}, this.props.item);
      this.props.onPress(v1);
    })
    
  }
  render() {
    return (
      <TouchableOpacity style={{ backgroundColor: 'black' }} onPress={() => {this.onPress()}}>
        <Image style={{ width: '100%', height: '100%', position: 'absolute' }} source={{uri: this.props.item.thumbLink}}/>
        <View style={{ width: width, height: width, justifyContent: 'flex-start', alignItems: 'flex-end', position: 'absolute', display: this.state.newShouts > 0 ? null : 'none'}}>
          <Image style={{ width: 32, height: 32, position: 'absolute' }} source={require('../images/redshape.png')}/>
          <Text style={{color: 'white', backgroundColor: 'transparent'}}>{this.state.newShouts}</Text>
        </View>
        <View style={{ width: width, height: width, justifyContent: 'flex-end', alignItems: 'flex-start', padding: 5, }}>
          <Text style={{ color: 'white', backgroundColor: 'transparent'}}>{this.props.item.groupName}</Text>
        </View>
      </TouchableOpacity>
    )
  }
}
