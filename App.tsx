import React, { useState } from 'react';
import { View, Button, Text, StyleSheet, Platform, NativeModules } from 'react-native';
import AudioRecorder from './src/audio';
import { check, Permission, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
const { AudioRecorderModule } = NativeModules;
export default function App() {
  const [recording, setRecording] = useState(false);
  const [recordedPath, setRecordedPath] = useState(null);
  const [playing, setPlaying] = useState(false);


async function requestMicPermission() {
  let permission: Permission;

  if (Platform.OS === 'ios') {
    permission = PERMISSIONS.IOS.MICROPHONE;
  } else {
    permission = PERMISSIONS.ANDROID.RECORD_AUDIO;
  }

  const status = await check(permission);

  if (status === RESULTS.GRANTED) {
    return true;
  }

  const newStatus = await request(permission);
  return newStatus === RESULTS.GRANTED;
}



  const onStart = async () => {

    try {
    const allowed = await requestMicPermission();
    if (!allowed) {
      console.log('Microphone permission denied');
      return;
    }
      const path = await AudioRecorder.startRecording('test_record.m4a');
      setRecordedPath(path);
      setRecording(true);
    } catch (e) {
      console.error('Start recording error:', e);
    }
  };

  const onStop = async () => {
    try {
      const path = await AudioRecorder.stopRecording();
      setRecordedPath(path);
      setRecording(false);
    } catch (e) {
      console.error('Stop recording error:', e);
    }
  };

  const onPlay = async () => {
    if (!recordedPath) return;
    try {
      await AudioRecorder.playRecorded(recordedPath);
      setPlaying(true);
    } catch (e) {
      console.error('Play error:', e);
    }
  };

  const onStopPlay = async () => {
    try {
      await AudioRecorder.stopPlayback();
      setPlaying(false);
    } catch (e) {
      console.error('Stop playback error:', e);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Recording: {recording ? 'Yes' : 'No'}</Text>
      <Button title="Start Recording" onPress={onStart} disabled={recording} />
      <Button title="Stop Recording" onPress={onStop} disabled={!recording} />
      <Text>Saved at: {recordedPath || 'None'}</Text>

      <View style={{ marginTop: 20 }}>
        <Text>Playing: {playing ? 'Yes' : 'No'}</Text>
        <Button title="Play" onPress={onPlay} disabled={playing || !recordedPath} />
        <Button title="Stop Playing" onPress={onStopPlay} disabled={!playing} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
