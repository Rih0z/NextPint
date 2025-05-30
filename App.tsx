import React from 'react';
import {StatusBar} from 'react-native';
import {RootNavigator} from '@navigation';
import {COLORS} from '@constants';

const App: React.FC = () => {
  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
        translucent={false}
      />
      <RootNavigator />
    </>
  );
};

export default App;