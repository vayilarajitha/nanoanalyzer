import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import Header from '../components/Header';
import api from '../services/api';

const DEFAULT_GREETING = {
  id: 'default-welcome',
  sender: 'bot',
  text: 'Hello! I am NanoBot, your biophysical AI assistant. Ask me anything about nanoparticle cellular uptake, size optimization, surface charge, or cytotoxicity!',
  time: 'Just now',
};

export default function AIAssistantScreen({ navigation }) {
  const [messages, setMessages] = useState([DEFAULT_GREETING]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    loadUserChatHistory();
  }, []);

  const loadUserChatHistory = async () => {
    try {
      const res = await api.getAIChatHistory();
      if (res.status === 'success' && Array.isArray(res.history) && res.history.length > 0) {
        const loaded = [];
        res.history.forEach((h, idx) => {
          if (h.user_message) {
            loaded.push({
              id: `user-${h.id || idx}`,
              sender: 'user',
              text: h.user_message,
              time: h.created_at_formatted || 'Previous',
            });
          }
          if (h.bot_response) {
            loaded.push({
              id: `bot-${h.id || idx}`,
              sender: 'bot',
              text: h.bot_response,
              time: h.created_at_formatted || 'Previous',
            });
          }
        });
        if (loaded.length > 0) {
          setMessages(loaded);
        }
      }
    } catch (e) {
      // Keep default
    }
  };

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || sending) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setSending(true);

    try {
      const res = await api.sendAIChatMessage(text);
      setSending(false);

      const botReplyText = res.response || res.message || 'I have analyzed your biophysical inquiry.';
      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botReplyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      setSending(false);
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'Sorry, I had trouble processing your query. Please check your internet connection and try again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  const renderMessageItem = ({ item }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.bubbleContainer, isUser ? styles.userBubbleContainer : styles.botBubbleContainer]}>
        {!isUser ? (
          <View style={styles.botAvatar}>
            <Ionicons name="hardware-chip" size={18} color={COLORS.cyan} />
          </View>
        ) : null}

        <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
          <Text style={[styles.bubbleText, isUser ? styles.userText : styles.botText]}>
            {item.text}
          </Text>
          <Text style={[styles.timeText, isUser ? { color: 'rgba(255, 255, 255, 0.7)' } : null]}>
            {item.time}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="NanoBot AI Assistant"
        subtitle="Biophysical Nanomedicine Advisor"
        showBack
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.chatList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {sending ? (
          <View style={styles.typingIndicator}>
            <ActivityIndicator size="small" color={COLORS.cyan} />
            <Text style={styles.typingText}>NanoBot is thinking...</Text>
          </View>
        ) : null}

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask NanoBot about nanoparticle size, charge, pathways..."
            placeholderTextColor={COLORS.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && { opacity: 0.5 }]}
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
          >
            <Ionicons name="send" size={18} color={COLORS.background} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  chatList: {
    padding: 16,
    paddingBottom: 20,
  },
  bubbleContainer: {
    flexDirection: 'row',
    marginVertical: 6,
    maxWidth: '82%',
  },
  userBubbleContainer: {
    alignSelf: 'flex-end',
  },
  botBubbleContainer: {
    alignSelf: 'flex-start',
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.cyanGlow,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 4,
  },
  bubble: {
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: COLORS.cyan,
    borderBottomRightRadius: 2,
  },
  botBubble: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderBottomLeftRadius: 2,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: COLORS.background,
    fontWeight: '500',
  },
  botText: {
    color: COLORS.text,
  },
  timeText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 6,
    gap: 8,
  },
  typingText: {
    fontSize: 12,
    color: COLORS.cyan,
    fontStyle: 'italic',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    color: COLORS.text,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 14,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.cyan,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
