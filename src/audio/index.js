// src/audio/index.js

import { NativeModules, PermissionsAndroid, Platform } from 'react-native';
const { AudioRecorderModule } = NativeModules;

async function requestAndroidPermissions() {
  if (Platform.OS !== 'android') return true;
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    {
      title: 'Microphone Permission',
      message: 'App needs access to your microphone to record audio.',
      buttonPositive: 'OK',
    }
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

async function requestIOSPermission() {
  try {
    const allowed = await AudioRecorderModule.requestPermission();
    if (!allowed) {
  throw new Error('Permission denied');
}
    return allowed;
  } catch (e) {
    return false;
  }
}

async function startRecording(filename = 'recording.m4a') {
  if (Platform.OS === 'android') {
    const ok = await requestAndroidPermissions();
    if (!ok) throw new Error('Permission denied');
  } else {
    const ok = await requestIOSPermission();
    if (!ok) throw new Error('Permission denied');
  }
  const path = await AudioRecorderModule.startRecording(filename);
  return path;
}

async function stopRecording() {
  const path = await AudioRecorderModule.stopRecording();
  return path;
}

async function playRecorded(path) {
  return AudioRecorderModule.playRecording(path);
}

async function stopPlayback() {
  return AudioRecorderModule.stopPlaying();
}

export default {
  startRecording,
  stopRecording,
  playRecorded,
  stopPlayback,
};
