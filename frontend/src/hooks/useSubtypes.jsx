import { useState, useCallback } from "react";
import axios from "axios";
const API_BASE = import.meta.env.VITE_API_BASE;

export default function useSubtypeLibrary() {
  const [subtypeLibrary, setSubtypeLibrary] = useState({});

  // Load subtypes for a given main type
  const loadSubtypes = useCallback(async (type) => {
    if (!type) return;

    const res = await axios.get(`${API_BASE}/api/subtypes/${type}`);

    setSubtypeLibrary((prev) => ({
      ...prev,
      [type]: res.data,
    }));
  }, []);

  // Create a new subtype and reload
  const createSubtype = useCallback(
    async (type, newSubtype) => {
      if (!type || !newSubtype) return;

      await axios.post(`${API_BASE}/api/subtypes`, {
        type,
        name: newSubtype,
      });

      // Reload updated subtype list
      await loadSubtypes(type);

      return newSubtype; 
    },
    [loadSubtypes]
  );

  return {
    subtypeLibrary,
    loadSubtypes,
    createSubtype,
  };
}
