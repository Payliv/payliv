import React, { useState, useRef, useEffect } from 'react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Avatar } from '@/components/ui/avatar';
    import { MessageSquare, Send, User, X } from 'lucide-react';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useToast } from "@/components/ui/use-toast";
    import ReactMarkdown from 'react-markdown';
    import InfoCollectionModal from './InfoCollectionModal';

    const TypingIndicator = () => (
      <div className="flex items-center space-x-1">
        <span className="typing-dot"></span>
        <span className="typing-dot" style={{ animationDelay: '0.2s' }}></span>
        <span className="typing-dot" style={{ animationDelay: '0.4s' }}></span>
      </div>
    );

    export default function AIChatbot() {
        const [isOpen, setIsOpen] = useState(false);
        const [messages, setMessages] = useState([]);
        const [input, setInput] = useState('');
        const [isLoading, setIsLoading] = useState(false);
        const { toast } = useToast();
        const messagesEndRef = useRef(null);
        
        const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
        const [firstUserMessage, setFirstUserMessage] = useState(null);

        const assistantImageUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/f45ec920-5a38-4fed-b465-6d4a9876f706/5cfcd2eba63b50b19fc4f6c407436af3.jpg";

        const scrollToBottom = () => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        };

        useEffect(() => {
            scrollToBottom();
        }, [messages, isLoading]);
        
        const continueConversation = async (initialMessages) => {
            setIsLoading(true);
            try {
                setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

                const response = await supabase.functions.invoke('ai-chat-handler', {
                    body: { messages: initialMessages },
                });

                if (response.error) throw response.error;
                if (!response.data || !response.data.body) throw new Error("No response body from function");

                const reader = response.data.body.getReader();
                const decoder = new TextDecoder();
                
                let buffer = '';
                let finalAssistantReply = '';
                
                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const dataStr = line.substring(6).trim();
                            if (dataStr === '[DONE]') {
                                setIsLoading(false);
                                return;
                            }
                            try {
                                const data = JSON.parse(dataStr);
                                const delta = data.choices[0]?.delta?.content;
                                if (delta) {
                                    finalAssistantReply += delta;
                                    setMessages(prev => {
                                        const newMessages = [...prev];
                                        const lastMessage = newMessages[newMessages.length - 1];
                                        if (lastMessage && lastMessage.role === 'assistant') {
                                            lastMessage.content = finalAssistantReply;
                                        }
                                        return newMessages;
                                    });
                                }
                            } catch (e) {
                                console.error('Failed to parse SSE chunk:', dataStr, e);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error("Chatbot error:", error);
                const errorMessage = "Désolé, une erreur est survenue. L'équipe technique est informée.";
                 setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage && lastMessage.role === 'assistant' && lastMessage.content === '') {
                        lastMessage.content = errorMessage;
                    }
                    return newMessages;
                });
                toast({ variant: "destructive", title: "Erreur de l'assistant", description: errorMessage });
            } finally {
                setIsLoading(false);
            }
        };

        const handleSend = async () => {
            if (input.trim() === '' || isLoading) return;
            const userMessage = { role: 'user', content: input };
            setMessages(prev => [...prev, userMessage]);
            setInput('');
            
            if (messages.length === 0) {
              setFirstUserMessage(userMessage);
              setIsInfoModalOpen(true);
            } else {
              continueConversation([...messages, userMessage]);
            }
        };

        const handleInfoSubmit = async (userInfo) => {
            setIsInfoModalOpen(false);
            toast({
              title: "Informations reçues",
              description: "Merci ! Linda va maintenant répondre à votre question.",
            });

            try {
                const { error } = await supabase.functions.invoke('send-chat-transcript', {
                    body: { ...userInfo, firstMessage: firstUserMessage?.content },
                });
                if (error) throw error;
            } catch (error) {
                console.error('Failed to send transcript:', error);
                toast({
                  variant: "destructive",
                  title: "Erreur d'envoi",
                  description: "Impossible d'envoyer la transcription pour le moment.",
                });
            }
            
            continueConversation([firstUserMessage]);
        };

        return (
            <>
                <InfoCollectionModal 
                  isOpen={isInfoModalOpen}
                  onClose={() => setIsInfoModalOpen(false)}
                  onSubmit={handleInfoSubmit}
                />
                <motion.div
                    initial={{ scale: 0, y: 50 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ delay: 1, type: 'spring', stiffness: 200 }}
                    className="fixed bottom-6 right-6 z-50"
                >
                    <Button
                        onClick={() => setIsOpen(true)}
                        className="rounded-full w-16 h-16 bg-primary shadow-lg hover:bg-primary/90 flex items-center justify-center"
                    >
                         <MessageSquare className="w-8 h-8 text-primary-foreground" />
                    </Button>
                </motion.div>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 50, scale: 0.9 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="fixed bottom-24 right-6 z-50 w-[90vw] max-w-sm h-[70vh] max-h-[600px] bg-card rounded-2xl shadow-2xl border flex flex-col"
                        >
                            <header className="p-4 border-b flex justify-between items-center bg-muted/40">
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-10 h-10 border-2 border-green-500">
                                      <img  alt="Linda Traore, assistante PayLiv" src={assistantImageUrl} />
                                    </Avatar>
                                    <div>
                                      <h3 className="font-bold text-lg">Linda Traore</h3>
                                      <p className="text-xs text-green-500 flex items-center gap-1">
                                        <span className="relative flex h-2 w-2">
                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                        </span>
                                        En ligne
                                      </p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                                    <X className="w-5 h-5" />
                                </Button>
                            </header>

                            <div className="flex-1 p-4 overflow-y-auto">
                                <div className="space-y-4">
                                  {messages.length === 0 && (
                                    <div className="text-center text-muted-foreground p-8">
                                      <MessageSquare className="mx-auto w-12 h-12 mb-4 text-primary/50" />
                                      <p className="font-medium">Posez votre première question</p>
                                      <p className="text-sm">Linda Traoré est là pour vous aider.</p>
                                    </div>
                                  )}
                                    {messages.map((msg, index) => (
                                        <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                            {msg.role === 'assistant' && (
                                              <Avatar className="w-8 h-8 flex-shrink-0">
                                                <img  alt="Avatar de Linda Traore" src={assistantImageUrl} />
                                              </Avatar>
                                            )}
                                            <div className={`px-4 py-2 rounded-2xl max-w-xs prose prose-sm dark:prose-invert break-words ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'}`}>
                                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                                            </div>
                                            {msg.role === 'user' && (
                                              <Avatar className="w-8 h-8 flex-shrink-0 bg-muted">
                                                <User className="w-5 h-5 text-muted-foreground m-auto"/>
                                              </Avatar>
                                            )}
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex items-start gap-3">
                                            <Avatar className="w-8 h-8 flex-shrink-0">
                                              <img  alt="Avatar de Linda Traore" src={assistantImageUrl} />
                                            </Avatar>
                                            <div className="px-4 py-3 rounded-2xl bg-muted rounded-bl-none">
                                                <TypingIndicator />
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>

                            <footer className="p-4 border-t">
                                <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2">
                                    <Input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Posez votre question..."
                                        disabled={isLoading}
                                        className="rounded-full"
                                    />
                                    <Button type="submit" disabled={isLoading || !input.trim()} className="rounded-full w-10 h-10" size="icon">
                                        <Send className="w-5 h-5" />
                                    </Button>
                                </form>
                            </footer>
                        </motion.div>
                    )}
                </AnimatePresence>
            </>
        );
    }