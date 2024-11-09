import React from 'react';

export type Language = 'en' | 'es';

export type LanguageContextType = {
    language: Language;
    setLanguage: (lang: Language) => void;
};

export const LanguageContext = React.createContext<LanguageContextType>({
    language: 'en',
    setLanguage: () => {},
});
