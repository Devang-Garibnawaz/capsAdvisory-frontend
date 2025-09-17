import { useState } from "react";
import axios from "axios";
import { updateOne } from "../../core/utils/crudUtils";
import { Event } from "../types/event";

const updateEventRequest = async (event: Event): Promise<Event> => {
  const { data } = await axios.put("/api/events", event);
  return data;
};

export function useUpdateEvent() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);

  const updateEvent = async (event: Event) => {
    try {
      setIsUpdating(true);
      const updatedEvent = await updateEventRequest(event);
      setEvents((oldEvents) => updateOne(oldEvents, updatedEvent));
      return updatedEvent;
    } finally {
      setIsUpdating(false);
    }
  };

  return { isUpdating, updateEvent, events };
}
