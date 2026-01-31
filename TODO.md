Add a "Dogtung Bot" link at @app/components/DashboardLayout sidebar, and create another page in dashboard using this code and link that to that "Dugtong bot in @app/components/DashboardLayout sidebar "import React, { useState } from 'react';
import {
StyleSheet,
View,
Text,
TextInput,
TouchableOpacity,
SafeAreaView,
KeyboardAvoidingView,
Platform,
ScrollView,
} from 'react-native';
import { Mic, Send, X, Bot } from 'lucide-react-native';

const AIChatPage = () => {
const [message, setMessage] = useState('');

return (
<SafeAreaView style={styles.container}>
{/_ Header _/}
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

);
};

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: '#F8F9FA',
},
flex: {
flex: 1,
},
header: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
backgroundColor: '#3B82F6',
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
backgroundColor: '#FFF',
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
color: '#444',
},
talkSection: {
alignItems: 'center',
marginVertical: 40,
},
bigTalkButton: {
width: 120,
height: 120,
borderRadius: 60,
backgroundColor: '#3B82F6',
justifyContent: 'center',
alignItems: 'center',
shadowColor: '#3B82F6',
shadowOffset: { width: 0, height: 10 },
shadowOpacity: 0.3,
shadowRadius: 20,
elevation: 10,
},
talkSubtext: {
marginTop: 15,
color: '#666',
fontSize: 14,
fontWeight: '400',
},
messageBubble: {
backgroundColor: '#EEE',
padding: 15,
borderRadius: 15,
borderBottomLeftRadius: 2,
maxWidth: '90%',
alignSelf: 'flex-start',
},
messageText: {
color: '#333',
lineHeight: 20,
},
footer: {
flexDirection: 'row',
padding: 15,
backgroundColor: '#FFF',
borderTopWidth: 1,
borderTopColor: '#EEE',
alignItems: 'center',
},
input: {
flex: 1,
height: 45,
paddingHorizontal: 15,
fontSize: 16,
color: '#333',
},
sendButton: {
backgroundColor: '#3B82F6',
width: 40,
height: 40,
borderRadius: 20,
justifyContent: 'center',
alignItems: 'center',
marginLeft: 10,
},
});

export default AIChatPage;
