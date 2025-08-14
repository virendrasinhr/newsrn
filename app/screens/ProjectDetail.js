import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ProjectDetail = ({ navigation, route }) => {
  const projectId = route?.params?.projectId;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Project Details</Text>
      {projectId && (
        <Text style={styles.subtitle}>Project ID: {projectId}</Text>
      )}
      <Text style={styles.placeholder}>Project detail view coming soon...</Text>
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

export default ProjectDetail;