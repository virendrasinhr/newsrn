import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TimeTracking = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Time Tracking</Text>
      <Text style={styles.placeholder}>Time tracking interface coming soon...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  placeholder: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default TimeTracking;