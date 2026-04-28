# 🎬 Video Frame Extractor

A premium, fast, and intuitive React Native application for extracting high-quality still frames from any video. Built with Expo and modern native tools, it allows users to scrub videos down to the millisecond, apply filters, and securely save multiple formats directly to their device.

---

## ✨ Features

- **Precision Playback**: Navigate through videos frame-by-frame with a responsive scrubber and precise time tracking.
- **Batch Extraction**: Extract frames by specific time intervals or automatically grab the very first and last frames.
- **Dynamic Multi-Select**: Seamlessly select multiple frames to batch save, share, or delete in one go.
- **Export Control**: Configure output format (`JPEG`, `PNG`, `WEBP`, `HEIF`) and compression quality (1-100%).
- **Filters**: Quickly apply beautiful non-destructive overlays (Vivid, Warm, Cool, Black & White) to any extracted frame.
- **Premium UI**: Crafted with smooth `reanimated` gestures, a native full-screen image viewer, and dynamic dark mode support.
- **Persistent Storage**: Safely persists extracted frames locally using the file system so you never lose your work.

---

## 🛠 Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) & [Expo SDK 55](https://expo.dev/)
- **Language**: TypeScript
- **Video & Media**: `expo-video`, `expo-image-manipulator`, `expo-media-library`
- **File System**: `expo-file-system` for persistent local frame caching
- **Navigation**: `expo-router` for file-based routing
- **Animations**: `react-native-reanimated` & `react-native-gesture-handler`

---

## 💻 Development

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- Expo Go app on your physical device, or an Android/iOS emulator

### Setup & Run
1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the application:
   ```bash
   npm run start   # Start the Expo bundler
   npm run android # Build and run on Android emulator
   npm run ios     # Build and run on iOS simulator
   ```

### Code Quality
Use the built-in commands to ensure code consistency and type safety:
- **Linting**: `npm run lint`
- **Type Checking**: `npm run typecheck`
- **Run All Checks**: `npm run check`

---

## 🗺 Roadmap v0.2
We have recently completed a major v0.2 architectural upgrade. Key milestones include:
- [x] Migrate from deprecated `expo-video-thumbnails` to `expo-video` native thumbnail API.
- [x] Introduce persistent file-system caching to prevent device storage bloat and URI leaks.
- [x] Integrate `expo-image-manipulator` for powerful export formatting (`WEBP`, `HEIF`).
- [x] Add dynamic Multi-Select mode with batch sharing, saving, and deletion capabilities.
- [ ] Add advanced filter adjustments (brightness, contrast, saturation sliders).
- [ ] Implement cloud backup for extracted frame sessions.
- [ ] Expand localization and accessibility support.

---

*Built with ❤️ for content creators, developers, and mobile enthusiasts.*
