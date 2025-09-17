import { useEffect, useState } from "react";
import axios from "axios";
import { Event } from "../types/event";

const fetchEventsRequest = async (): Promise<Event[]> => {
  const { data } = await axios.get("/api/events");
  return data;
};

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedEvents = await fetchEventsRequest();
        setEvents(fetchedEvents);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch events"));
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, []);

  return { events, isLoading, error };
}
