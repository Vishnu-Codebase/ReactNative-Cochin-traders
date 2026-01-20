import { Text, useThemeColor } from '@/components/Themed';
import React from 'react';
import {
  View as DefaultView,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';

type Props = {
  visible: boolean;
  name: string;
  phone: string;
  loading?: boolean;
  onNameChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  onSave: () => void;
  onClose: () => void;
};

export default function EmployeeModal({ visible, name, phone, loading, onNameChange, onPhoneChange, onSave, onClose }: Props) {
  const cardBg = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'tabIconDefault');
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalBackdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <DefaultView style={[styles.modalContent, { backgroundColor: cardBg }]}>
            <Text style={styles.modalTitle}>Add Employee Details</Text>
            <TextInput
              placeholder="Employee Name"
              value={name}
              onChangeText={onNameChange}
              style={[styles.modalInput, { borderColor }]}
              editable={!loading}
            />
            <TextInput
              placeholder="Phone Number (10 digits)"
              value={phone}
              onChangeText={onPhoneChange}
              keyboardType="numeric"
              maxLength={10}
              style={[styles.modalInput, { borderColor }]}
              editable={!loading}
            />
            <TouchableOpacity style={[styles.modalButton, { opacity: loading ? 0.6 : 1 }]} onPress={onSave} disabled={!!loading}>
              <Text style={styles.modalButtonText}>{loading ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
          </DefaultView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', paddingHorizontal: 20, paddingVertical: 30, borderRadius: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  modalInput: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, marginBottom: 16, fontSize: 16 },
  modalButton: { backgroundColor: '#780206', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  modalButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
