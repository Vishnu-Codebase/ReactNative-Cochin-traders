import React from 'react';
import { Modal, View as DefaultView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useThemeColor } from '@/components/Themed';

type Props = {
  visible: boolean;
  success?: boolean;
  title?: string;
  message?: string;
  details?: Record<string, string | number | null | undefined>;
  onClose?: () => void;
};

export default function ApiResponseMessage({ visible, success = true, title, message, details, onClose }: Props) {
  const cardBg = useThemeColor({}, 'card');
  const buttonPrimary = useThemeColor({}, 'buttonPrimary');
  const textColor = useThemeColor({}, 'text');
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <DefaultView style={styles.overlay}>
        <DefaultView style={[styles.content, { backgroundColor: cardBg }]}>
          <Text style={[styles.title, { color: success ? '#00a86b' : '#c62828' }]}>{title || (success ? '✓ Success' : 'Error')}</Text>
          {message ? <Text style={[styles.message, { color: textColor }]}>{message}</Text> : null}
          {details
            ? Object.entries(details).map(([k, v]) =>
                v !== undefined && v !== null ? (
                  <Text key={k} style={[styles.detail, { color: textColor }]}>{k}: {String(v)}</Text>
                ) : null
              )
            : null}
          <TouchableOpacity style={[styles.button, { backgroundColor: buttonPrimary }]} onPress={onClose}>
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
        </DefaultView>
      </DefaultView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  content: { paddingHorizontal: 30, paddingVertical: 40, borderRadius: 16, alignItems: 'center', elevation: 10 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 10 },
  message: { fontSize: 16, marginBottom: 10, textAlign: 'center' },
  detail: { fontSize: 14, marginTop: 4 },
  button: { marginTop: 16, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: '600' },
});
