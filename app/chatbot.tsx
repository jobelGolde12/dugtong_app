import * as Speech from 'expo-speech';
import { Bot, Mic, Send } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Animated as RNAnimated,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import chatbotRules from '../chatbot-rules.json';
import { useTheme } from '../contexts/ThemeContext';
import RoleBasedDashboardLayout from './components/RoleBasedDashboardLayout';
import { useRoleAccess } from '../hooks/useRoleAccess';
import { RoleGuard } from './components/RoleGuard';
import { USER_ROLES } from '../constants/roles.constants';
import { donorApi } from '../api/donors';
import { getDonorRegistrations } from '../api/donor-registrations';
import { getNotifications, getUnreadCount, getGroupedNotifications } from '../api/notifications';

type MessageType = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
};

// OpenRouter free models in fallback order
const FREE_MODELS = [
  'meta-llama/llama-3.2-3b-instruct:free',
  'qwen/qwen-2-7b-instruct:free',
  'microsoft/phi-3-mini-128k-instruct:free'
] as const;

type OpenRouterError = {
  error?: {
    message?: string;
    code?: number;
  };
};

export default function ChatbotScreen() {
  const { colors, isDark } = useTheme();
  const { userRole, isAdmin, isLoading: authLoading } = useRoleAccess();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<MessageType[]>([
  ]);
  const [showIntro, setShowIntro] = useState(true);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const introAnim = useRef(new RNAnimated.Value(1)).current;

  // NEW: State to track when chatbot cannot receive messages
  const [cannotReceiveMessages, setCannotReceiveMessages] = useState(false);
  
  // NEW: State for typing indicator
  const [isTyping, setIsTyping] = useState(false);

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

  // Handle back button to collapse footer
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isInputFocused) {
        setIsInputFocused(false);
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [isInputFocused]);

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

  const styles = createStyles(colors, cannotReceiveMessages); // Updated to include cannotReceiveMessages

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

  // Fetch live data from API endpoints with enhanced error handling
  const fetchLiveData = async () => {
    try {
      // Fetch all data in parallel with individual error handling
      const [donorsData, registrationsData, notificationsData, unreadData, groupedData] = await Promise.all([
        // Donors endpoint with error handling
        donorApi.getDonors({ 
          bloodType: '', 
          municipality: '', 
          availability: '', 
          searchQuery: '', 
          page: 0, 
          page_size: 100 
        }).catch(error => {
          console.error('Error fetching donors:', error);
          return { items: [], total: 0, page: 0, page_size: 0 };
        }),
        
        // Donor registrations endpoint with error handling
        getDonorRegistrations({ limit: 100 }).catch(error => {
          console.error('Error fetching donor registrations:', error);
          return [];
        }),
        
        // Notifications endpoint with error handling
        getNotifications({ page_size: 50 }).catch(error => {
          console.error('Error fetching notifications:', error);
          return { items: [], total: 0, page: 0, page_size: 0, unread_count: 0 };
        }),
        
        // Unread count endpoint with error handling
        getUnreadCount().catch(error => {
          console.error('Error fetching unread count:', error);
          return { unread_count: 0 };
        }),
        
        // Grouped notifications endpoint with error handling
        getGroupedNotifications().catch(error => {
          console.error('Error fetching grouped notifications:', error);
          return { today: [], yesterday: [], earlier: [], unread_count: 0 };
        })
      ]);

      return {
        donors: donorsData,
        registrations: registrationsData,
        notifications: notificationsData,
        unreadCount: unreadData,
        groupedNotifications: groupedData
      };
    } catch (error) {
      console.error('Critical error fetching live data:', error);
      // Return default empty data structure to prevent crashes
      return {
        donors: { items: [], total: 0, page: 0, page_size: 0 },
        registrations: [],
        notifications: { items: [], total: 0, page: 0, page_size: 0, unread_count: 0 },
        unreadCount: { unread_count: 0 },
        groupedNotifications: { today: [], yesterday: [], earlier: [], unread_count: 0 }
      };
    }
  };

  const generateDataSummary = async (): Promise<string> => {
    const data = await fetchLiveData();
    if (!data) {
      return 'Unable to fetch live data at the moment.';
    }

    const { donors, registrations, notifications, unreadCount, groupedNotifications } = data;

    // Safely handle cases where data might be undefined or null
    if (!donors || !registrations || !notifications || !unreadCount || !groupedNotifications) {
      return 'Some data sources are temporarily unavailable.';
    }

    try {
      const bloodTypeCounts: Record<string, number> = {};
      if (donors.items && Array.isArray(donors.items)) {
        donors.items.forEach((donor: any) => {
          const bloodType = donor?.blood_type || 'Unknown';
          bloodTypeCounts[bloodType] = (bloodTypeCounts[bloodType] || 0) + 1;
        });
      }

      const availableDonors = donors.items?.filter((d: any) => d?.availability_status === 'Available').length || 0;
      const pendingRegistrations = registrations.filter((r: any) => r?.status === 'pending').length || 0;
      const approvedRegistrations = registrations.filter((r: any) => r?.status === 'approved').length || 0;

      return `
Donors Summary:
- Total Donors: ${donors.total || 0}
- Available Donors: ${availableDonors}
- Blood Type Distribution: ${Object.entries(bloodTypeCounts).map(([type, count]) => `${type}: ${count}`).join(', ')}

Registrations Summary:
- Total Registrations: ${registrations.length || 0}
- Pending: ${pendingRegistrations}
- Approved: ${approvedRegistrations}

Notifications Summary:
- Total Notifications: ${notifications.total || 0}
- Unread: ${unreadCount.unread_count || 0}
- Today: ${groupedNotifications.today?.length || 0}
- Yesterday: ${groupedNotifications.yesterday?.length || 0}
`.trim();
    } catch (error) {
      console.error('Error generating data summary:', error);
      return 'There was an issue processing the live data. Please try again later.';
    }
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

  // OpenRouter API integration with model fallback mechanism
  const getOpenRouterResponse = async (input: string): Promise<string> => {
    // NEW: Show typing indicator when starting API call
    setIsTyping(true);
    // NEW: Set cannot receive messages state when starting API call
    setCannotReceiveMessages(true);

    // Retry configuration
    const maxRetries = 2;
    const baseDelay = 1000;

    // API keys in fallback order
    const apiKeys = [
      process.env.EXPO_PUBLIC_OPEN_ROUTER_API_KEY1,
      process.env.EXPO_PUBLIC_OPEN_ROUTER_API_KEY2,
      process.env.EXPO_PUBLIC_OPEN_ROUTER_API_KEY3
    ].filter(Boolean);

    // Validate API keys
    if (apiKeys.length === 0) {
      console.error('❌ No OpenRouter API keys are set');
      setIsTyping(false);
      setCannotReceiveMessages(false);
      const response = await getHumanLikeResponse(input);
      return response;
    }

    // Build system prompt from chatbot-rules.json
    const rulesDescription = chatbotRules.rules.map(rule =>
      `${rule.title}: ${rule.description}`
    ).join('\n');

    const dataSummary = await generateDataSummary();

    const systemPrompt = `You are Dugtong Bot, a helpful assistant for a blood donation app.

MANDATORY RULES (from chatbot-rules.json):
${rulesDescription}

LIVE SYSTEM DATA:
${dataSummary}

BEHAVIOR GUIDELINES:
- Always base your answers on the live data provided above
- Be helpful, friendly, and concise
- Provide accurate information about donors, registrations, and notifications
- If asked about data, summarize and contextualize the information
- Never perform actions, only explain and guide
- If data is unavailable, inform the user gracefully`;

    let lastError: Error | null = null;

    // Try each API key
    for (let keyIndex = 0; keyIndex < apiKeys.length; keyIndex++) {
      const currentKey = apiKeys[keyIndex];
      console.log(`🔑 Trying API key ${keyIndex + 1}/${apiKeys.length}`);

      // Try each model with current key
      for (let modelIndex = 0; modelIndex < FREE_MODELS.length; modelIndex++) {
        const currentModel = FREE_MODELS[modelIndex];
        console.log(`🔄 Trying model ${modelIndex + 1}/${FREE_MODELS.length}: ${currentModel}`);

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          try {
            console.log(`🔍 OpenRouter API call (key ${keyIndex + 1}, model: ${currentModel}, attempt ${attempt + 1})`);

            const requestBody = {
              model: currentModel,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: input }
              ],
              max_tokens: 150,
              temperature: 0.7,
            };

            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${currentKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestBody),
            });

            const responseText = await response.text();
            let data;
            try {
              data = JSON.parse(responseText);
            } catch (parseError) {
              console.error('❌ JSON parse error:', parseError);
              if (attempt < maxRetries) {
                const delay = baseDelay * Math.pow(2, attempt);
                console.log(`⏳ Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
              }
              break;
            }

            if (!response.ok) {
              const errorCode = response.status;
              console.error(`❌ API Error ${errorCode}:`, data.error?.message || 'Unknown error');

              if (errorCode === 429 || errorCode === 502 || errorCode === 503) {
                if (attempt < maxRetries) {
                  const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
                  console.log(`⏳ Retryable error ${errorCode}, waiting ${delay}ms...`);
                  await new Promise(resolve => setTimeout(resolve, delay));
                  continue;
                }
              } else if (errorCode === 401 || errorCode === 403) {
                console.error(`🔑 Authentication error ${errorCode}, trying next model`);
                break;
              } else {
                if (attempt < maxRetries) {
                  const delay = baseDelay * Math.pow(2, attempt);
                  console.log(`⏳ Provider error ${errorCode}, retrying in ${delay}ms...`);
                  await new Promise(resolve => setTimeout(resolve, delay));
                  continue;
                }
              }

              break;
            }

            const content = data.choices?.[0]?.message?.content;
            console.log(`✅ Success with key ${keyIndex + 1}, model: ${currentModel}`);
            setIsTyping(false);
            setCannotReceiveMessages(false);
            return content || 'Sorry, I had trouble processing that.';

          } catch (error) {
            lastError = error as Error;
            console.error(`❌ Network/request error on attempt ${attempt + 1}:`, error);

            if (attempt < maxRetries) {
              const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
              console.log(`⏳ Network error, waiting ${delay}ms before retry...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
            console.log(`🌐 Network error with ${currentModel}, trying next model`);
            break;
          }
        }

        console.log(`❌ Model ${currentModel} failed with key ${keyIndex + 1}, trying next...`);
      }

      console.log(`❌ All models failed with key ${keyIndex + 1}, trying next key...`);
    }

    console.error('❌ All OpenRouter API keys and models failed, falling back to rule-based responses');
    console.error('Last error:', lastError?.message);
    setIsTyping(false);
    setCannotReceiveMessages(false);
    return await getHumanLikeResponse(input);
  };

  // Fallback response generation using rules from JSON
  const getHumanLikeResponse = async (input: string = ''): Promise<string> => {
    // NEW: Show typing indicator when generating response
    setIsTyping(true);
    
    const lowerInput = input.toLowerCase();

    // Check for analytics/donor data summary requests (Rule 1)
    if (matchesKeywords(input, chatbotRules.rules[0].keywords)) {
      const dataSummary = await generateDataSummary();

      const template = getRandomResponseTemplate(chatbotRules.rules[0]);
      const response = processTemplate(template, {
        data_summary: dataSummary,
        donor_summary: dataSummary
      });
      
      // NEW: Hide typing indicator after generating response
      setIsTyping(false);
      return response;
    }

    // Check for greeting keywords (Rule 2)
    if (matchesKeywords(input, chatbotRules.rules[1].keywords)) {
      const response = getRandomResponseTemplate(chatbotRules.rules[1]);
      // NEW: Hide typing indicator after generating response
      setIsTyping(false);
      return response;
    }

    // Check for thank you keywords
    if (matchesKeywords(input, chatbotRules.rules[4].keywords)) {
      const response = getRandomResponseTemplate(chatbotRules.rules[4]);
      // NEW: Hide typing indicator after generating response
      setIsTyping(false);
      return response;
    }

    // Check for question/help keywords (Rule 4)
    if (lowerInput.includes('?') || matchesKeywords(input, chatbotRules.rules[3].keywords)) {
      const response = getRandomResponseTemplate(chatbotRules.rules[3]);
      // NEW: Hide typing indicator after generating response
      setIsTyping(false);
      return response;
    }

    // Default to acknowledgment (Rule 3) or fallback (Rule 6) responses
    let response;
    if (Math.random() > 0.5) {
      response = getRandomResponseTemplate(chatbotRules.rules[2]);
    } else {
      response = getRandomResponseTemplate(chatbotRules.rules[5]);
    }
    
    // NEW: Hide typing indicator after generating response
    setIsTyping(false);
    return response;
  };

  const handleMicPress = async () => {
    // NEW: Prevent mic press when chatbot cannot receive messages
    if (cannotReceiveMessages) return;

    handleTapPress();

    // Start animation
    setIsListening(true);
    startMicActiveAnimation();

    // NEW: Show typing indicator when processing voice input
    setIsTyping(true);

    // Simulate processing time
    setTimeout(async () => {
      const botResponseText = await getOpenRouterResponse('Hello, how can you help me today?');

      // NEW: Hide typing indicator after response is received
      setIsTyping(false);

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
    // NEW: Prevent sending when chatbot cannot receive messages
    if (cannotReceiveMessages || !message.trim()) return;

    const userInput = message.trim();

    // Add user message
    const userMessage: MessageType = {
      id: Date.now().toString(),
      text: userInput,
      sender: 'user',
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsInputFocused(false); // Collapse footer on send

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

    // NEW: Show typing indicator when processing message
    setIsTyping(true);

    // Get bot response
    try {
      const botResponseText = await getOpenRouterResponse(userInput);
      const botResponse: MessageType = {
        id: (Date.now() + 1).toString(),
        text: botResponseText,
        sender: 'bot',
      };
      setMessages(prev => [...prev, botResponse]);

      // NEW: Hide typing indicator after response is received
      setIsTyping(false);

      // Speak the response
      speakMessage(botResponseText);
    } catch (error) {
      console.error('Error getting bot response:', error);
      // NEW: Hide typing indicator even if there's an error
      setIsTyping(false);
      setCannotReceiveMessages(false);
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

  // NEW: Add typing indicator when bot is thinking/processing
  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <View style={styles.typingContainer}>
        <View style={styles.typingBubble}>
          <View style={styles.typingDots}>
            <View style={[styles.dot, { backgroundColor: colors.text }]} />
            <View style={[styles.dot, { backgroundColor: colors.text }]} />
            <View style={[styles.dot, { backgroundColor: colors.text }]} />
          </View>
        </View>
      </View>
    );
  };

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

  // Show loading while authentication is being initialized
  if (authLoading) {
    return (
      <RoleBasedDashboardLayout>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.text }}>Loading...</Text>
        </View>
      </RoleBasedDashboardLayout>
    );
  }

  // Check if user has permission to access chatbot (admin only)
  if (!isAdmin()) {
    return (
      <RoleGuard 
        allowedRoles={[USER_ROLES.ADMIN]} 
        userRole={userRole}
      >
        <View />
      </RoleGuard>
    );
  }

  return (
    <RoleBasedDashboardLayout>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* CRITICAL FIX: Proper KeyboardAvoidingView configuration */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
          style={styles.flex}
        >
          <View style={styles.contentContainer}>
            <ScrollView 
              ref={scrollViewRef}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
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
                    style={[styles.bigTalkButton, cannotReceiveMessages && styles.disabledButton]}
                    onPressIn={handleTapPress}
                    onPressOut={handleTapRelease}
                    onPress={handleMicPress}
                    activeOpacity={cannotReceiveMessages ? 1 : 0.8} // NEW: Adjust opacity when disabled
                    disabled={cannotReceiveMessages} // NEW: Disable when cannot receive messages
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

              {/* NEW: Typing indicator when bot is thinking/processing */}
              {renderTypingIndicator()}
            </ScrollView>

            {/* Input Footer - CRITICAL FIX: Removed negative marginTop */}
            <View style={[
              styles.footer,
              isInputFocused && styles.footerExpanded
            ]}>
              <TextInput
                style={[styles.input, cannotReceiveMessages && styles.disabledInput]}
                placeholder="Type something to send..."
                value={message}
                onChangeText={setMessage}
                placeholderTextColor="#999"
                onSubmitEditing={handleSendMessage}
                returnKeyType="send"
                blurOnSubmit={false}
                editable={!cannotReceiveMessages}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                multiline={isInputFocused}
                numberOfLines={isInputFocused ? 8 : 1}
              />
              <TouchableOpacity 
                style={[styles.sendButton, cannotReceiveMessages && styles.disabledSendButton]}
                onPress={handleSendMessage}
                activeOpacity={0.8}
                disabled={cannotReceiveMessages}
              >
                <Send color="#FFF" size={20} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </RoleBasedDashboardLayout>
  );
}

const createStyles = (colors: any, cannotReceiveMessages: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between', // Ensures footer stays at bottom
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
    paddingBottom: 100, // Add bottom padding for footer space when keyboard closed
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
  disabledButton: {
    opacity: 0.5, // NEW: Visual indicator for disabled state
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
    paddingBottom: 25,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'flex-start',
  },
  footerExpanded: {
    height: '60%',
    alignItems: 'flex-start',
    paddingTop: 10,
  },
  input: {
    flex: 1,
    minHeight: 45,
    paddingHorizontal: 15,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    marginRight: 10,
  },
  disabledInput: {
    opacity: 0.5, // NEW: Visual indicator for disabled input
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
  disabledSendButton: {
    opacity: 0.5, // NEW: Visual indicator for disabled send button
  },
  // NEW: Styles for status message
  statusContainer: {
    marginVertical: 10,
    alignSelf: 'center',
    maxWidth: '80%',
  },
  statusBubble: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusText: {
    color: colors.secondaryText,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  // NEW: Styles for typing indicator
  typingContainer: {
    marginVertical: 10,
    alignSelf: 'flex-start',
    maxWidth: '80%',
  },
  typingBubble: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
    alignSelf: 'flex-start',
    marginLeft: 0, // Align to the very left
  },
  typingDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.text,
  },
});