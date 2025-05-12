import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CourseScreen from './src/screens/CourseScreen';
import AssignmentsScreen from './src/screens/AssignmentScreen';
import { RootStackParamList } from './src/types';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <GestureHandlerRootView style={styles.root}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Courses">
          <Stack.Screen name="Courses" component={CourseScreen} />
          <Stack.Screen name="Assignments" component={AssignmentsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
});

export default App;
