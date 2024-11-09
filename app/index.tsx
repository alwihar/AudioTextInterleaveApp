import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Audio, AVPlaybackStatus, AVPlaybackStatusSuccess } from 'expo-av';

import Transcript from '../components/Transcript';
import Controls from '../components/Controls';
import AudioPlayer from '../components/AudioPlayer';

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

const MainScreen: React.FC = () => {
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [soundObject, setSoundObject] = useState<Audio.Sound | null>(null);
    const [phrases, setPhrases] = useState<Phrase[]>([]);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const playPause = async () => {
        if (isPlaying) {
            setIsPlaying(false);
        } else {
            if (currentTime >= duration) {
                if (soundObject) {
                    await soundObject.setPositionAsync(0);
                    setCurrentPhraseIndex(0);
                }
            }
            setIsPlaying(true);
        }
    };

    const rewind = async () => {
        if (soundObject && phrases.length > 0) {
            const status: AVPlaybackStatus = await soundObject.getStatusAsync();

            if (!status.isLoaded) {
                console.error('Sound is not loaded');
                return;
            }

            const playbackStatus = status as AVPlaybackStatusSuccess;
            const currentTime = playbackStatus.positionMillis || 0;

            const currentIndex = phrases.findIndex(
                (phrase) =>
                    currentTime >= phrase.startTime && currentTime <= phrase.endTime
            );

            if (currentIndex === -1) {
                // If current time doesn't match any phrase, reset to the beginning
                await soundObject.setPositionAsync(0);
                setCurrentPhraseIndex(0);
                return;
            }

            const currentPhrase = phrases[currentIndex];
            const timeIntoPhrase = currentTime - currentPhrase.startTime;

            if (timeIntoPhrase > 1000) {
                await soundObject.setPositionAsync(currentPhrase.startTime);
            } else {
                const previousIndex = currentIndex > 0 ? currentIndex - 1 : 0;
                await soundObject.setPositionAsync(phrases[previousIndex].startTime);
                setCurrentPhraseIndex(previousIndex);
            }
        }
    };

    const forward = async () => {
        if (soundObject && phrases.length > 0) {
            const status: AVPlaybackStatus = await soundObject.getStatusAsync();

            if (!status.isLoaded) {
                console.error('Sound is not loaded');
                return;
            }

            const playbackStatus = status as AVPlaybackStatusSuccess;
            const currentTime = playbackStatus.positionMillis || 0;

            const currentIndex = phrases.findIndex(
                (phrase) =>
                    currentTime >= phrase.startTime && currentTime <= phrase.endTime
            );

            if (currentIndex === -1) {
                await soundObject.setPositionAsync(0);
                setCurrentPhraseIndex(0);
                return;
            }

            const nextIndex =
                currentIndex < phrases.length - 1 ? currentIndex + 1 : 0; // Loop back to first phrase

            await soundObject.setPositionAsync(phrases[nextIndex].startTime);
            setCurrentPhraseIndex(nextIndex);
        }
    };

    const handlePhrasePress = async (index: number) => {
        if (soundObject && phrases.length > index) {
            await soundObject.setPositionAsync(phrases[index].startTime);
            setCurrentPhraseIndex(index);
            setIsPlaying(true);
        }
    };

    return (
        <View style={styles.container}>
            <Transcript
                currentPhraseIndex={currentPhraseIndex}
                onPhrasePress={handlePhrasePress}
            />
            <Controls
                isPlaying={isPlaying}
                onPlayPause={playPause}
                onRewind={rewind}
                onForward={forward}
                currentTime={currentTime}
                duration={duration}
            />
            <AudioPlayer
                setCurrentPhraseIndex={setCurrentPhraseIndex}
                isPlaying={isPlaying}
                setSoundObject={setSoundObject}
                setPhrases={setPhrases}
                setCurrentTime={setCurrentTime}
                setDuration={setDuration}
                setIsPlaying={setIsPlaying}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
});

export default MainScreen;
