// components/ProfileViewTracker.tsx
"use client";

import { useEffect } from "react";
import { detectTrafficSource } from "@/utils/traffic-source";

interface ProfileViewTrackerProps {
  userId: string;
}

const ProfileViewTracker: React.FC<ProfileViewTrackerProps> = ({ userId }) => {
  useEffect(() => {
    const trafficSource = detectTrafficSource();
    
    fetch("/api/profile-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        userId,
        trafficSource // Enviar a origem detectada
      }),
    }).catch((error) =>
      console.error("Failed to record profile view:", error)
    );
  }, [userId]);

  return null;
};

export default ProfileViewTracker;
