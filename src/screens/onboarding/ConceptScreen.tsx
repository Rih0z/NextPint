import React from 'react';
import {View, StyleSheet, SafeAreaView} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {OnboardingStackParamList} from '@types/navigation';
import {Text, Button, Card} from '@components/ui';
import {COLORS, SPACING} from '@constants';

type ConceptScreenNavigationProp = StackNavigationProp<
  OnboardingStackParamList,
  'Concept'
>;

interface ConceptScreenProps {
  navigation: ConceptScreenNavigationProp;
}

export const ConceptScreen: React.FC<ConceptScreenProps> = ({navigation}) => {
  const handleNext = () => {
    navigation.navigate('Privacy');
  };

  const handleSkip = () => {
    navigation.navigate('InitialSetup');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text variant="h2" align="center" style={styles.title}>
            NextPintとは？
          </Text>
        </View>

        <View style={styles.body}>
          <Card style={styles.conceptCard}>
            <View style={styles.conceptItem}>
              <Text style={styles.conceptIcon}>❌</Text>
              <Text variant="body" weight="medium" style={styles.conceptText}>
                ビールを推薦しません
              </Text>
            </View>
          </Card>

          <Card style={styles.conceptCard}>
            <View style={styles.conceptItem}>
              <Text style={styles.conceptIcon}>✅</Text>
              <Text variant="body" weight="medium" style={styles.conceptText}>
                プロンプトを提供します
              </Text>
            </View>
          </Card>

          <View style={styles.explanation}>
            <Text variant="body" align="center" style={styles.explanationText}>
              あなたの好みを理解し、{'\n'}
              ChatGPT、Claude、Geminiで{'\n'}
              使える最適なプロンプトを{'\n'}
              生成します。
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Button
            title="次へ"
            onPress={handleNext}
            size="large"
            style={styles.nextButton}
          />
          <Button
            title="スキップ"
            onPress={handleSkip}
            variant="text"
            style={styles.skipButton}
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
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  header: {
    paddingVertical: SPACING.xl,
  },
  title: {
    color: COLORS.text,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
  },
  conceptCard: {
    marginVertical: SPACING.sm,
    padding: SPACING.lg,
  },
  conceptItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  conceptIcon: {
    fontSize: 24,
    marginRight: SPACING.base,
  },
  conceptText: {
    flex: 1,
    color: COLORS.text,
  },
  explanation: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.base,
  },
  explanationText: {
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  footer: {
    paddingTop: SPACING.lg,
  },
  nextButton: {
    width: '100%',
    marginBottom: SPACING.base,
  },
  skipButton: {
    width: '100%',
  },
});