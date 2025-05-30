import React from 'react';
import {View, StyleSheet, SafeAreaView, ScrollView} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {OnboardingStackParamList} from '@types/navigation';
import {Text, Button, Card} from '@components/ui';
import {COLORS, SPACING} from '@constants';

type PrivacyScreenNavigationProp = StackNavigationProp<
  OnboardingStackParamList,
  'Privacy'
>;

interface PrivacyScreenProps {
  navigation: PrivacyScreenNavigationProp;
}

export const PrivacyScreen: React.FC<PrivacyScreenProps> = ({navigation}) => {
  const handleAccept = () => {
    navigation.navigate('InitialSetup');
  };

  const handleViewDetails = () => {
    // TODO: Show detailed privacy policy
    console.log('Show privacy policy details');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text variant="h2" align="center" style={styles.title}>
            プライバシー保護
          </Text>
        </View>

        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          <Card style={styles.featureCard}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🔒</Text>
              <View style={styles.featureContent}>
                <Text variant="body" weight="medium" style={styles.featureTitle}>
                  すべてローカル保存
                </Text>
                <Text variant="caption" style={styles.featureDescription}>
                  あなたのデータは端末内にのみ保存されます
                </Text>
              </View>
            </View>
          </Card>

          <Card style={styles.featureCard}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🚫</Text>
              <View style={styles.featureContent}>
                <Text variant="body" weight="medium" style={styles.featureTitle}>
                  外部APIに個人データ送信なし
                </Text>
                <Text variant="caption" style={styles.featureDescription}>
                  プロンプトテンプレートの配信のみ行います
                </Text>
              </View>
            </View>
          </Card>

          <Card style={styles.featureCard}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>👤</Text>
              <View style={styles.featureContent}>
                <Text variant="body" weight="medium" style={styles.featureTitle}>
                  あなたが完全にコントロール
                </Text>
                <Text variant="caption" style={styles.featureDescription}>
                  データの管理・削除はいつでも可能です
                </Text>
              </View>
            </View>
          </Card>

          <View style={styles.explanation}>
            <Text variant="body" align="center" style={styles.explanationText}>
              データは端末内のみに保存され、{'\n'}
              プライバシーを最大限保護します
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="同意して続行"
            onPress={handleAccept}
            size="large"
            style={styles.acceptButton}
          />
          <Button
            title="詳細を見る"
            onPress={handleViewDetails}
            variant="text"
            style={styles.detailsButton}
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
  },
  body: {
    flex: 1,
  },
  featureCard: {
    marginVertical: SPACING.xs,
    padding: SPACING.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureIcon: {
    fontSize: 24,
    marginRight: SPACING.base,
    marginTop: 2,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  featureDescription: {
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  explanation: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.base,
  },
  explanationText: {
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  footer: {
    paddingTop: SPACING.lg,
  },
  acceptButton: {
    width: '100%',
    marginBottom: SPACING.base,
  },
  detailsButton: {
    width: '100%',
  },
});