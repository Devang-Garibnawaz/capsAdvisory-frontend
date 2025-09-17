import { useState } from "react";
import axios from "axios";
import { removeOne } from "../../core/utils/crudUtils";
import { Event } from "../types/event";

const deleteEventRequest = async (eventId: string): Promise<string> => {
  const { data } = await axios.delete("/api/events", { data: eventId });
  return data;
};

export function useDeleteEvent() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);

  const deleteEvent = async (eventId: string) => {
    try {
      setIsDeleting(true);
      const result = await deleteEventRequest(eventId);
      setEvents((oldEvents) => removeOne(oldEvents, eventId));
      return result;
    } finally {
      setIsDeleting(false);
    }
  };

  return { isDeleting, deleteEvent, events };
}
