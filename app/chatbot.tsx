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
import chatbotRules from '../chatbot-rules.json';

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

  // Generate sample analytics and donor data summaries
  const generateAnalyticsSummary = (): string => {
    return `Here's a summary of the analytics data:
    
- Total Donors: 1,245
- Total Contributions: $42,560
- Average Donation: $34.20
- Top Donor: Maria Santos ($2,400)
- Monthly Growth: 12% increase
- Engagement Rate: 78%
- Active Donors: 892`;
  };

  const generateDonorDataSummary = (): string => {
    return `Here's a summary of donor information:
    
- Individual Donors: 980
- Corporate Donors: 265
- Recurring Donors: 456
- New Donors (this month): 42
- Donor Retention Rate: 85%
- Top Donor Categories: Education (35%), Health (28%), Environment (22%)`;
  };

  // Function to check if input matches keywords for a specific rule
  const matchesKeywords = (input: string, keywords: string[]): boolean => {
    const lowerInput = input.toLowerCase();
    return keywords.some(keyword => lowerInput.includes(keyword.toLowerCase()));
  };

  // Function to get a random response template from a rule
  const getRandomResponseTemplate = (rule: any): string => {
    if (!rule.response_templates || rule.response_templates.length === 0) {
      return "I'm not sure how to respond to that.";
    }
    return rule.response_templates[Math.floor(Math.random() * rule.response_templates.length)];
  };

  // Function to process templates with dynamic data
  const processTemplate = (template: string, data: Record<string, string>): string => {
    let processedTemplate = template;
    Object.keys(data).forEach(key => {
      processedTemplate = processedTemplate.replace(new RegExp(`{{${key}}}`, 'g'), data[key]);
    });
    return processedTemplate;
  };

  // OpenRouter API integration with retry mechanism
  const getOpenRouterResponse = async (input: string): Promise<string> => {
    // Retry configuration
    const maxRetries = 3;
    const baseDelay = 1000; // 1 second
    
    // Validate API key first
    if (!process.env.EXPO_PUBLIC_OPEN_ROUTER_API_KEY) {
      console.error('❌ OpenRouter API key is not set');
      return getHumanLikeResponse(input);
    }
    
    const systemPrompt = `You are Dugtong Bot, a helpful assistant for a blood donation app. Use this context about available features:

Analytics Data: ${generateAnalyticsSummary()}
Donor Data: ${generateDonorDataSummary()}

Rules to follow:
- Be helpful and friendly
- Provide relevant information about blood donation, analytics, or donor data when asked
- Keep responses concise and conversational
- If asked about analytics or donor data, use the provided summaries above`;

    // Using a free model that might have rate limits - consider alternatives for production
    const model = 'meta-llama/llama-3.2-3b-instruct:free'; // Alternative: 'google/gemma-2-9b-it:free'
    
    const requestBody = {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: input }
      ],
      max_tokens: 150,
      temperature: 0.7,
    };

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔍 Starting OpenRouter API call (attempt ${attempt + 1})...`);
        console.log('📝 Input:', input);
        
        console.log('📦 Request body:', JSON.stringify(requestBody, null, 2));

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPEN_ROUTER_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        console.log('📡 Response status:', response.status);
        console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

        const responseText = await response.text();
        console.log('📄 Raw response:', responseText);

        let data;
        try {
          data = JSON.parse(responseText);
          console.log('✅ Parsed response:', JSON.stringify(data, null, 2));
        } catch (parseError) {
          console.error('❌ JSON parse error:', parseError);
          console.log('📄 Response was not valid JSON:', responseText);
          return getHumanLikeResponse(input);
        }

        if (!response.ok) {
          console.error('❌ API Error:', data);
          
          // Handle rate limit errors specifically
          if (response.status === 429) {
            console.log(`⏳ Rate limited (429). Attempt ${attempt + 1}/${maxRetries}`);
            console.log('💡 Tip: Consider upgrading to a paid model or adding your own API key to avoid rate limits');
            
            if (attempt < maxRetries) {
              // Calculate delay with exponential backoff
              const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
              console.log(`⏳ Waiting ${delay}ms before retry...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue; // Retry
            } else {
              console.log('❌ Max retries exceeded for rate limit');
              console.log('🔄 Falling back to rule-based responses');
              return getHumanLikeResponse(input);
            }
          }
          
          return getHumanLikeResponse(input);
        }

        const content = data.choices?.[0]?.message?.content;
        console.log('💬 Final content:', content);

        return content || 'Sorry, I had trouble processing that.';
      } catch (error) {
        console.error(`❌ OpenRouter API error on attempt ${attempt + 1}:`, error);
        
        if (attempt < maxRetries) {
          // Calculate delay with exponential backoff
          const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
          console.log(`⏳ Waiting ${delay}ms before retry due to error...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue; // Retry
        } else {
          console.error('❌ Max retries exceeded after error');
          return getHumanLikeResponse(input);
        }
      }
    }
    
    // This should not be reached, but added for completeness
    return getHumanLikeResponse(input);
  };

  // Fallback response generation using rules from JSON
  const getHumanLikeResponse = (input: string = ''): string => {
    const lowerInput = input.toLowerCase();

    // Check for analytics/donor data summary requests (Rule 1)
    if (matchesKeywords(input, chatbotRules.rules[0].keywords)) {
      const analyticsSummary = generateAnalyticsSummary();
      const donorSummary = generateDonorDataSummary();
      
      const template = getRandomResponseTemplate(chatbotRules.rules[0]);
      return processTemplate(template, {
        data_summary: analyticsSummary,
        donor_summary: donorSummary
      });
    }

    // Check for greeting keywords (Rule 2)
    if (matchesKeywords(input, chatbotRules.rules[1].keywords)) {
      return getRandomResponseTemplate(chatbotRules.rules[1]);
    }

    // Check for thank you keywords
    if (matchesKeywords(input, chatbotRules.rules[4].keywords)) {
      return getRandomResponseTemplate(chatbotRules.rules[4]);
    }

    // Check for question/help keywords (Rule 4)
    if (lowerInput.includes('?') || matchesKeywords(input, chatbotRules.rules[3].keywords)) {
      return getRandomResponseTemplate(chatbotRules.rules[3]);
    }

    // Default to acknowledgment (Rule 3) or fallback (Rule 6) responses
    if (Math.random() > 0.5) {
      return getRandomResponseTemplate(chatbotRules.rules[2]);
    } else {
      return getRandomResponseTemplate(chatbotRules.rules[5]);
    }
  };

  const handleMicPress = async () => {
    handleTapPress();
    
    // Start animation
    setIsListening(true);
    startMicActiveAnimation();

    // Simulate processing time
    setTimeout(async () => {
      const botResponseText = await getOpenRouterResponse('Hello, how can you help me today?');

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

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userInput = message.trim();
    
    // Add user message
    const userMessage: MessageType = {
      id: Date.now().toString(),
      text: userInput,
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

    // Get bot response
    try {
      const botResponseText = await getOpenRouterResponse(userInput);
      const botResponse: MessageType = {
        id: (Date.now() + 1).toString(),
        text: botResponseText,
        sender: 'bot',
      };
      setMessages(prev => [...prev, botResponse]);

      // Speak the response
      speakMessage(botResponseText);
    } catch (error) {
      console.error('Error getting bot response:', error);
    }
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