import { useState } from "react";
import axios from "axios";
import { addOne } from "../../core/utils/crudUtils";
import { Event } from "../types/event";

const addEventRequest = async (event: Event): Promise<Event> => {
  const { data } = await axios.post("/api/events", event);
  return data;
};

export function useAddEvent() {
  const [isAdding, setIsAdding] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);

  const addEvent = async (event: Event) => {
    try {
      setIsAdding(true);
      const newEvent = await addEventRequest(event);
      setEvents((oldEvents) => addOne(oldEvents, newEvent));
      return newEvent;
    } finally {
      setIsAdding(false);
    }
  };

  return { isAdding, addEvent, events };
}
