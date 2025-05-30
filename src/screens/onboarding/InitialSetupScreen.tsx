import React, {useState} from 'react';
import {View, StyleSheet, SafeAreaView, ScrollView, Alert} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {OnboardingStackParamList} from '@types/navigation';
import {Text, Button, Card, Input, LoadingSpinner} from '@components/ui';
import {COLORS, SPACING} from '@constants';
import {useUserProfile} from '@hooks/useUserProfile';
import {useAppSettings} from '@hooks/useAppSettings';
import {UserPreferences} from '@types';

type InitialSetupScreenNavigationProp = StackNavigationProp<
  OnboardingStackParamList,
  'InitialSetup'
>;

interface InitialSetupScreenProps {
  navigation: InitialSetupScreenNavigationProp;
}

export const InitialSetupScreen: React.FC<InitialSetupScreenProps> = () => {
  const {createProfile, loading: profileLoading} = useUserProfile();
  const {completeOnboarding, loading: settingsLoading} = useAppSettings();
  
  const [preferences, setPreferences] = useState<Partial<UserPreferences>>({
    favoriteStyles: [],
    budgetRange: {
      min: 0,
      max: 2000,
      currency: 'JPY',
    },
    locationPreferences: ['東京'],
  });

  const [budgetMin, setBudgetMin] = useState('0');
  const [budgetMax, setBudgetMax] = useState('2000');
  const [location, setLocation] = useState('東京');

  const loading = profileLoading || settingsLoading;

  const handleCompleteSetup = async () => {
    try {
      // Update preferences with form data
      const updatedPreferences: Partial<UserPreferences> = {
        ...preferences,
        budgetRange: {
          min: parseInt(budgetMin) || 0,
          max: parseInt(budgetMax) || 10000,
          currency: 'JPY',
        },
        locationPreferences: location ? [location] : [],
      };

      // Create user profile
      await createProfile(updatedPreferences);
      
      // Complete onboarding
      await completeOnboarding();

      Alert.alert(
        'セットアップ完了',
        'NextPintへようこそ！ビール探索を始めましょう。',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigation will be handled automatically by RootNavigator
            },
          },
        ],
      );
    } catch (error) {
      Alert.alert(
        'エラー',
        'セットアップに失敗しました。もう一度お試しください。',
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner message="セットアップ中..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text variant="h2" align="center" style={styles.title}>
            初期設定
          </Text>
          <Text variant="body" align="center" style={styles.subtitle}>
            より良いプロンプトのために{'\n'}
            基本的な設定を行います
          </Text>
        </View>

        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          <Card style={styles.formCard}>
            <Text variant="h3" style={styles.sectionTitle}>
              予算設定
            </Text>
            <Text variant="caption" style={styles.sectionDescription}>
              1杯あたりの予算範囲を設定してください
            </Text>

            <View style={styles.budgetContainer}>
              <View style={styles.budgetInput}>
                <Input
                  label="最小金額"
                  value={budgetMin}
                  onChangeText={setBudgetMin}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
              <Text variant="body" style={styles.budgetSeparator}>
                〜
              </Text>
              <View style={styles.budgetInput}>
                <Input
                  label="最大金額"
                  value={budgetMax}
                  onChangeText={setBudgetMax}
                  keyboardType="numeric"
                  placeholder="2000"
                />
              </View>
            </View>
            <Text variant="caption" style={styles.budgetNote}>
              単位: 円
            </Text>
          </Card>

          <Card style={styles.formCard}>
            <Text variant="h3" style={styles.sectionTitle}>
              地域設定
            </Text>
            <Text variant="caption" style={styles.sectionDescription}>
              主に探索したい地域を設定してください
            </Text>

            <Input
              label="地域"
              value={location}
              onChangeText={setLocation}
              placeholder="東京"
            />
          </Card>

          <View style={styles.note}>
            <Text variant="caption" align="center" style={styles.noteText}>
              これらの設定は後からいつでも変更できます
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="セットアップ完了"
            onPress={handleCompleteSetup}
            size="large"
            style={styles.completeButton}
            loading={loading}
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
    paddingVertical: SPACING.lg,
  },
  title: {
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  body: {
    flex: 1,
  },
  formCard: {
    marginVertical: SPACING.sm,
    padding: SPACING.lg,
  },
  sectionTitle: {
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  sectionDescription: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.base,
    lineHeight: 18,
  },
  budgetContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: SPACING.xs,
  },
  budgetInput: {
    flex: 1,
  },
  budgetSeparator: {
    marginHorizontal: SPACING.sm,
    marginBottom: SPACING.lg,
    color: COLORS.textSecondary,
  },
  budgetNote: {
    color: COLORS.textTertiary,
  },
  note: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.base,
  },
  noteText: {
    color: COLORS.textTertiary,
  },
  footer: {
    paddingTop: SPACING.lg,
  },
  completeButton: {
    width: '100%',
  },
});