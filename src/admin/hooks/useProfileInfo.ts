import { useState, useEffect } from "react";
import axios from "axios";
import { ProfileInfo } from "../types/profileInfo";

const fetchProfileInfo = async (): Promise<ProfileInfo> => {
  const { data } = await axios.get("/api/profile-info");
  return data;
};

export function useProfileInfo() {
  const [profileInfo, setProfileInfo] = useState<ProfileInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchProfileInfo();
        setProfileInfo(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { profileInfo, isLoading, error };
}
