// src/audio/index.js

import { NativeModules, Platform, Alert } from 'react-native';
import { check, request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';

const { AudioRecorderModule } = NativeModules;

async function requestBasicMicPermission() {
  const permission = Platform.select({
    ios: PERMISSIONS.IOS.MICROPHONE,
    android: PERMISSIONS.ANDROID.RECORD_AUDIO
  });

  if (!permission) {
    return false;
  }

  // Check current status
  let status = await check(permission);
  console.log('Basic mic permission status:', status);

  if (status === RESULTS.GRANTED) {
    return true;
  }

  // If denied / not determined, request
  status = await request(permission);
  console.log('After RN Permissions request status:', status);

  if (status === RESULTS.GRANTED) {
    return true;
  }

  if (status === RESULTS.BLOCKED) {
    // Optionally show alert asking user to enable in settings
    Alert.alert(
      'Permission Required',
      'Microphone permission is blocked. Please enable it in app settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => openSettings() }
      ]
    );
  }

  return false;
}

async function requestIOSNativePermission() {
  try {
    const allowed = await AudioRecorderModule.requestPermission();
    console.log('Native module requestPermission result:', allowed);
    return allowed;
  } catch (e) {
    console.log('Native requestPermission error:', e);
    return false;
  }
}

async function startRecording(filename = 'recording.m4a') {
  // First: check/request via react-native-permissions
  const basicAllowed = await requestBasicMicPermission();
  if (!basicAllowed) {
    throw new Error('Microphone permission denied (RN Permissions).');
  }

  // Next: check native-level permission so audio session is ready
  if (Platform.OS === 'ios') {
    const nativeAllowed = await requestIOSNativePermission();
    if (!nativeAllowed) {
      throw new Error('Microphone permission denied at native level.');
    }
  }

  // Finally: start recording via native module
  const path = await AudioRecorderModule.startRecording(filename);
  console.log('Recording started, saving to:', path);
  
  return path;
}

// keep stopRecording, playRecorded, stopPlayback same
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
