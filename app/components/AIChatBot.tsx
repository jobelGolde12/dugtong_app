import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mic, Send, X, Bot } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import DashboardLayout from './DashboardLayout';

const AIChatPage = () => {
  const { colors } = useTheme();
  const [message, setMessage] = useState('');
  const styles = createStyles(colors);

  return (
    <DashboardLayout>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chat with us</Text>
          <TouchableOpacity>
            <X color="#FFF" size={24} />
          </TouchableOpacity>
        </View>

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
              <Text style={styles.botName}>Sergent</Text>
            </View>

            {/* Big Modern Talk Icon */}
            <View style={styles.talkSection}>
              <TouchableOpacity style={styles.bigTalkButton}>
                <Mic color="#FFF" size={48} strokeWidth={1.5} />
              </TouchableOpacity>
              <Text style={styles.talkSubtext}>Tap to speak to Sergent</Text>
            </View>

            {/* Example Chat Bubble */}
            <View style={styles.messageBubble}>
              <Text style={styles.messageText}>
                Hi! I am Sergent, your friendly customer service bot. How can I help you today?
              </Text>
            </View>
          </ScrollView>

          {/* Input Footer */}
          <View style={styles.footer}>
            <TextInput
              style={styles.input}
              placeholder="Type something to send..."
              value={message}
              onChangeText={setMessage}
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.sendButton}>
              <Send color="#FFF" size={20} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </DashboardLayout>
  );
};

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
    backgroundColor: colors.inputBackground,
    padding: 15,
    borderRadius: 15,
    borderBottomLeftRadius: 2,
    maxWidth: '90%',
    alignSelf: 'flex-start',
  },
  messageText: {
    color: colors.text,
    lineHeight: 20,
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

export default AIChatPage;