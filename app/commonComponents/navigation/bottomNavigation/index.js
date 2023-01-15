import React, { useContext } from 'react';
import { Image, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Setting from '../../../screens/setting';
import styles from './styles';
import News from '../../../screens/news';
import { color } from '../../../common/colors';

const Tab = createBottomTabNavigator();

const NewsStack = createNativeStackNavigator();
const SettingStack = createNativeStackNavigator();

const NewsTab = () => {
  return (
    <NewsStack.Navigator>
      <NewsStack.Screen
        name="News"
        component={News}
        options={{ headerShown: false, title: '' }}
      />
    </NewsStack.Navigator>
  );
}

const SettingTab = () => {
  return (
    <SettingStack.Navigator>
      <SettingStack.Screen
        name="Setting"
        component={Setting}
        options={{ headerShown: false, title: '' }}
      />
    </SettingStack.Navigator>
  );
}

const bottomTabs = [
  {
    key: 'News',
    name: 'NewsTab',
    label: 'News',
    component: NewsTab,
  },
  {
    key: 'Settings',
    name: 'SettingsTab',
    label: 'Settings',
    component: SettingTab,
  }
];

const Tabs = () => {
  const { label, tabImage, tabBarStyle } = styles;

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: tabBarStyle,
        tabBarShowLabel: true,
      }}>
      {bottomTabs.map((tab, index) => (
        <Tab.Screen
          key={tab?.key}
          name={tab?.name}
          component={tab?.component}
          options={{
            headerShown: false,
            tabBarLabel: ({ focused }) => (
              <Text
                style={[
                  label,
                  { color: (focused && color.secondary) || color.gray1N },
                ]}>
                {tab?.label}
              </Text>
            ),
            tabBarHideOnKeyboard: true,
            tabBarIcon: ({ focused }) => {
              return (
                (tab?.image && (
                  <Image
                    source={tab?.image}
                    style={[
                      tabImage,
                      {
                        tintColor:
                        (focused && color.secondary) || color.gray1N,
                      },
                    ]}
                  />
                ))
              );
            },
          }}
        />
      ))}
    </Tab.Navigator>
  );
};

export default Tabs;
