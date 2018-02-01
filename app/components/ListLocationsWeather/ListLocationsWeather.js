import React, { Component } from 'react';
import { View, Text } from 'react-native';

export default class ListLocationsWeather extends Component {
  render() {
    return (
      <View>
        <Text>{this.props.locations}</Text>
      </View>
    );
  }
}