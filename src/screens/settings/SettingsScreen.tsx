import React from 'react';
import {View, StyleSheet, SafeAreaView, ScrollView} from 'react-native';
import {Text, Card} from '@components/ui';
import {COLORS, SPACING} from '@constants';

export const SettingsScreen: React.FC = () => {
  const handleProfileSettings = () => {
    console.log('Profile settings');
  };

  const handleDataManagement = () => {
    console.log('Data management');
  };

  const handleAbout = () => {
    console.log('About');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text variant="h3" style={styles.sectionTitle}>
            個人設定
          </Text>
          
          <Card style={styles.settingCard} onPress={handleProfileSettings}>
            <View style={styles.settingItem}>
              <Text style={styles.settingIcon}>👤</Text>
              <Text variant="body" style={styles.settingTitle}>
                好みプロファイル
              </Text>
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <Text variant="h3" style={styles.sectionTitle}>
            データ管理
          </Text>
          
          <Card style={styles.settingCard} onPress={handleDataManagement}>
            <View style={styles.settingItem}>
              <Text style={styles.settingIcon}>📊</Text>
              <Text variant="body" style={styles.settingTitle}>
                ストレージ使用状況
              </Text>
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <Text variant="h3" style={styles.sectionTitle}>
            アプリ情報
          </Text>
          
          <Card style={styles.settingCard} onPress={handleAbout}>
            <View style={styles.settingItem}>
              <Text style={styles.settingIcon}>ℹ️</Text>
              <Text variant="body" style={styles.settingTitle}>
                バージョン情報
              </Text>
            </View>
          </Card>
        </View>
      </ScrollView>
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
    padding: SPACING.base,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    color: COLORS.text,
    marginBottom: SPACING.base,
  },
  settingCard: {
    marginVertical: SPACING.xs,
    padding: SPACING.lg,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    fontSize: 20,
    marginRight: SPACING.base,
  },
  settingTitle: {
    color: COLORS.text,
  },
});