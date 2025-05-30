# 開発環境セットアップガイド

## 概要

NextPintアプリケーションの開発環境構築手順について説明します。React Native、TypeScript、AsyncStorageを使用したクロスプラットフォーム開発環境をセットアップします。

## 前提条件

### 必要なソフトウェア

#### macOS開発者向け
- **macOS**: 12.0以降
- **Xcode**: 14.0以降（iOS開発用）
- **Android Studio**: 2022.1以降（Android開発用）
- **Node.js**: 18.0以降
- **npm**: 8.0以降 または **Yarn**: 1.22以降
- **Git**: 2.30以降

#### Windows開発者向け
- **Windows**: 10以降
- **Android Studio**: 2022.1以降
- **Node.js**: 18.0以降
- **npm**: 8.0以降 または **Yarn**: 1.22以降
- **Git**: 2.30以降
- **PowerShell**: 7.0以降

## 環境構築手順

### 1. Node.js環境のセットアップ

#### Node.jsのインストール
```bash
# nvmを使用した場合（推奨）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.zshrc
nvm install 18
nvm use 18

# 直接インストールの場合
# https://nodejs.org/ からLTS版をダウンロード
```

#### パッケージマネージャーの選択
```bash
# Yarnを使用する場合（推奨）
npm install -g yarn

# npmのバージョン確認
npm --version
yarn --version
```

### 2. React Native開発環境

#### React Native CLIのインストール
```bash
npm install -g @react-native-community/cli
```

#### iOS開発環境（macOSのみ）
```bash
# Xcodeのインストール
# App StoreからXcodeをインストール

# Command Line Toolsのインストール
xcode-select --install

# CocoaPodsのインストール
sudo gem install cocoapods

# iOS Simulatorの確認
xcrun simctl list devices
```

#### Android開発環境
```bash
# Android Studioのインストール
# https://developer.android.com/studio からダウンロード

# 環境変数の設定（~/.zshrc または ~/.bash_profile）
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

# 設定の反映
source ~/.zshrc

# Android SDKの確認
android list targets
```

### 3. プロジェクトのセットアップ

#### リポジトリのクローン
```bash
git clone <repository-url>
cd NextPint
```

#### 依存関係のインストール
```bash
# Node.js依存関係
yarn install
# または
npm install

# iOS依存関係（macOSのみ）
cd ios
pod install
cd ..
```

#### 環境設定ファイルの作成
```bash
# 環境変数ファイルの作成
cp .env.example .env.local

# 設定内容の編集
# API_BASE_URL=https://api.nextpint.app
# APP_ENV=development
# DEBUG=true
```

### 4. 開発ツールのセットアップ

#### Visual Studio Codeの設定
```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

#### 推奨拡張機能
```json
// .vscode/extensions.json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-json",
    "ms-vscode.vscode-react-native"
  ]
}
```

### 5. コード品質ツール

#### ESLintの設定
```javascript
// .eslintrc.js
module.exports = {
  root: true,
  extends: [
    '@react-native-community',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    'no-console': 'warn',
    '@typescript-eslint/no-unused-vars': 'error',
    'react-native/no-inline-styles': 'warn',
  },
  settings: {
    'import/resolver': {
      typescript: {}
    }
  }
};
```

#### Prettierの設定
```json
// .prettierrc
{
  "arrowParens": "avoid",
  "bracketSameLine": true,
  "bracketSpacing": false,
  "singleQuote": true,
  "trailingComma": "all",
  "tabWidth": 2,
  "semi": true
}
```

#### TypeScript設定
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "esnext",
    "lib": ["es2017"],
    "allowJs": true,
    "skipLibCheck": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"],
      "@components/*": ["components/*"],
      "@screens/*": ["screens/*"],
      "@services/*": ["services/*"],
      "@utils/*": ["utils/*"],
      "@types/*": ["types/*"]
    }
  },
  "include": [
    "src/**/*",
    "index.js"
  ],
  "exclude": [
    "node_modules",
    "babel.config.js",
    "metro.config.js",
    "jest.config.js"
  ]
}
```

## プロジェクト構造

```
NextPint/
├── src/
│   ├── components/          # 再利用可能なコンポーネント
│   │   ├── ui/             # 基本UIコンポーネント
│   │   ├── forms/          # フォーム関連コンポーネント
│   │   └── cards/          # カード系コンポーネント
│   ├── screens/            # 画面コンポーネント
│   │   ├── onboarding/     # オンボーディング
│   │   ├── session/        # セッション管理
│   │   ├── history/        # 履歴管理
│   │   ├── import/         # データインポート
│   │   └── settings/       # 設定
│   ├── services/           # ビジネスロジック
│   │   ├── storage/        # ローカルストレージ
│   │   ├── prompt/         # プロンプト生成
│   │   ├── import/         # データインポート
│   │   └── api/            # API通信
│   ├── utils/              # ユーティリティ
│   │   ├── validation/     # バリデーション
│   │   ├── formatting/     # フォーマット
│   │   └── constants/      # 定数
│   ├── types/              # TypeScript型定義
│   ├── hooks/              # カスタムフック
│   └── navigation/         # ナビゲーション設定
├── ios/                    # iOSプロジェクト
├── android/                # Androidプロジェクト
├── __tests__/              # テストファイル
├── docs/                   # ドキュメント
└── scripts/                # ビルドスクリプト
```

## 開発コマンド

### 基本的な開発コマンド
```bash
# 開発サーバーの起動
yarn start
# または
npm start

# iOSシミュレーターでの実行
yarn ios
# または
npm run ios

# Androidエミュレーターでの実行
yarn android
# または
npm run android

# Metro bundlerの起動
yarn start --reset-cache
```

### コード品質チェック
```bash
# ESLintによる静的解析
yarn lint
yarn lint --fix

# TypeScriptの型チェック
yarn type-check

# Prettierによるフォーマット
yarn format

# 全体的な品質チェック
yarn quality-check
```

### テスト実行
```bash
# 単体テストの実行
yarn test

# テストカバレッジの確認
yarn test --coverage

# E2Eテストの実行
yarn e2e:ios
yarn e2e:android
```

### ビルド関連
```bash
# デバッグビルド
yarn build:debug

# リリースビルド
yarn build:release

# iOSアーカイブの作成
yarn build:ios-archive

# Android APKの作成
yarn build:android-apk
```

## パッケージ管理

### 主要な依存関係

#### Core Dependencies
```json
{
  "react": "18.2.0",
  "react-native": "0.72.0",
  "@react-navigation/native": "^6.0.0",
  "@react-navigation/stack": "^6.0.0",
  "@react-native-async-storage/async-storage": "^1.19.0"
}
```

#### Development Dependencies
```json
{
  "@types/react": "^18.0.0",
  "@types/react-native": "^0.72.0",
  "@typescript-eslint/eslint-plugin": "^5.0.0",
  "@typescript-eslint/parser": "^5.0.0",
  "eslint": "^8.0.0",
  "prettier": "^2.8.0",
  "typescript": "^5.0.0"
}
```

### パッケージの追加
```bash
# 本番依存関係の追加
yarn add <package-name>

# 開発依存関係の追加
yarn add -D <package-name>

# iOSのネイティブ依存関係の更新
cd ios && pod install
```

## デバッグツール

### React Native Debugger
```bash
# インストール
brew install --cask react-native-debugger

# 使用方法
# 1. React Native Debuggerを起動
# 2. アプリでデバッグメニューを開く（⌘+D または Shake）
# 3. "Debug with Chrome"を選択
```

### Flipper
```bash
# Flipperのインストール
brew install --cask flipper

# プラグインの追加
# - Layout Inspector
# - Network
# - Databases
# - Shared Preferences
```

### デバイス実機でのデバッグ
```bash
# iOSデバイスでの実行
yarn ios --device "Device Name"

# Androidデバイスでの実行
adb devices
yarn android --deviceId <device-id>
```

## 環境別設定

### 開発環境
```javascript
// src/config/development.ts
export const config = {
  apiBaseUrl: 'https://api-dev.nextpint.app',
  enableLogging: true,
  enableDebugger: true,
  enableFlipper: true
};
```

### ステージング環境
```javascript
// src/config/staging.ts
export const config = {
  apiBaseUrl: 'https://api-staging.nextpint.app',
  enableLogging: true,
  enableDebugger: false,
  enableFlipper: false
};
```

### 本番環境
```javascript
// src/config/production.ts
export const config = {
  apiBaseUrl: 'https://api.nextpint.app',
  enableLogging: false,
  enableDebugger: false,
  enableFlipper: false
};
```

## CI/CD設定

### GitHub Actions
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'yarn'
      
      - run: yarn install --frozen-lockfile
      - run: yarn lint
      - run: yarn type-check
      - run: yarn test
      
  build-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'yarn'
          
      - run: yarn install --frozen-lockfile
      - run: cd ios && pod install
      - run: yarn build:ios-debug
      
  build-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'yarn'
          
      - uses: actions/setup-java@v3
        with:
          distribution: 'temurin'
          java-version: '11'
          
      - run: yarn install --frozen-lockfile
      - run: yarn build:android-debug
```

## トラブルシューティング

### よくある問題と解決方法

#### Metro bundler関連
```bash
# キャッシュクリア
yarn start --reset-cache
npx react-native start --reset-cache

# node_modulesの再インストール
rm -rf node_modules
yarn install
```

#### iOS関連
```bash
# Xcodeキャッシュクリア
rm -rf ~/Library/Caches/com.apple.dt.Xcode

# CocoaPods関連
cd ios
rm -rf Pods Podfile.lock
pod install

# Derived Dataのクリア
rm -rf ~/Library/Developer/Xcode/DerivedData
```

#### Android関連
```bash
# Gradleキャッシュクリア
cd android
./gradlew clean

# Android Studio AVDの確認
$ANDROID_HOME/emulator/emulator -list-avds

# adbの再起動
adb kill-server
adb start-server
```

#### TypeScript関連
```bash
# TypeScriptサーバーの再起動（VSCode）
# Command Palette > "TypeScript: Restart TS Server"

# 型定義ファイルの再インストール
rm -rf node_modules/@types
yarn install
```

### ログ出力とデバッグ
```typescript
// src/utils/logger.ts
export class Logger {
  static debug(message: string, data?: any): void {
    if (__DEV__) {
      console.log(`[DEBUG] ${message}`, data);
    }
  }
  
  static error(message: string, error?: Error): void {
    console.error(`[ERROR] ${message}`, error);
  }
  
  static warn(message: string, data?: any): void {
    console.warn(`[WARN] ${message}`, data);
  }
}
```

## パフォーマンス最適化

### Bundle Size分析
```bash
# Bundle Analyzerの実行
npx react-native bundle --platform ios --dev false --entry-file index.js --bundle-output ios-bundle.js --sourcemap-output ios-bundle.map
npx react-native-bundle-visualizer ios-bundle.js

# Metro Bundle Analyzerの使用
yarn add --dev metro-bundle-analyzer
npx metro-bundle-analyzer
```

### メモリ使用量監視
```typescript
// src/utils/performance.ts
export class PerformanceMonitor {
  static logMemoryUsage(): void {
    if (__DEV__) {
      const memory = (performance as any).memory;
      if (memory) {
        console.log('Memory Usage:', {
          used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
          total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
          limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB'
        });
      }
    }
  }
}
```

## セキュリティ設定

### 環境変数の管理
```bash
# .env.local（Git管理外）
API_KEY=your-secret-api-key
DATABASE_URL=your-database-url

# .env.example（Git管理対象）
API_KEY=your-api-key-here
DATABASE_URL=your-database-url-here
```

### コード難読化（リリースビルド時）
```javascript
// metro.config.js
module.exports = {
  transformer: {
    minifierConfig: {
      mangle: {
        keep_fnames: true,
      },
    },
  },
};
```

これで開発環境のセットアップガイドは完成です。このガイドに従って環境を構築することで、NextPintアプリケーションの開発を始めることができます。