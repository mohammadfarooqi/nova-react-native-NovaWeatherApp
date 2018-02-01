import React, { Component } from 'react';
import { View } from 'react-native';

import Home from './app/components/Home/Home';

export default class App extends Component {
  render() {
    return (
      <View>
        <Home />
      </View>
    );
  }
}