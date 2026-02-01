import * as Speech from 'expo-speech';
import { Bot, Mic, Send } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Animated as RNAnimated,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../contexts/ThemeContext';
import DashboardLayout from './components/DashboardLayout';

type MessageType = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
};

export default function ChatbotScreen() {
  const { colors, isDark } = useTheme();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: '1',
      text: 'Hi! how can I help you today?',
      sender: 'bot',
    },
  ]);
  const [showIntro, setShowIntro] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  const introAnim = useRef(new RNAnimated.Value(1)).current;

  // Animation values for microphone
  const micScale = useSharedValue(1);
  const borderScale = useSharedValue(1);
  const borderOpacity = useSharedValue(0.3);
  const ring1Scale = useSharedValue(1);
  const ring1Opacity = useSharedValue(0);
  const ring2Scale = useSharedValue(1);
  const ring2Opacity = useSharedValue(0);
  const [isListening, setIsListening] = useState(false);

  const animatedMicStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: micScale.value }],
    };
  });

  const animatedBorderStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: borderScale.value }],
      opacity: borderOpacity.value,
    };
  });

  const animatedRing1Style = useAnimatedStyle(() => {
    return {
      transform: [{ scale: ring1Scale.value }],
      opacity: ring1Opacity.value,
    };
  });

  const animatedRing2Style = useAnimatedStyle(() => {
    return {
      transform: [{ scale: ring2Scale.value }],
      opacity: ring2Opacity.value,
    };
  });

  const startMicIdleAnimation = () => {
    // Gentle idle pulse
    borderScale.value = withRepeat(
      withSequence(
        withDelay(300, withTiming(1.03, { 
          duration: 1800, 
          easing: Easing.bezier(0.4, 0, 0.2, 1) 
        })),
        withTiming(1, { 
          duration: 1800, 
          easing: Easing.bezier(0.4, 0, 0.2, 1) 
        })
      ),
      -1,
      true
    );
    
    borderOpacity.value = withRepeat(
      withSequence(
        withDelay(300, withTiming(0.5, { duration: 900 })),
        withTiming(0.3, { duration: 900 })
      ),
      -1,
      true
    );
  };

  const startMicActiveAnimation = () => {
    // Stronger active pulse with faster timing
    borderScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { 
          duration: 500, 
          easing: Easing.bezier(0.4, 0, 0.2, 1) 
        }),
        withTiming(1, { 
          duration: 500, 
          easing: Easing.bezier(0.4, 0, 0.2, 1) 
        })
      ),
      -1,
      true
    );
    
    borderOpacity.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: 500 }),
        withTiming(0.7, { duration: 500 })
      ),
      -1,
      true
    );
    
    // Dual ring effect
    ring1Scale.value = withRepeat(
      withSequence(
        withTiming(1.4, { 
          duration: 1200, 
          easing: Easing.bezier(0.4, 0, 0.2, 1) 
        }),
        withTiming(1, { duration: 100 })
      ),
      -1,
      false
    );
    
    ring1Opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 800 }),
        withTiming(0, { duration: 400 })
      ),
      -1,
      false
    );
    
    ring2Scale.value = withDelay(300, withRepeat(
      withSequence(
        withTiming(1.4, { 
          duration: 1200, 
          easing: Easing.bezier(0.4, 0, 0.2, 1) 
        }),
        withTiming(1, { duration: 100 })
      ),
      -1,
      false
    ));
    
    ring2Opacity.value = withDelay(300, withRepeat(
      withSequence(
        withTiming(0.3, { duration: 800 }),
        withTiming(0, { duration: 400 })
      ),
      -1,
      false
    ));
  };

  const stopMicAnimation = () => {
    borderScale.value = withTiming(1, { duration: 300 });
    borderOpacity.value = withTiming(0.3, { duration: 300 });
    ring1Scale.value = withTiming(1, { duration: 200 });
    ring1Opacity.value = withTiming(0, { duration: 200 });
    ring2Scale.value = withTiming(1, { duration: 200 });
    ring2Opacity.value = withTiming(0, { duration: 200 });
  };

  // Start gentle idle animation on mount
  useEffect(() => {
    startMicIdleAnimation();
  }, []);

  const handleTapPress = () => {
    // Quick compression feedback
    micScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 150, easing: Easing.bezier(0.4, 0, 0.2, 1) })
    );
  };

  const handleTapRelease = () => {
    // Restore scale
    micScale.value = withTiming(1, { duration: 200 });
  };

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

  // Array of more human-like responses
  const getHumanLikeResponse = (input: string = ''): string => {
    const greetings = [
      "Hey there! How can I assist you today?",
      "Hi! I'm here to help. What do you need?",
      "Hello! What can I do for you?",
      "Good to hear from you! How can I help?",
      "Hi there! What brings you here today?"
    ];

    const acknowledgments = [
      "That makes sense. Tell me more!",
      "I understand. What else can I help with?",
      "Thanks for sharing that with me.",
      "Got it! Is there anything else?",
      "I see. How else can I assist you?"
    ];

    const helpfulResponses = [
      "I'd be happy to help you with that!",
      "Sure thing! Let me see what I can do.",
      "Absolutely! I'm here for that.",
      "Great question! Let me think...",
      "I'm glad you asked about that."
    ];

    const fallbackResponses = [
      "I'm still learning, but I'm here to help in any way I can!",
      "Hmm, let me see if I can assist with that.",
      "I appreciate you reaching out. How else can I help?",
      "I'm working on improving every day. What else would you like to know?",
      "Thanks for your patience as I continue to learn and grow!"
    ];

    // Check for greeting keywords
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('hi') || lowerInput.includes('hello') || lowerInput.includes('hey')) {
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    // Check for thank you keywords
    if (lowerInput.includes('thank') || lowerInput.includes('thanks')) {
      return "You're welcome! Is there anything else I can help with?";
    }

    // Check for question keywords
    if (lowerInput.includes('?') || lowerInput.includes('what') || lowerInput.includes('how') || lowerInput.includes('when')) {
      return helpfulResponses[Math.floor(Math.random() * helpfulResponses.length)];
    }

    // Default to acknowledgment or fallback
    if (Math.random() > 0.5) {
      return acknowledgments[Math.floor(Math.random() * acknowledgments.length)];
    } else {
      return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    }
  };

  const handleMicPress = async () => {
    handleTapPress();
    
    // Start animation
    setIsListening(true);
    startMicActiveAnimation();

    // Simulate processing time
    setTimeout(async () => {
      const botResponseText = getHumanLikeResponse();

      // Speak the message
      await speakMessage(botResponseText);

      // Add bot response as text
      const botResponse: MessageType = {
        id: Date.now().toString(),
        text: botResponseText,
        sender: 'bot',
      };
      setMessages(prev => [...prev, botResponse]);

      // Hide intro on first user interaction
      if (showIntro) {
        RNAnimated.timing(introAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setShowIntro(false);
        });
      }

      // Stop animation after a delay
      setTimeout(() => {
        setIsListening(false);
        stopMicAnimation();
        setTimeout(() => {
          startMicIdleAnimation();
        }, 300);
      }, 1000);
    }, 1000); // Simulate processing time
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

    // Hide intro on first user interaction
    if (showIntro) {
      RNAnimated.timing(introAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowIntro(false);
      });
    }

    // Simulate bot response after a short delay
    setTimeout(() => {
      const botResponseText = getHumanLikeResponse(message);
      const botResponse: MessageType = {
        id: (Date.now() + 1).toString(),
        text: botResponseText,
        sender: 'bot',
      };
      setMessages(prev => [...prev, botResponse]);

      // Speak the response
      speakMessage(botResponseText);
    }, 500);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const renderMessageBubble = (msg: MessageType) => {
    const isUser = msg.sender === 'user';

    return (
      <View
        key={msg.id}
        style={[
          styles.messageContainer,
          { alignSelf: isUser ? 'flex-end' : 'flex-start' }
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userMessageBubble : styles.botMessageBubble,
          ]}
        >
          <Text style={[
            styles.messageText,
            isUser ? styles.userMessageText : styles.botMessageText
          ]}>
            {msg.text}
          </Text>
        </View>
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
          <ScrollView 
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* AI Profile Section - Conditional */}
            {showIntro && (
              <RNAnimated.View 
                style={[
                  styles.botProfileContainer,
                  {
                    opacity: introAnim,
                    transform: [{
                      translateY: introAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-20, 0]
                      })
                    }]
                  }
                ]}
              >
                <View style={styles.botIconCircle}>
                  <Bot color="#2196F3" size={40} />
                </View>
                <Text style={styles.botName}>Dugtong Bot</Text>
              </RNAnimated.View>
            )}

            {/* Big Modern Talk Icon - Conditional */}
            {showIntro && (
              <RNAnimated.View 
                style={[
                  styles.talkSection,
                  {
                    opacity: introAnim,
                    transform: [{
                      translateY: introAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-30, -10]
                      })
                    }]
                  }
                ]}
              >
                <TouchableOpacity
                  style={styles.bigTalkButton}
                  onPressIn={handleTapPress}
                  onPressOut={handleTapRelease}
                  onPress={handleMicPress}
                  activeOpacity={1}
                >
                  {/* Dual ring effect for active state */}
                  <Animated.View style={[
                    styles.ringContainer, 
                    animatedRing1Style,
                    { borderColor: colors.primary }
                  ]} />
                  <Animated.View style={[
                    styles.ringContainer, 
                    animatedRing2Style,
                    { borderColor: colors.primary }
                  ]} />
                  
                  {/* Main border animation */}
                  <Animated.View style={[
                    styles.borderAnimationContainer, 
                    animatedBorderStyle,
                    { 
                      borderColor: colors.primary,
                      shadowColor: colors.primary,
                    }
                  ]} />
                  
                  {/* Microphone container with bounce animation */}
                  <Animated.View style={[styles.micContainer, animatedMicStyle]}>
                    <Mic color="#FFF" size={48} strokeWidth={1.5} />
                  </Animated.View>
                </TouchableOpacity>
                <Text style={[
                  styles.talkSubtext,
                  isDark && styles.darkTalkSubtext
                ]}>
                  Tap to speak
                </Text>
              </RNAnimated.View>
            )}

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
              activeOpacity={0.8}
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
    paddingTop: 10, // Reduced top padding
    minHeight: '100%',
  },
  botProfileContainer: {
    alignItems: 'center',
    marginBottom: 20, // Reduced margin
  },
  botIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginTop: 70,
  },
  botName: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '500',
    color: colors.text,
  },
  talkSection: {
    alignItems: 'center',
    marginVertical: 30, // Reduced vertical margin
    marginTop: 20, // Moved upward
  },
  bigTalkButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    position: 'relative', // For border animation positioning
  },
  borderAnimationContainer: {
    position: 'absolute',
    width: 140, // Slightly larger than the button
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    backgroundColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  ringContainer: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  talkSubtext: {
    marginTop: 15,
    color: colors.secondaryText,
    fontSize: 14,
    fontWeight: '400',
  },
  darkTalkSubtext: {
    color: '#FFFFFF', // White text for dark mode
    opacity: 0.9,
  },
  micContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  messageContainer: {
    marginBottom: 10,
    maxWidth: '90%',
  },
  messageBubble: {
    padding: 16,
    borderRadius: 20,
    maxWidth: '90%',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  botMessageBubble: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
    alignSelf: 'flex-start',
    marginRight: 50, // Add space on the right for alignment
  },
  userMessageBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
    alignSelf: 'flex-end',
    marginLeft: 50, // Add space on the left for alignment
  },
  messageText: {
    color: colors.text,
    lineHeight: 22,
    fontSize: 16,
  },
  botMessageText: {
    color: colors.text,
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
    marginTop: -20,
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
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
});