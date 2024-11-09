import React, { useEffect, useState, useContext, useRef } from 'react';
import {ScrollView, Text, StyleSheet, View, LayoutChangeEvent, TouchableOpacity, NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { LanguageContext } from '@/contexts/LanguageContext';
import transcriptData from '../data/transcript.json';

type Phrase = {
    words: {
        en: string;
        es: string;
    };
    time: number;
    speaker: string;
    startTime?: number;
    endTime?: number;
};

const Transcript: React.FC<{ currentPhraseIndex: number; onPhrasePress: (index: number) => void }> = ({
  currentPhraseIndex,
  onPhrasePress,
}) => {
    const { language } = useContext(LanguageContext);
    const [phrases, setPhrases] = useState<Phrase[]>([]);
    const scrollViewRef = useRef<ScrollView>(null);
    const phraseRefs = useRef<Array<View | null>>([]);
    const [contentHeight, setContentHeight] = useState(0);
    const [scrollViewHeight, setScrollViewHeight] = useState(0);
    const [showTopGradient, setShowTopGradient] = useState(false);
    const [showBottomGradient, setShowBottomGradient] = useState(true);

    useEffect(() => {
        if (phrases.length > currentPhraseIndex && contentHeight > 0) {
            phraseRefs.current[currentPhraseIndex]?.measureLayout(
                scrollViewRef.current!.getInnerViewNode(),
                (x, y, width, height) => {
                    const scrollPosition = y + height / 2 - scrollViewHeight / 2;
                    const maxScroll = contentHeight - scrollViewHeight;
                    const clampedScrollPosition = Math.max(
                        0,
                        Math.min(scrollPosition, maxScroll)
                    );

                    scrollViewRef.current?.scrollTo({
                        y: clampedScrollPosition,
                        animated: true,
                    });
                },
                () => console.error('measureLayout error')
            );
        }
    }, [currentPhraseIndex, contentHeight, scrollViewHeight]);

    useEffect(() => {
        const interleavedPhrases: Phrase[] = [];
        const speakers = transcriptData.speakers;
        const maxLength = Math.max(...speakers.map((s: { phrases: string | any[]; }) => s.phrases.length));

        for (let i = 0; i < maxLength; i++) {
            speakers.forEach((speaker: any) => {
                if (speaker.phrases[i]) {
                    const phrase: Phrase = {
                        words: speaker.phrases[i].words,
                        time: speaker.phrases[i].time,
                        speaker: speaker.name,
                    };
                    interleavedPhrases.push(phrase);
                }
            });
        }
        setPhrases(interleavedPhrases);
    }, []);

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={(w, h) => setContentHeight(h)}
                onLayout={(event: LayoutChangeEvent) =>
                    setScrollViewHeight(event.nativeEvent.layout.height)
                }
                onScroll={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
                    const offsetY = event.nativeEvent.contentOffset.y;
                    const contentHeight = event.nativeEvent.contentSize.height;
                    const scrollViewHeight = event.nativeEvent.layoutMeasurement.height;

                    setShowTopGradient(offsetY > 0);

                    const isAtBottom = offsetY + scrollViewHeight >= contentHeight;
                    setShowBottomGradient(!isAtBottom);
                }}
                scrollEventThrottle={16}
            >
                {phrases.map((phrase, index) => {
                    const isCurrent = index === currentPhraseIndex;
                    return (
                        <TouchableOpacity
                            key={index}
                            ref={(el) => (phraseRefs.current[index] = el)}
                            onPress={() => onPhrasePress(index)}
                            activeOpacity={0.7}
                            style={[
                                styles.phraseContainer,
                                isCurrent && styles.currentPhraseContainer,
                            ]}
                        >
                            <Text style={styles.speakerName}>{phrase.speaker}</Text>
                            <View style={styles.phraseTextContainer}>
                                <View style={styles.languageLabel}>
                                    <Text style={styles.languageLabelText}>{language}</Text>
                                </View>
                                <Text
                                    style={[
                                        styles.phraseText,
                                        styles.selectedLanguageText,
                                    ]}
                                >
                                    {phrase.words[language]}
                                </Text>
                            </View>
                            <View style={styles.separatorLine} />
                            <View style={styles.phraseTextContainer}>
                                <View style={styles.languageLabel}>
                                    <Text style={styles.languageLabelText}>
                                        {language === 'en' ? 'es' : 'en'}
                                    </Text>
                                </View>
                                <Text style={styles.phraseText}>
                                    {phrase.words[language === 'en' ? 'es' : 'en']}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
            {showTopGradient && (
                <LinearGradient
                    colors={[
                        'rgba(250, 250, 250, 1)',
                        'rgba(250, 250, 250, 0)',
                    ]}
                    locations={[0, 1]}
                    style={styles.gradientTop}
                    pointerEvents="none"
                />
            )}
            {showBottomGradient && (
                <LinearGradient
                    colors={[
                        'rgba(250, 250, 250, 0)',
                        'rgba(250, 250, 250, 1)',
                    ]}
                    locations={[0, 1]}
                    style={styles.gradientBottom}
                    pointerEvents="none"
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA'
    },
    scrollContent: {
        paddingVertical: 20
    },
    phraseContainer: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#F2EEF6',
        borderRadius: 8,
        padding: 10,
        marginHorizontal: 20,
        marginBottom: 20,
        minHeight: 120,
        justifyContent: 'center'
    },
    currentPhraseContainer: {
        backgroundColor: '#E1E4FF'
    },
    speakerName: {
        fontWeight: 'bold',
        marginBottom: 5
    },
    phraseTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5
    },
    languageLabel: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginRight: 8
    },
    languageLabelText: {
        fontSize: 12,
        color: '#000000'
    },
    phraseText: {
        fontSize: 14,
        color: '#000000'
    },
    selectedLanguageText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#DBA604'
    },
    gradientTop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 300
    },
    gradientBottom: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 300
    },
    separatorLine: {
        borderBottomColor: '#F2EEF6',
        borderBottomWidth: 1,
        marginVertical: 5,
        width: '100%'
    },
});

export default Transcript;
