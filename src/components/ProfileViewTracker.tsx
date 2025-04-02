// components/ProfileViewTracker.tsx
"use client";

import { useEffect } from "react";

interface ProfileViewTrackerProps {
  userId: string;
}

const ProfileViewTracker: React.FC<ProfileViewTrackerProps> = ({ userId }) => {
  useEffect(() => {
    fetch("/api/profile-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    }).catch((error) =>
      console.error("Failed to record profile view:", error)
    );
  }, [userId]);

  return null;
};

export default ProfileViewTracker;
