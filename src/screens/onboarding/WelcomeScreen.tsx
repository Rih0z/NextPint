import React from 'react';
import {View, StyleSheet, SafeAreaView} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {OnboardingStackParamList} from '@types/navigation';
import {Text, Button} from '@components/ui';
import {COLORS, SPACING} from '@constants';

type WelcomeScreenNavigationProp = StackNavigationProp<
  OnboardingStackParamList,
  'Welcome'
>;

interface WelcomeScreenProps {
  navigation: WelcomeScreenNavigationProp;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({navigation}) => {
  const handleGetStarted = () => {
    navigation.navigate('Concept');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text variant="h1" align="center" style={styles.title}>
            NextPint
          </Text>
          <Text variant="h3" align="center" style={styles.subtitle}>
            🍺 AI Beer Discovery{'\n'}Prompt Provider
          </Text>
        </View>

        <View style={styles.description}>
          <Text variant="body" align="center" style={styles.descriptionText}>
            ビール探索の新しい形{'\n'}
            AIプロンプトで発見の旅を始めましょう
          </Text>
        </View>

        <View style={styles.footer}>
          <Button
            title="はじめる"
            onPress={handleGetStarted}
            size="large"
            style={styles.button}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: COLORS.primary,
    marginBottom: SPACING.lg,
  },
  subtitle: {
    color: COLORS.textSecondary,
    lineHeight: 32,
  },
  description: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.base,
  },
  descriptionText: {
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  footer: {
    paddingTop: SPACING.lg,
  },
  button: {
    width: '100%',
  },
});