import React, { useState } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import Header from '../components/Header';
import { LanguageContext, Language } from '@/contexts/LanguageContext';

const Layout: React.FC = () => {
    const [language, setLanguage] = useState<Language>('en');

    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
            <SafeAreaView style={{ flex: 1 }}>
                <Header />
                <Stack
                    screenOptions={{
                        headerShown: false,
                    }}
                />
            </SafeAreaView>
        </LanguageContext.Provider>
    );
};

export default Layout;
