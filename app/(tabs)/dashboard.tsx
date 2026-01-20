// app/(tabs)/index.tsx
import { Text, View } from "@/components/Themed";
import EmployeeModal from "@/components/trader/EmployeeModal";
import PunchCard from "@/components/trader/PunchCard";
import SuccessModal from "@/components/trader/SuccessModal";
import { useCompany } from "@/context/CompanyContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";

export default function DashboardScreen() {
  const [empId, setEmpId] = useState<string | null>(null);
  const [employeeName, setEmployeeName] = useState<string | null>(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalEmployeeName, setModalEmployeeName] = useState("");
  const [modalPhone, setModalPhone] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const { refresh, selected } = useCompany();

  const employeeNameRef = useRef<string | null>(null);

  const showEmployeeModalSimple = useCallback(
    () => setShowEmployeeModal(true),
    [],
  );
  const hideEmployeeModalSimple = useCallback(
    () => setShowEmployeeModal(false),
    [],
  );

  const handleAddEmployee = async () => {
    if (!modalEmployeeName.trim()) {
      alert("Please enter your name");
      return;
    }
    if (modalPhone.length !== 10 || !/^\d+$/.test(modalPhone)) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }

    try {
      setModalLoading(true);
      // Save to AsyncStorage
      await AsyncStorage.multiSet([
        ["employee_name", modalEmployeeName.trim()],
        ["employee_phone", modalPhone],
        ["employee_token", Date.now().toString()],
      ]);

      setEmployeeName(modalEmployeeName.trim());
      employeeNameRef.current = modalEmployeeName.trim();
      // Immediately close the employee modal to avoid stuck-open cases
      hideEmployeeModalSimple();
      // Show success for a short duration
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        setModalEmployeeName("");
        setModalPhone("");
      }, 2000);
    } catch (error) {
      console.error("Error saving employee:", error);
      alert("Failed to save employee details");
    } finally {
      setModalLoading(false);
    }
  };

  // Check for employee on component mount
  useEffect(() => {
    const checkEmployee = async () => {
      try {
        const name = await AsyncStorage.getItem("employee_name");
        if (name) {
          setEmployeeName(name);
          employeeNameRef.current = name;
        } else {
          showEmployeeModalSimple();
        }
      } catch (error) {
        console.error("Error checking employee:", error);
        showEmployeeModalSimple();
      }
    };
    checkEmployee();
  }, [showEmployeeModalSimple]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        await refresh();
      } catch {}
      const id = await AsyncStorage.getItem("employee_phone");
      if (!isMounted) return;
      setEmpId(id || null);
    })();
    return () => {
      isMounted = false;
    };
  }, [refresh]);

  return (
    <View style={styles.container}>
      {employeeName && (
        <Text style={styles.greeting}>Welcome, {employeeName}</Text>
      )}
      <PunchCard
        employeeName={employeeName || undefined}
        employeePhone={empId || undefined}
      />

      <EmployeeModal
        visible={showEmployeeModal}
        name={modalEmployeeName}
        phone={modalPhone}
        loading={modalLoading}
        onNameChange={setModalEmployeeName}
        onPhoneChange={(v) =>
          setModalPhone(v.replace(/[^0-9]/g, "").slice(0, 10))
        }
        onSave={handleAddEmployee}
        onClose={hideEmployeeModalSimple}
      />
      <SuccessModal visible={showSuccessModal} name={modalEmployeeName} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  greeting: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  // modal styles removed; handled inside components
});
