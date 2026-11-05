import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

const INITIAL_MESSAGES = [
  {
    id: 'm-0',
    sender: 'bot',
    text: 'Greetings! I am NanoBot, your AI specialist in nanoparticle cellular uptake kinetics and drug delivery optimization. How can I assist your biophysical analysis today?',
    time: 'Now'
  }
];

const SUGGESTIONS = [
  'Optimal size for HeLa?',
  'Surface charge effects?',
  'Endocytosis pathways',
  'Toxicity limits',
  'Why is 45nm optimal?',
  'PLGA vs Gold carrier'
];

export default function ChatbotScreen() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  // Deterministic Offline Biophysical Intent Engine (matching web main.js resolveBotResponse)
  const resolveBotResponse = (userMsg) => {
    const q = userMsg.toLowerCase();

    if (q.includes('size') || q.includes('optimal') || q.includes('diameter') || q.includes('45nm')) {
      return 'In thermodynamic receptor-mediated endocytosis models, 40nm to 50nm diameter nanoparticles exhibit optimal cellular wrapping enthalpy and maximum internalisation rates. Particles below 20nm diffuse out rapidly, while particles above 100nm experience kinetic steric hindrance.';
    } else if (q.includes('charge') || q.includes('zeta') || q.includes('surface') || q.includes('mv')) {
      return 'Cationic (positively charged, +15mV to +35mV) nanoparticles bind strongly to negatively charged sialic acid and proteoglycans on cell membranes via electrostatic attraction, enhancing uptake by up to 45%, though higher charges (>+40mV) increase membrane lysis cytotoxicity.';
    } else if (q.includes('pathway') || q.includes('mechanism') || q.includes('endocytosis')) {
      return 'Nanoparticle cellular entry operates through 4 distinct pathways:\n1) Clathrin-mediated endocytosis (~40-80nm)\n2) Caveolae-mediated endocytosis (~20-80nm, bypassing lysosomes)\n3) Macropinocytosis (>200nm)\n4) Direct membrane translocation (very small ultra-charged dots).';
    } else if (q.includes('toxic') || q.includes('viability') || q.includes('cytotoxicity')) {
      return 'Cytotoxicity is directly correlated with reactive oxygen species (ROS) generation, core material dissolution (e.g. unpassivated Quantum Dots or Zinc Oxide), and high positive zeta potential (>+30mV). Gold (Au) and PLGA exhibit low toxicity indices under 15%.';
    } else if (q.includes('hela') || q.includes('cancer') || q.includes('mda')) {
      return 'Cancerous cell lines such as HeLa and MDA-MB-231 feature overexpressed EGFR and transferrin receptors, exhibiting 30-60% higher baseline uptake rates compared to normal non-cancerous somatic cells (e.g. HEK293).';
    } else if (q.includes('gold') || q.includes('aunp')) {
      return 'Gold nanoparticles (AuNPs) provide exceptional chemical inertness, high surface-to-volume ratio for ligand conjugation (e.g., PEGylation), and minimal non-specific cytotoxicity across both epithelial and phagocytic assays.';
    } else if (q.includes('plga') || q.includes('polymer')) {
      return 'PLGA (poly(lactic-co-glycolic acid)) is an FDA-approved biodegradable copolymer that undergoes ester hydrolysis into lactic and glycolic acid, enabling sustained drug release kinetics with high biocompatibility.';
    } else if (q.includes('liposome') || q.includes('lipid')) {
      return 'Liposomes are spherical lipid bilayer vesicles capable of encapsulating both hydrophilic and lipophilic compounds. Modulating lipid composition (e.g., DOTAP, DPPC) adjusts membrane fusion and endosomal escape efficiency.';
    } else {
      return `NanoBot Analysis: Based on biophysical nanomedicine models for "${userMsg.trim()}", maintaining a 40–50nm particle diameter and slightly cationic zeta potential (+15 to +25 mV) delivers optimal cellular internalization with minimized cytotoxicity.`;
    }
  };

  const handleSend = (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Instant deterministic offline reply
    setTimeout(() => {
      const botReply = resolveBotResponse(text);
      const botMsg = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: botReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setIsTyping(false);
      setMessages(prev => [...prev, botMsg]);
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 350);
  };

  const handleClear = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Bot Status Banner */}
      <View style={styles.topStatus}>
        <View style={styles.statusLeft}>
          <View style={styles.botIconBadge}>
            <Ionicons name="hardware-chip" size={18} color="#000" />
          </View>
          <View>
            <Text style={styles.botName}>NanoBot Biomedical Specialist</Text>
            <View style={styles.onlineRow}>
              <View style={styles.greenDot} />
              <Text style={styles.onlineText}>Instant Offline-Capable Engine • Non-API</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
          <Ionicons name="refresh-outline" size={16} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Messages Scroll Area */}
      <ScrollView 
        ref={scrollRef}
        style={styles.chatScroll}
        contentContainerStyle={styles.chatContent}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((item) => {
          const isBot = item.sender === 'bot';
          return (
            <View 
              key={item.id} 
              style={[styles.msgRow, isBot ? styles.msgRowBot : styles.msgRowUser]}
            >
              {isBot && (
                <View style={styles.botAvatar}>
                  <Ionicons name="sparkles" size={14} color={COLORS.primary} />
                </View>
              )}
              <View 
                style={[
                  styles.msgBubble, 
                  isBot ? styles.msgBubbleBot : styles.msgBubbleUser
                ]}
              >
                <Text style={[styles.msgText, isBot ? styles.msgTextBot : styles.msgTextUser]}>
                  {item.text}
                </Text>
                <Text style={styles.msgTime}>{item.time}</Text>
              </View>
            </View>
          );
        })}

        {isTyping && (
          <View style={[styles.msgRow, styles.msgRowBot]}>
            <View style={styles.botAvatar}>
              <Ionicons name="sparkles" size={14} color={COLORS.primary} />
            </View>
            <View style={[styles.msgBubble, styles.msgBubbleBot, styles.typingBubble]}>
              <View style={styles.typingDot} />
              <View style={styles.typingDot} />
              <View style={styles.typingDot} />
            </View>
          </View>
        )}

        {/* Suggestion Chips */}
        <View style={styles.chipsContainer}>
          <Text style={styles.chipsLabel}>Suggested Inquiries:</Text>
          <View style={styles.chipsFlex}>
            {SUGGESTIONS.map((suggestion) => (
              <TouchableOpacity
                key={suggestion}
                style={styles.chipBtn}
                onPress={() => handleSend(suggestion)}
                activeOpacity={0.7}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={12} color={COLORS.primary} />
                <Text style={styles.chipText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Chat Input Bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          placeholder="Ask NanoBot about size, charge, pathways..."
          placeholderTextColor={COLORS.textMuted}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={() => handleSend()}
          returnKeyType="send"
        />
        <TouchableOpacity 
          style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]} 
          onPress={() => handleSend()}
          disabled={!inputText.trim()}
        >
          <Ionicons name="send" size={16} color={inputText.trim() ? '#000' : COLORS.textMuted} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  botIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
  },
  onlineText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.success,
  },
  clearBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceLight,
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 24,
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: 14,
    gap: 8,
    maxWidth: '85%',
  },
  msgRowBot: {
    alignSelf: 'flex-start',
  },
  msgRowUser: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  msgBubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  msgBubbleBot: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    borderTopLeftRadius: 4,
  },
  msgBubbleUser: {
    backgroundColor: COLORS.primary,
    borderTopRightRadius: 4,
  },
  msgText: {
    fontSize: 13,
    lineHeight: 19,
  },
  msgTextBot: {
    color: COLORS.text,
  },
  msgTextUser: {
    color: '#000',
    fontWeight: '600',
  },
  msgTime: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 12,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    opacity: 0.7,
  },
  chipsContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  chipsLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  chipsFlex: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceBorder,
    gap: 10,
    marginBottom: 65, // Clearance for bottom tabs
  },
  textInput: {
    flex: 1,
    height: 44,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    color: COLORS.text,
    fontSize: 13,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.surfaceLight,
  },
});

