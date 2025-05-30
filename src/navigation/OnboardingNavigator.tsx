import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {OnboardingStackParamList} from '@types/navigation';
import {WelcomeScreen} from '@screens/onboarding/WelcomeScreen';
import {ConceptScreen} from '@screens/onboarding/ConceptScreen';
import {PrivacyScreen} from '@screens/onboarding/PrivacyScreen';
import {InitialSetupScreen} from '@screens/onboarding/InitialSetupScreen';

const Stack = createStackNavigator<OnboardingStackParamList>();

export const OnboardingNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: {backgroundColor: '#FFFFFF'},
      }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Concept" component={ConceptScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
      <Stack.Screen name="InitialSetup" component={InitialSetupScreen} />
    </Stack.Navigator>
  );
};