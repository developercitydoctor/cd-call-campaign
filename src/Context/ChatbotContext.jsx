import { createContext, useContext, useState, useCallback } from "react";

const ChatbotContext = createContext(null);

export function ChatbotProvider({ children }) {
    const [isOpen, setIsOpen] = useState(false);

    const openChatbot = useCallback(() => {
        setIsOpen(true);
    }, []);

    const closeChatbot = useCallback(() => {
        setIsOpen(false);
    }, []);

    const toggleChatbot = useCallback(() => {
        setIsOpen((prev) => !prev);
    }, []);

    return (
        <ChatbotContext.Provider value={{ isOpen, setIsOpen, openChatbot, closeChatbot, toggleChatbot }}>
            {children}
        </ChatbotContext.Provider>
    );
}

export function useChatbot() {
    const context = useContext(ChatbotContext);
    if (!context) {
        throw new Error("useChatbot must be used within ChatbotProvider");
    }
    return context;
}
