import { createContext, useContext, useEffect, useState } from "react";
import { collegesAPI } from "../services/api";

const DataContext = createContext({
  data: null,
  loading: true,
  error: null,
  retry: () => {},
});

export function useData() {
  return useContext(DataContext);
}

export function DataProvider({ children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Try API first (MERN backend)
      const [{ data: apiData }, { data: metaData }, { data: categoryData }] =
        await Promise.all([
          collegesAPI.getLight(),
          collegesAPI.getMeta(),
          collegesAPI.getCategoryMap(),
        ]);

      const cutoffData = {
        meta: {
          ...metaData.meta,
          generatedAt: new Date().toISOString(),
        },
        categories: categoryData.categories || {},
        colleges: apiData.colleges,
      };
      setData(cutoffData);
      console.log(
        `[CAP Predictor] API data loaded: ${cutoffData.meta.totalRecords} records, ` +
          `${cutoffData.meta.totalColleges} colleges, ` +
          `${cutoffData.meta.totalBranches} branches`,
      );
    } catch (apiError) {
      console.warn(
        "[CAP Predictor] API not available, falling back to static JSON...",
      );
      // Fallback: try loading static JSON (for development without server)
      try {
        const response = await fetch("/data/cutoffs.json");
        if (!response.ok) {
          throw new Error(`Failed to load data (HTTP ${response.status})`);
        }
        const json = await response.json();
        setData(json);
        console.log(
          `[CAP Predictor] Static data loaded: ${json.meta.totalRecords} records, ` +
            `${json.meta.totalColleges} colleges, ` +
            `${json.meta.totalBranches} branches`,
        );
      } catch (staticError) {
        const message =
          staticError instanceof Error
            ? staticError.message
            : "Unknown error loading data";
        setError(`API and static data both unavailable: ${message}`);
        console.error("[CAP Predictor] Data load failed:", message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <DataContext.Provider value={{ data, loading, error, retry: loadData }}>
      {children}
    </DataContext.Provider>
  );
}
