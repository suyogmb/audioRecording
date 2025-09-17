package com.myapp.audiorecorder

import android.media.MediaPlayer
import android.media.MediaRecorder
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File

class AudioRecorderModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private var recorder: MediaRecorder? = null
    private var outputPath: String? = null

    // Add MediaPlayer field
    private var player: MediaPlayer? = null

    override fun getName(): String {
        return "AudioRecorderModule"
    }

    @ReactMethod
    fun startRecording(filename: String, promise: Promise) {
        try {
            val dir = reactContext.cacheDir
            val file = File(dir, filename)
            outputPath = file.absolutePath

            recorder = MediaRecorder().apply {
                setAudioSource(MediaRecorder.AudioSource.MIC)
                setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
                setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
                setAudioSamplingRate(44100)
                setOutputFile(outputPath)
                prepare()
                start()
            }
            promise.resolve(outputPath)
        } catch (e: Exception) {
            recorder?.release()
            recorder = null
            promise.reject("start_error", e.message)
        }
    }

    @ReactMethod
    fun stopRecording(promise: Promise) {
        try {
            recorder?.apply {
                stop()
                release()
            }
            val path = outputPath
            recorder = null
            outputPath = null
            promise.resolve(path)
        } catch (e: Exception) {
            promise.reject("stop_error", e.message)
        }
    }

    @ReactMethod
    fun playRecording(filepath: String, promise: Promise) {
        try {
            // Release any existing player
            player?.release()
            player = MediaPlayer().apply {
                setDataSource(filepath)
                prepare()
                start()
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("play_error", e.message)
        }
    }

    @ReactMethod
    fun stopPlaying(promise: Promise) {
        try {
            player?.apply {
                if (isPlaying) {
                    stop()
                }
                release()
            }
            player = null
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("stop_play_error", e.message)
        }
    }
}
