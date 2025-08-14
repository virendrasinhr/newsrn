import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TaskList = ({ navigation, route }) => {
  const filter = route?.params?.filter;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Task List</Text>
      {filter && (
        <Text style={styles.subtitle}>Filter: {filter}</Text>
      )}
      <Text style={styles.placeholder}>Task list implementation coming soon...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  placeholder: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default TaskList;