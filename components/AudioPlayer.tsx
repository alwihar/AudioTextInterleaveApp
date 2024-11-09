import React, { useEffect, useRef } from 'react';
import {
    Audio,
    AVPlaybackStatus,
    AVPlaybackStatusSuccess,
    InterruptionModeIOS,
    InterruptionModeAndroid,
} from 'expo-av';

import transcriptData from '../data/transcript.json';

type Phrase = {
    words: {
        en: string;
        es: string;
    };
    time: number;
    speaker: string;
    startTime: number;
    endTime: number;
};

type AudioPlayerProps = {
    setCurrentPhraseIndex: (index: number) => void;
    isPlaying: boolean;
    setSoundObject: (sound: Audio.Sound) => void;
    setPhrases: (phrases: Phrase[]) => void;
    setCurrentTime: (time: number) => void;
    setDuration: (duration: number) => void;
    setIsPlaying: (playing: boolean) => void;
};

const AudioPlayer: React.FC<AudioPlayerProps> = ({
                                                     setCurrentPhraseIndex,
                                                     isPlaying,
                                                     setSoundObject,
                                                     setPhrases,
                                                     setCurrentTime,
                                                     setDuration,
                                                     setIsPlaying,
                                                 }) => {
    const soundRef = useRef<Audio.Sound | null>(null);

    useEffect(() => {
        let isMounted = true;

        const initializeAudio = async () => {
            try {
                // Activate the audio session
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: false,
                    staysActiveInBackground: false,
                    interruptionModeIOS: InterruptionModeIOS.DoNotMix,
                    playsInSilentModeIOS: true,
                    shouldDuckAndroid: true,
                    interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
                    playThroughEarpieceAndroid: false,
                });

                // Load the audio and set up playback
                const { sound: loadedSound } = await Audio.Sound.createAsync(
                    require('../assets/example_audio.mp3'),
                    { shouldPlay: false }
                );

                if (isMounted) {
                    soundRef.current = loadedSound;
                    setSoundObject(loadedSound);

                    // Prepare phrases with timing
                    const interleavedPhrases: Phrase[] = [];
                    const speakers = transcriptData.speakers;
                    const pauseDuration = transcriptData.pause;
                    const maxLength = Math.max(...speakers.map((s: any) => s.phrases.length));
                    let cumulativeTime = 0;

                    for (let i = 0; i < maxLength; i++) {
                        for (const speaker of speakers) {
                            if (speaker.phrases[i]) {
                                const phrase: Phrase = {
                                    words: speaker.phrases[i].words,
                                    time: speaker.phrases[i].time,
                                    speaker: speaker.name,
                                    startTime: cumulativeTime,
                                    endTime: cumulativeTime + speaker.phrases[i].time,
                                };
                                interleavedPhrases.push(phrase);
                                cumulativeTime += speaker.phrases[i].time + pauseDuration;
                            }
                        }
                    }
                    setPhrases(interleavedPhrases);

                    loadedSound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
                        if (!isMounted) return;

                        if (status.isLoaded) {
                            const playbackStatus = status as AVPlaybackStatusSuccess;
                            const currentTime = playbackStatus.positionMillis;
                            const duration = playbackStatus.durationMillis || 0;
                            setDuration(duration);
                            setCurrentTime(currentTime);

                            // Update current phrase index
                            const index = interleavedPhrases.findIndex(
                                (phrase) =>
                                    currentTime >= phrase.startTime && currentTime <= phrase.endTime
                            );
                            if (index !== -1) {
                                setCurrentPhraseIndex(index);
                            }
                            if (playbackStatus.didJustFinish) {
                                setIsPlaying(false);
                            }
                        } else {
                            console.error('Playback status error:', status);
                        }
                    });
                }
            } catch (error) {
                console.error('Error initializing audio:', error);
            }
        };
        initializeAudio();
        return () => {
            isMounted = false;
            if (soundRef.current) {
                soundRef.current.unloadAsync().catch((error) => {
                    console.error('Error unloading sound:', error);
                });
            }
        };
    }, []);

    useEffect(() => {
        const controlPlayback = async () => {
            const soundObject = soundRef.current;
            if (!soundObject) return;
            try {
                const status = await soundObject.getStatusAsync();
                if (!status.isLoaded) {
                    console.warn('Sound is not loaded yet');
                    return;
                }
                if (isPlaying) {
                    await soundObject.playAsync();
                } else {
                    await soundObject.pauseAsync();
                }
            } catch (error) {
                console.error('Error in controlPlayback:', error);
            }
        };
        controlPlayback();
    }, [isPlaying]);

    return null;
};

export default AudioPlayer;
