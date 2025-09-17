import { useState, useEffect } from "react";
import axios from "axios";
import { ActivityLog } from "../types/activityLog";

const fetchActivityLogs = async (): Promise<ActivityLog[]> => {
  const { data } = await axios.get("/api/activity-logs");
  return data;
};

export function useActivityLogs() {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchActivityLogs();
        setActivityLogs(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { activityLogs, isLoading, error };
}
