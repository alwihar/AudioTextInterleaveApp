import React, { useContext } from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';

import { LanguageContext, Language } from '@/contexts/LanguageContext';

const Header: React.FC = () => {
    const { language, setLanguage } = useContext(LanguageContext);

    const handleLanguageChange = (lang: Language) => {
        setLanguage(lang);
    };

    return (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => handleLanguageChange('en')}>
                <Image
                    source={require('../assets/images/en_flag.png')}
                    style={[
                        styles.flag,
                        language === 'en' && styles.selectedFlag,
                    ]}
                />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleLanguageChange('es')}>
                <Image
                    source={require('../assets/images/es_flag.png')}
                    style={[
                        styles.flag,
                        language === 'es' && styles.selectedFlag,
                    ]}
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
        paddingBottom: 20
    },
    flag: {
        width: 25,
        height: 25,
        marginHorizontal: 10,
        opacity: 0.5,
        borderRadius: 12.5,
        overflow: 'hidden'
    },
    selectedFlag: {
        opacity: 1
    },
});

export default Header;
