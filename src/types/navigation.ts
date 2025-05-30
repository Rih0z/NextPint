import type {NavigatorScreenParams} from '@react-navigation/native';

export type RootStackParamList = {
  Onboarding: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
};

export type MainTabParamList = {
  Home: undefined;
  Sessions: undefined;
  History: undefined;
  Settings: undefined;
};

export type OnboardingStackParamList = {
  Welcome: undefined;
  Concept: undefined;
  Privacy: undefined;
  InitialSetup: undefined;
};

export type SessionStackParamList = {
  SessionList: undefined;
  CreateSession: undefined;
  SessionGoal: {sessionId?: string};
  SessionPreferences: {sessionId: string};
  SessionConstraints: {sessionId: string};
  PromptGenerated: {sessionId: string; promptId: string};
};

export type ImportStackParamList = {
  ImportService: undefined;
  ImportInstructions: {source: string};
  ImportPrompt: {source: string};
  ImportResult: {source: string; promptId: string};
};

export type HistoryStackParamList = {
  BeerHistory: undefined;
  SessionHistory: undefined;
  BeerDetail: {beerId: string};
  SessionDetail: {sessionId: string};
};

export type SettingsStackParamList = {
  SettingsMain: undefined;
  Profile: undefined;
  Preferences: undefined;
  DataManagement: undefined;
  About: undefined;
};