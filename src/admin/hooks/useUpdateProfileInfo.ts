import { useState } from "react";
import axios from "axios";
import { ProfileInfo } from "../types/profileInfo";

const updateProfileInfoRequest = async (
  profileInfo: ProfileInfo
): Promise<ProfileInfo> => {
  const { data } = await axios.put("/api/profile-info", profileInfo);
  return data;
};

export function useUpdateProfileInfo() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileInfo, setProfileInfo] = useState<ProfileInfo | null>(null);

  const updateProfileInfo = async (info: ProfileInfo) => {
    try {
      setIsUpdating(true);
      const updatedInfo = await updateProfileInfoRequest(info);
      setProfileInfo(updatedInfo);
      return updatedInfo;
    } finally {
      setIsUpdating(false);
    }
  };

  return { isUpdating, updateProfileInfo, profileInfo };
}
