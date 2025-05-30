import React from 'react';
import {View, StyleSheet, SafeAreaView, ScrollView} from 'react-native';
import {Text, Button, Card, EmptyState} from '@components/ui';
import {COLORS, SPACING} from '@constants';

export const HomeScreen: React.FC = () => {
  const handleCreateSession = () => {
    console.log('Create new session');
  };

  const handleImportData = () => {
    console.log('Import data');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.quickActions}>
          <Text variant="h3" style={styles.sectionTitle}>
            クイックアクション
          </Text>
          
          <View style={styles.actionButtons}>
            <Card style={styles.actionCard} onPress={handleCreateSession}>
              <Text style={styles.actionIcon}>🎯</Text>
              <Text variant="body" weight="medium" style={styles.actionTitle}>
                新しい{'\n'}セッション作成
              </Text>
            </Card>

            <Card style={styles.actionCard} onPress={handleImportData}>
              <Text style={styles.actionIcon}>📤</Text>
              <Text variant="body" weight="medium" style={styles.actionTitle}>
                データ{'\n'}インポート
              </Text>
            </Card>
          </View>
        </View>

        <View style={styles.recentSessions}>
          <Text variant="h3" style={styles.sectionTitle}>
            最近のセッション
          </Text>
          
          <EmptyState
            icon={<Text style={styles.emptyIcon}>🍺</Text>}
            title="まだセッションがありません"
            description="新しいセッションを作成してビール探索を始めましょう"
            actionLabel="セッション作成"
            onAction={handleCreateSession}
          />
        </View>

        <View style={styles.importStatus}>
          <Text variant="h3" style={styles.sectionTitle}>
            インポート状況
          </Text>
          
          <Card style={styles.statusCard}>
            <Text variant="body" style={styles.statusText}>
              📊 0個のビール
            </Text>
            <Text variant="caption" style={styles.statusDescription}>
              データをインポートして履歴を作成しましょう
            </Text>
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
  quickActions: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    color: COLORS.text,
    marginBottom: SPACING.base,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.base,
  },
  actionCard: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.lg,
    minHeight: 100,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  actionTitle: {
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 20,
  },
  recentSessions: {
    marginBottom: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 48,
  },
  importStatus: {
    marginBottom: SPACING.xl,
  },
  statusCard: {
    padding: SPACING.lg,
  },
  statusText: {
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  statusDescription: {
    color: COLORS.textSecondary,
  },
});