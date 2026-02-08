import { getCompanyNames } from "@/lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type Company = { companyName: string; lastSyncedAt?: string | null };

interface CompanyContextType {
  selectedCompany: string | null;
  selected: string | null;
  setSelectedCompany: (company: string | null) => Promise<void>;
  companies: Array<{ companyName: string; lastSyncedAt: string | null }>;
  loadCompanies: () => Promise<void>;
  refresh: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [selectedCompany, setSelectedCompanyState] = useState<string | null>(
    null,
  );
  const [companies, setCompanies] = useState<
    Array<{ companyName: string; lastSyncedAt: string | null }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load selected company from storage on mount
  useEffect(() => {
    const init = async () => {
      await loadSelectedCompany();
      await loadCompanies();
    };
    init();
  }, []);

  const loadSelectedCompany = async () => {
    try {
      const stored = await AsyncStorage.getItem("selected_company");
      console.log("Loaded selected company from storage:", stored);
      if (stored) {
        setSelectedCompanyState(stored);
      }
    } catch (err) {
      console.error("Failed to load selected company:", err);
    }
  };

  const setSelectedCompany = async (company: string | null) => {
    try {
      console.log("Setting selected company:", company);
      setSelectedCompanyState(company);
      if (company) {
        await AsyncStorage.setItem("selected_company", company);
      } else {
        await AsyncStorage.removeItem("selected_company");
      }
    } catch (err) {
      console.error("Failed to save selected company:", err);
    }
  };

  const loadCompanies = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Loading companies from API...");
      const response = await getCompanyNames();
      console.log("API Response:", response);

      if (response.success && response.data) {
        const companiesList = response.data;
        console.log("Companies loaded:", companiesList);
        setCompanies(companiesList);

        // If no company is selected and we have companies, select the first one
        const currentSelected = await AsyncStorage.getItem("selected_company");
        if (!currentSelected && companiesList.length > 0) {
          console.log(
            "Auto-selecting first company:",
            companiesList[0].companyName,
          );
          await setSelectedCompany(companiesList[0].companyName);
        }
      } else {
        throw new Error("Failed to load companies");
      }
    } catch (err: any) {
      console.error("Error loading companies:", err);
      setError(err.message || "Failed to load companies");
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    await loadCompanies();
  };

  return (
    <CompanyContext.Provider
      value={{
        selectedCompany,
        selected: selectedCompany,
        setSelectedCompany,
        companies,
        loadCompanies,
        refresh,
        loading,
        error,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = (): CompanyContextType => {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error("useCompany must be used within a CompanyProvider");
  }
  return context;
};
