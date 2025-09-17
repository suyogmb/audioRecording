
import Foundation
import AVFoundation

@objc(AudioRecorderModule)
class AudioRecorderModule: NSObject {
    private var recorder: AVAudioRecorder?
    private var player: AVAudioPlayer?      // ← declare player here
    private var audioSession = AVAudioSession.sharedInstance()

    @objc
    func requestPermission(_ resolve: @escaping RCTPromiseResolveBlock,
                           rejecter reject: @escaping RCTPromiseRejectBlock) {
        let status = audioSession.recordPermission
        print("DEBUG: recordPermission status prior = \(status.rawValue)")
        audioSession.requestRecordPermission { granted in
            print("DEBUG: requestRecordPermission granted = \(granted)")
            DispatchQueue.main.async {
                resolve(granted)
            }
        }
    }

    @objc
    func startRecording(_ filename: NSString,
                        resolver resolve: @escaping RCTPromiseResolveBlock,
                        rejecter reject: @escaping RCTPromiseRejectBlock) {
        do {
            try audioSession.setCategory(.playAndRecord, mode: .default, options: [.defaultToSpeaker])
            try audioSession.setActive(true)

            let docs = FileManager.default.temporaryDirectory
            let fileURL = docs.appendingPathComponent(filename as String)

            let settings: [String: Any] = [
                AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
                AVSampleRateKey: 44100,
                AVNumberOfChannelsKey: 1,
                AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue
            ]

            recorder = try AVAudioRecorder(url: fileURL, settings: settings)
            recorder?.prepareToRecord()
            if recorder?.record() == true {
                resolve(fileURL.path)
            } else {
                reject("start_error", "Failed to start recording", nil)
            }
        } catch let error {
            reject("permission_error", error.localizedDescription, error)
        }
    }

    @objc
    func stopRecording(_ resolve: @escaping RCTPromiseResolveBlock,
                       rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard let recorder = recorder, recorder.isRecording else {
            resolve(nil)
            return
        }
        recorder.stop()
        let url = recorder.url
        self.recorder = nil
        do {
            try audioSession.setActive(false)
        } catch {
            // ignoring
        }
        resolve(url.path)
    }

    @objc
    func playRecording(_ filepath: NSString,
                       resolver resolve: @escaping RCTPromiseResolveBlock,
                       rejecter reject: @escaping RCTPromiseRejectBlock) {
        let path = filepath as String
        let url = URL(fileURLWithPath: path)
        do {
            try audioSession.setCategory(.playback, mode: .default, options: [])
            try audioSession.setActive(true)
            
            player = try AVAudioPlayer(contentsOf: url)   // use class-level player
            player?.prepareToPlay()
            player?.play()
            resolve(true)
        } catch let error {
            reject("play_error", error.localizedDescription, error)
        }
    }

    @objc
    func stopPlaying(_ resolve: @escaping RCTPromiseResolveBlock,
                     rejecter reject: @escaping RCTPromiseRejectBlock) {
        if let pl = player, pl.isPlaying {
            pl.stop()
        }
        player = nil
        resolve(true)
    }

    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }
}
