import { useState, useEffect } from "react";
import axios from "axios";
import { Notification } from "../types/notification";

const fetchNotifications = async (): Promise<Notification[]> => {
  const { data } = await axios.get("/api/notifications");
  return data;
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchNotifications();
        setNotifications(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { notifications, isLoading, error };
}
