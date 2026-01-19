import React from 'react';
import { Modal, View as DefaultView, StyleSheet } from 'react-native';
import { Text, useThemeColor } from '@/components/Themed';

type Props = {
  visible: boolean;
  name: string;
  onClose?: () => void;
};

export default function SuccessModal({ visible, name }: Props) {
  const cardBg = useThemeColor({}, 'card');
  return (
    <Modal visible={visible} transparent animationType="fade">
      <DefaultView style={styles.successOverlay}>
        <DefaultView style={[styles.successContent, { backgroundColor: cardBg }]}>
          <Text style={styles.successTitle}>✓ Success!</Text>
          <Text style={styles.successMessage}>Employee Added Successfully</Text>
          <Text style={styles.successName}>{name}</Text>
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
});

