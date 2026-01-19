import { Text, useThemeColor } from '@/components/Themed';
import React from 'react';
import { View as DefaultView, Modal, StyleSheet, TouchableOpacity } from 'react-native';

type Props = {
  visible: boolean;
  title?: string;
  shopName?: string;
  amount?: number;
  location?: string;
  employeeName?: string;
  time?: string;
  onClose?: () => void;
};

export default function PunchSuccessModal({ visible, title, shopName, amount, location, employeeName, time, onClose }: Props) {
  const cardBg = useThemeColor({}, 'card');
  const buttonPrimary = useThemeColor({}, 'buttonPrimary');
  const textColor = useThemeColor({}, 'text');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <DefaultView style={styles.overlay}>
        <DefaultView style={[styles.content, { backgroundColor: cardBg }]}>
          <Text style={styles.title}>{title || '✓ Punch In Successful'}</Text>
          <Text style={[styles.message, { color: textColor }]}>Punch recorded successfully.</Text>
          {employeeName ? <Text style={[styles.detail, { color: textColor }]}>Employee: {employeeName}</Text> : null}
          {time ? <Text style={[styles.detail, { color: textColor }]}>Time: {time}</Text> : null}
          {shopName ? <Text style={[styles.detail, { color: textColor }]}>Shop: {shopName}</Text> : null}
          {typeof amount === 'number' ? <Text style={[styles.detail, { color: textColor }]}>Amount: ₹{amount.toFixed(2)}</Text> : null}
          {location ? <Text style={[styles.detail, { color: textColor }]}>Location: {location}</Text> : null}
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
  title: { fontSize: 22, fontWeight: '700', marginBottom: 10, color: '#00a86b' },
  message: { fontSize: 16, marginBottom: 10, textAlign: 'center' },
  detail: { fontSize: 14, marginTop: 4 },
  button: { marginTop: 16, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: '600' },
});

