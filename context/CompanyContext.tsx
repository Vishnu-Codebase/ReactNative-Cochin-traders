import { getCompanyNames } from '@/lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

type Company = { companyName: string; lastSyncedAt?: string | null };

type CompanyContextType = {
  companies: Company[];
  selected: string | null;
  setSelected: (name: string | null) => void;
  refresh: () => Promise<void>;
};

const CompanyContext = createContext<CompanyContextType | null>(null);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const STORAGE_KEY = 'cochin_companies_v1';

  async function loadFromStorage() {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY);
        console.log('CompanyContext - loadFromStorage (web):', raw);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            console.log('CompanyContext - loaded companies:', parsed);
            setCompanies(parsed);
            if (!selected && parsed.length > 0) {
              console.log('CompanyContext - setting selected to:', parsed[0].companyName);
              setSelected(parsed[0].companyName);
            }
          }
        }
      } else {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        console.log('CompanyContext - loadFromStorage (native):', raw);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            console.log('CompanyContext - loaded companies:', parsed);
            setCompanies(parsed);
            if (!selected && parsed.length > 0) {
              console.log('CompanyContext - setting selected to:', parsed[0].companyName);
              setSelected(parsed[0].companyName);
            }
          }
        }
      }
    } catch (e) {
      console.error('CompanyContext - loadFromStorage error:', e);
    }
  }

  async function refresh() {
    try {
      console.log('CompanyContext - refresh called');
      const res = await getCompanyNames();
      console.log('CompanyContext - getCompanyNames response:', res);
      if (res && res.data) {
        const list = res.data || [];
        console.log('CompanyContext - setting companies:', list);
        setCompanies(list);
        if (!selected && list && list.length > 0) {
          console.log('CompanyContext - setting selected to:', list[0].companyName);
          setSelected(list[0].companyName);
        }
        // persist
        try {
          const raw = JSON.stringify(list);
          if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, raw);
          else await AsyncStorage.setItem(STORAGE_KEY, raw);
        } catch (e) {
          console.error('CompanyContext - persist error:', e);
        }
      }
    } catch (e) {
      console.error('CompanyContext - refresh error:', e);
    }
  }

  useEffect(() => { loadFromStorage(); refresh(); }, []);

  return (
    <CompanyContext.Provider value={{ companies, selected, setSelected, refresh }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error('useCompany must be used within CompanyProvider');
  return ctx;
}

export default CompanyProvider;
