import * as Speech from 'expo-speech';
import { Bot, Mic, Send } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import DashboardLayout from './components/DashboardLayout';

type MessageType = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
};

export default function ChatbotScreen() {
  const { colors } = useTheme();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: '1',
      text: 'Hi! how can I help you today?',
      sender: 'bot',
    },
  ]);
  const styles = createStyles(colors);

  const speakMessage = async (text: string) => {
    try {
      await Speech.speak(text, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.9,
      });
    } catch (error) {
      console.error('Speech error:', error);
    }
  };

  const handleMicPress = async () => {
    const unavailableMessage = 'Dugtong Bot is not available right now';
    
    // Speak the message
    await speakMessage(unavailableMessage);
    
    // Add bot response as text
    const botResponse: MessageType = {
      id: Date.now().toString(),
      text: unavailableMessage,
      sender: 'bot',
    };
    setMessages(prev => [...prev, botResponse]);
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Add user message
    const userMessage: MessageType = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    
    // Simulate bot response after a short delay
    setTimeout(() => {
      const unavailableMessage = 'Dugtong Bot is not available right now';
      const botResponse: MessageType = {
        id: (Date.now() + 1).toString(),
        text: unavailableMessage,
        sender: 'bot',
      };
      setMessages(prev => [...prev, botResponse]);
      
      // Speak the response
      speakMessage(unavailableMessage);
    }, 500);
  };

  const renderMessageBubble = (msg: MessageType) => {
    const isUser = msg.sender === 'user';
    
    return (
      <View
        key={msg.id}
        style={[
          styles.messageBubble,
          isUser ? styles.userMessageBubble : styles.botMessageBubble,
        ]}
      >
        <Text style={[
          styles.messageText,
          isUser && styles.userMessageText
        ]}>
          {msg.text}
        </Text>
      </View>
    );
  };

  return (
    <DashboardLayout>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* AI Profile Section */}
            <View style={styles.botProfileContainer}>
              <View style={styles.botIconCircle}>
                <Bot color="#2196F3" size={40} />
              </View>
              <Text style={styles.botName}>Dugtong</Text>
            </View>

            {/* Big Modern Talk Icon */}
            <View style={styles.talkSection}>
              <TouchableOpacity 
                style={styles.bigTalkButton}
                onPress={handleMicPress}
              >
                <Mic color="#FFF" size={48} strokeWidth={1.5} />
              </TouchableOpacity>
              <Text style={styles.talkSubtext}>Tap to speak to Dugtong</Text>
            </View>

            {/* Chat Messages */}
            {messages.map(renderMessageBubble)}
          </ScrollView>

          {/* Input Footer */}
          <View style={styles.footer}>
            <TextInput
              style={styles.input}
              placeholder="Type something to send..."
              value={message}
              onChangeText={setMessage}
              placeholderTextColor="#999"
              onSubmitEditing={handleSendMessage}
              returnKeyType="send"
              blurOnSubmit={false}
            />
            <TouchableOpacity 
              style={styles.sendButton}
              onPress={handleSendMessage}
            >
              <Send color="#FFF" size={20} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </DashboardLayout>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: 20,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  botProfileContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  botIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  botName: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '500',
    color: colors.text,
  },
  talkSection: {
    alignItems: 'center',
    marginVertical: 40,
  },
  bigTalkButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  talkSubtext: {
    marginTop: 15,
    color: colors.secondaryText,
    fontSize: 14,
    fontWeight: '400',
  },
  messageBubble: {
    padding: 15,
    borderRadius: 15,
    maxWidth: '90%',
    marginBottom: 10,
  },
  botMessageBubble: {
    backgroundColor: colors.inputBackground,
    borderBottomLeftRadius: 2,
    alignSelf: 'flex-start',
  },
  userMessageBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 2,
    alignSelf: 'flex-end',
  },
  messageText: {
    color: colors.text,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 45,
    paddingHorizontal: 15,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});