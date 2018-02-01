import React, { Component } from 'react';
import { NavigatorIOS } from 'react-native';

// import ListWeatherLocation from '../ListWeatherLocation/ListWeatherLocation';
import Home from '../Home/Home';

export default class NavigateComponent extends Component {
  render() {
    return (
      <NavigatorIOS
        initialRoute={{
          component: Home,
          title: 'Weather of Cities'
        }}
        style={{flex: 1}}
      />
    );
  }
}