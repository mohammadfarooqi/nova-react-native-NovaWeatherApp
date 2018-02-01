import React, { Component } from 'react';
import { StyleSheet, Text, View, TextInput } from 'react-native';

import ListLocationsWeather from '../ListLocationsWeather/ListLocationsWeather';

export default class Home extends Component {
  constructor() {
    super();

    this.state = {
      locations: []
    };
  }

  addLocationToList(event) {
    const location = event.nativeEvent.text;
    console.log('Adding Location: ', location);

    const locations = [...this.state.locations];
    locations.push(location);

    this.setState({
      locations
    });

    // console.log('Locations array: ', this.state.locations);

    this.textInput.clear();
  }
  
  render() {
    return (
      <View style={styles.container}>
        <TextInput 
          placeholder="Enter a City"
          onSubmitEditing={(e) => this.addLocationToList(e)}
          ref={input => { this.textInput = input }}
          style={styles.textInput}
        />
        
        <ListLocationsWeather locations={this.state.locations} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 25,
    flex: 1,
    backgroundColor: '#fff'
  },
  textInput: {
    height: 45
  }
});
