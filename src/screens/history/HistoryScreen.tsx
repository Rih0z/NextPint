import React from 'react';
import {View, StyleSheet, SafeAreaView} from 'react-native';
import {Text, EmptyState} from '@components/ui';
import {COLORS, SPACING} from '@constants';

export const HistoryScreen: React.FC = () => {
  const handleImportData = () => {
    console.log('Import data');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <EmptyState
          icon={<Text style={styles.emptyIcon}>🍺</Text>}
          title="ビール履歴がありません"
          description="データをインポートしてビール履歴を作成しましょう"
          actionLabel="データをインポート"
          onAction={handleImportData}
        />
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
    padding: SPACING.base,
  },
  emptyIcon: {
    fontSize: 48,
  },
});