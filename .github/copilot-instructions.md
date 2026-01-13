# Copilot Instructions for React Native Firebase Auth

## Project Overview

This is a **React Native 0.83.1** project with TypeScript, bootstrapped via `@react-native-community/cli`. The current codebase is a template shell using `SafeAreaProvider` and basic styling. **Future state**: This project is designed to integrate Firebase Authentication (indicated by project name and structure setup).

### Key Stack
- **Framework**: React Native 0.83.1 with React 19.2.0
- **Language**: TypeScript 5.8.3
- **Build System**: Metro (default React Native bundler)
- **Testing**: Jest 29.6.3 + React Test Renderer
- **Code Quality**: ESLint (@react-native config) + Prettier
- **iOS**: CocoaPods for native dependencies (Gemfile-managed)
- **Target Node Version**: ≥20

## Architecture & Data Flow

### Component Structure
- **Root entry**: [index.js](index.js) → `AppRegistry.registerComponent()` registers the app
- **Main component**: [App.tsx](App.tsx) - Currently wraps content with `SafeAreaProvider` and `StatusBar`
  - `App()`: Wraps layout with SafeAreaProvider, handles dark/light mode via `useColorScheme()`
  - `AppContent()`: Consumes SafeAreaInsets from context, renders actual content

### Expected Firebase Integration Points
When adding Firebase Auth:
1. **Auth Provider**: Likely wrap App.tsx root with Firebase auth context/provider
2. **Auth Routes**: Separate authenticated vs. unauthenticated screens (not yet implemented)
3. **State Management**: Consider Redux/MobX pattern if auth state becomes complex

### Safe Area Handling
- **Package**: `react-native-safe-area-context` v5.5.2 (notch/status bar support)
- **Pattern**: Always use `<SafeAreaProvider>` at root; consume `useSafeAreaInsets()` in child components
- See [App.tsx](App.tsx#L20-L30) for current example

## Developer Workflows

### Starting Development
```bash
npm start                    # Starts Metro dev server
npm run android             # Build and run on Android emulator/device
npm run ios                 # Build and run on iOS simulator/device (requires CocoaPods setup)
npm test                    # Run Jest tests (watches by default)
npm run lint                # Run ESLint
```

### iOS First-Time Setup
```bash
bundle install              # Install Ruby gems (CocoaPods)
bundle exec pod install     # Install Cocoa dependencies before first build
```

### Hot Reload & Debugging
- **Android**: Ctrl+M opens dev menu; press R twice to reload
- **iOS**: Press R in simulator to reload
- **State Reset**: Full reload clears app state (required after state-dependent changes)

### Testing
- **Test Location**: [__tests__/](/__tests__) directory (Jest convention)
- **Test Pattern**: [App.test.tsx](__tests__/App.test.tsx) uses `ReactTestRenderer.act()` + async pattern
- Run: `npm test` (watches for changes)

## Code Conventions & Patterns

### TypeScript & Typing
- Extends: `@react-native/typescript-config` (strict mode enabled)
- Includes: Jest type definitions via `"types": ["jest"]`
- Pattern: Prefer explicit types for component props; use functional components with hooks

### Styling
- **Method**: `StyleSheet.create()` from react-native (see [App.tsx](App.tsx#L29-L33))
- **Pattern**: Define styles as constants, reference with `style={}` prop
- Avoid inline styles; use flex layout for responsive design

### Code Quality
- **Prettier Config** ([.prettierrc.js](.prettierrc.js)): 
  - `singleQuote: true`, `trailingComma: 'all'`, `arrowParens: 'avoid'`
  - Format before commit; most files already formatted
- **ESLint**: Uses `@react-native` preset; covers React/React-Native specific rules
  - Run: `npm run lint` (no auto-fix by default)

### Component Patterns
- Use functional components with hooks (`useState`, `useContext`, etc.)
- Leverage `useColorScheme()` for theme-aware rendering
- Separate concerns: layout (App.tsx root) vs. content (AppContent)

## Build & Platform-Specific Setup

### Android
- **Root Config**: [android/settings.gradle](android/settings.gradle)
- **Build Config**: [android/app/build.gradle](android/app/build.gradle)
- **Dev Server**: Metro handles JS bundling; Gradle handles native build
- **Build Output**: `.apk` files in `android/app/build/outputs/`

### iOS
- **CocoaPods Dependency Management**: [ios/Podfile](ios/Podfile)
- **Xcode Project**: [ios/firebaseAuth.xcodeproj](ios/firebaseAuth.xcodeproj)
- **Critical**: Run `bundle exec pod install` after dependency changes
- **App Config**: [ios/firebaseAuth/Info.plist](ios/firebaseAuth/Info.plist)

## Critical Gotchas & Common Tasks

### Adding Native Dependencies
1. Install npm package: `npm install <package>`
2. **iOS**: Run `bundle exec pod install` (required!)
3. Rebuild: `npm run ios` or `npm run android`
4. Metro may need restart if bundler caches old dependencies

### Debugging Production Crashes
- **Android**: Check Gradle/native logs in `android/app/build/` outputs
- **iOS**: Check Xcode build logs; PrivacyInfo.xcprivacy may need updates for new permissions
- Run full rebuild (not just hot reload) after structural changes

### Metro Issues
- **Cache Clear**: Delete `.bundle/` and `node_modules/.metro-cache/` if Metro hangs
- **Port Conflicts**: Default port 8081; if occupied, Metro prompts for alternative

## Integration Points & Dependencies

### External Libraries
- **SafeAreaContext**: Used for notch/status bar handling; provides `useSafeAreaInsets()` hook
- **NewAppScreen**: Temporary UI from `@react-native/new-app-screen` (replace during auth implementation)
- **Future**: Firebase SDK, state management (Redux/Zustand), navigation library (React Navigation)

### Cross-Platform Considerations
- Test changes on both Android emulator and iOS simulator
- Notch handling: SafeAreaProvider automatically accounts for it
- Status bar styling: Adjust `StatusBar.barStyle` based on theme

## Example Task: Adding a Feature

1. **Create component**: `src/screens/LoginScreen.tsx` (not yet in structure)
2. **Style**: Use `StyleSheet.create()` following [App.tsx](App.tsx#L29-L33) pattern
3. **Type props**: Define TypeScript interfaces for all props
4. **Test**: Add test to `__tests__/` matching Jest conventions
5. **Lint**: Run `npm run lint` before commit
6. **Test on device**: `npm run android` or `npm run ios` to verify on real platform
