/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

 import React from 'react'
 import { NavigationContainer } from '@react-navigation/native';
 import store from './app/store/index'
 import { Provider } from 'react-redux'
import MainNavigation from './app/commonComponents/navigation/stackNavigation/mainNavigation';
 
 const App = () => {
   return (
     <Provider store={store}>
       <NavigationContainer>
         <MainNavigation />
       </NavigationContainer>
     </Provider>
   )
 }
 
 export default App;