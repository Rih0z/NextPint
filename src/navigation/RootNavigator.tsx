import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {RootStackParamList} from '@types/navigation';
import {OnboardingNavigator} from './OnboardingNavigator';
import {MainNavigator} from './MainNavigator';
import {useAppSettings} from '@hooks/useAppSettings';

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const {settings, loading} = useAppSettings();

  if (loading) {
    return null; // TODO: Add loading screen
  }

  const isOnboardingCompleted = settings?.onboardingCompleted ?? false;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {!isOnboardingCompleted ? (
          <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        ) : (
          <Stack.Screen name="Main" component={MainNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};