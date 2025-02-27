import React, { createContext, useState, ReactNode } from 'react';

interface TypingContextProps {
    isTyping: boolean;
    setIsTyping: (isTyping: boolean) => void;
    typingUser: any;
    setTypingUser: (user: any) => void;
}

// Create context with a default value
export const TypingContext = createContext<TypingContextProps>({
    isTyping: false,
    setIsTyping: () => { },
    typingUser: null,
    setTypingUser: () => { },
});

interface TypingProviderProps {
    children: ReactNode;
}

export const TypingProvider: React.FC<TypingProviderProps> = ({ children }) => {
    const [isTyping, setIsTyping] = useState(false);
    const [typingUser, setTypingUser] = useState<any>(null);

    return (
        <TypingContext.Provider value={{ isTyping, setIsTyping, typingUser, setTypingUser }}>
            {children}
        </TypingContext.Provider>
    );
};
