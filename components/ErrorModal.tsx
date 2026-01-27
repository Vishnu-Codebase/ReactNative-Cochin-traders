import { Text, useThemeColor } from '@/components/Themed';
import React from 'react';
import { View as DefaultView, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

type Props = {
  visible: boolean;
  status?: number | string | null;
  onClose?: () => void;
  onRetry?: () => void;
};

export default function ErrorModal({ visible, status, onClose, onRetry }: Props) {
  const cardBg = useThemeColor({}, 'card');
  const buttonPrimary = useThemeColor({}, 'buttonPrimary');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'tabIconDefault');

  const statusText = typeof status === 'number' ? String(status) : (status || 'Unknown');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <DefaultView style={styles.overlay}>
        <DefaultView style={[styles.content, { backgroundColor: cardBg }]}>
          <DefaultView style={styles.titleRow}>
            <Icon name="error-outline" size={22} color="#c62828" />
            <Text style={styles.title}>Error: {statusText}</Text>
          </DefaultView>
          <Text style={[styles.message, { color: textColor }]}>
            Please open Cochin Connect server for connecting to apis. if issue persists, please contact programer or enginear
          </Text>
          <DefaultView style={styles.buttons}>
            {onRetry ? (
              <TouchableOpacity style={[styles.buttonPrimary, { backgroundColor: buttonPrimary }]} onPress={onRetry}>
                <Text style={styles.buttonText}>Retry</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity style={[styles.buttonOutline, { borderColor }]} onPress={onClose}>
              <Text style={[styles.buttonText, { color: textColor }]}>OK</Text>
            </TouchableOpacity>
          </DefaultView>
        </DefaultView>
      </DefaultView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  content: { paddingHorizontal: 30, paddingVertical: 40, borderRadius: 16, alignItems: 'center', elevation: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  title: { fontSize: 18, fontWeight: '700', color: '#c62828' },
  message: { fontSize: 16, marginBottom: 10, textAlign: 'center' },
  buttons: { flexDirection: 'row', gap: 10, marginTop: 16, width: '100%' },
  buttonPrimary: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  buttonOutline: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1, backgroundColor: 'transparent' },
  buttonText: { color: '#fff', fontWeight: '700' },
})
