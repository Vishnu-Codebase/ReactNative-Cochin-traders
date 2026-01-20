import React from 'react';
import { Modal, View as DefaultView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useThemeColor } from '@/components/Themed';

type Props = {
  visible: boolean;
  name: string;
  onClose?: () => void;
};

export default function SuccessModal({ visible, name, onClose }: Props) {
  const cardBg = useThemeColor({}, 'card');
  const buttonPrimary = useThemeColor({}, 'buttonPrimary');
  const textColor = useThemeColor({}, 'text');
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <DefaultView style={styles.successOverlay}>
        <DefaultView style={[styles.successContent, { backgroundColor: cardBg }]}>
          <Text style={styles.successTitle}>✓ Success!</Text>
          <Text style={[styles.successMessage, { color: textColor }]}>Employee Added Successfully</Text>
          <Text style={styles.successName}>{name}</Text>
          <TouchableOpacity style={[styles.button, { backgroundColor: buttonPrimary }]} onPress={onClose}>
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
        </DefaultView>
      </DefaultView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  successOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  successContent: { paddingHorizontal: 30, paddingVertical: 40, borderRadius: 16, alignItems: 'center', elevation: 10 },
  successTitle: { fontSize: 24, fontWeight: '700', marginBottom: 12, color: '#00a86b' },
  successMessage: { fontSize: 16, marginBottom: 10, textAlign: 'center' },
  successName: { fontSize: 18, fontWeight: '600', marginTop: 8 },
  button: { marginTop: 16, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: '600' },
});
