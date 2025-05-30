import React from 'react';
import {View, StyleSheet, SafeAreaView} from 'react-native';
import {Text, EmptyState} from '@components/ui';
import {COLORS, SPACING} from '@constants';

export const SessionsScreen: React.FC = () => {
  const handleCreateSession = () => {
    console.log('Create new session');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <EmptyState
          icon={<Text style={styles.emptyIcon}>🎯</Text>}
          title="セッションがありません"
          description="新しいセッションを作成してビール探索を始めましょう"
          actionLabel="セッション作成"
          onAction={handleCreateSession}
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