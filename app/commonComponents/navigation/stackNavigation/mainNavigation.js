import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Tabs from '../bottomNavigation';
import NewsDetails from '../../../screens/newsDetails';
import BookMark from '../../../screens/bookmark';

const Stack = createNativeStackNavigator();

const News = () => {
  return <Tabs />
}

const MainNavigation = () => {
  return (
    <Stack.Navigator
      initialRouteName="News"
      screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="News"
        component={News}
        options={{ headerShown: false }}
      />
        <Stack.Screen
        name="NewsDetails"
        component={NewsDetails}
        options={{ headerShown: false }}
      />
        <Stack.Screen
        name="BookMark"
        component={BookMark}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default MainNavigation;
