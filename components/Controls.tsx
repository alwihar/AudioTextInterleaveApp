import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Image } from 'react-native';

type ControlsProps = {
    isPlaying: boolean;
    onPlayPause: () => void;
    onRewind: () => void;
    onForward: () => void;
    currentTime: number;
    duration: number;
};

const Controls: React.FC<ControlsProps> = ({
                                               isPlaying,
                                               onPlayPause,
                                               onRewind,
                                               onForward,
                                               currentTime,
                                               duration
                                           }) => {
    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const elapsedTime = formatTime(currentTime);
    const totalDuration = formatTime(duration);
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <View style={styles.controlsContainer}>
            <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>
            <View style={styles.timeContainer}>
                <Text style={styles.timeText}>{elapsedTime}</Text>
                <Text style={styles.timeText}>{totalDuration}</Text>
            </View>
            <View style={styles.buttonsContainer}>
                <TouchableOpacity onPress={onRewind} style={styles.iconButton}>
                    <Image
                        source={require('../assets/icons/rewind.png')}
                        style={styles.iconImage}
                    />
                </TouchableOpacity>
                <TouchableOpacity onPress={onPlayPause} style={styles.playButton}>
                    <Image
                        source={
                            isPlaying
                                ? require('../assets/icons/pause.png')
                                : require('../assets/icons/play.png')
                        }
                        style={styles.iconImage}
                    />
                </TouchableOpacity>
                <TouchableOpacity onPress={onForward} style={styles.iconButton}>
                    <Image
                        source={require('../assets/icons/forward.png')}
                        style={styles.iconImage}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    controlsContainer: {
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF'
    },
    progressBarContainer: {
        height: 4,
        backgroundColor: '#ECEEFF',
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 10
    },
    progressBar: {
        height: 4,
        backgroundColor: '#DBA604'
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10
    },
    timeText: {
        fontSize: 12,
        color: '#000000'
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
        gap: 20
    },
    iconButton: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    playButton: {
        backgroundColor: '#E1E4FF',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center'
    },
    iconImage: {
        width: 24,
        height: 24
    },
});

export default Controls;
