import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { attribution, BUILT_IN_QUOTES } from '@/lib/quotes';
import { useArete } from '@/lib/store';
import { useTheme } from '@/lib/theme';

export default function QuotesScreen() {
  const t = useTheme();
  const { userQuotes, addQuote, removeQuote } = useArete();
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
  const canAdd = text.trim().length > 0;

  const onAdd = async () => {
    if (!canAdd) return;
    await addQuote(text, author);
    setText('');
    setAuthor('');
  };

  const input = [styles.input, { color: t.text, backgroundColor: t.card, borderColor: t.border }];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={[styles.h1, { color: t.text }]}>My quotes</Text>
          <Text style={{ color: t.muted }}>
            Your quotes join the {BUILT_IN_QUOTES.length} built-in ones in the daily rotation.
          </Text>

          <TextInput
            style={[input, styles.multiline]}
            placeholder="Quote or personal reminder"
            placeholderTextColor={t.muted}
            value={text}
            onChangeText={setText}
            multiline
          />
          <TextInput
            style={input}
            placeholder="Author (optional)"
            placeholderTextColor={t.muted}
            value={author}
            onChangeText={setAuthor}
            onSubmitEditing={onAdd}
          />
          <Pressable
            onPress={onAdd}
            disabled={!canAdd}
            style={[styles.button, { backgroundColor: t.accent, opacity: canAdd ? 1 : 0.4 }]}
          >
            <Text style={styles.buttonText}>Add quote</Text>
          </Pressable>

          {userQuotes.length === 0 ? (
            <Text style={[styles.empty, { color: t.muted }]}>No quotes of your own yet.</Text>
          ) : (
            userQuotes.map((q) => (
              <View key={q.id} style={[styles.item, { backgroundColor: t.card, borderColor: t.border }]}>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={{ color: t.text, fontSize: 16 }}>“{q.text}”</Text>
                  <Text style={{ color: t.muted }}>— {attribution(q)}</Text>
                </View>
                <Pressable onPress={() => removeQuote(q.id)} hitSlop={8} accessibilityLabel="Remove quote">
                  <Text style={{ color: t.danger, fontWeight: '600' }}>Remove</Text>
                </Pressable>
              </View>
            ))
          )}

          <Text style={[styles.h2, { color: t.text }]}>Built-in</Text>
          {BUILT_IN_QUOTES.map((q) => (
            <View key={q.id} style={[styles.item, { borderColor: t.border }]}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ color: t.text, fontSize: 16 }}>“{q.text}”</Text>
                <Text style={{ color: t.muted }}>— {attribution(q)}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, paddingBottom: 48, gap: 12 },
  h1: { fontSize: 32, fontWeight: '800', marginTop: 8 },
  h2: { fontSize: 20, fontWeight: '700', marginTop: 16 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  multiline: { minHeight: 88, textAlignVertical: 'top' },
  button: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  empty: { textAlign: 'center', marginVertical: 12 },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: 14,
  },
});
