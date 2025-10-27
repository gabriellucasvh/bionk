import { create } from "zustand";

export type SubscriptionPlan = "free" | "basic" | "pro" | "ultra";

interface FeatureStore {
  subscriptionPlan: SubscriptionPlan;
  setSubscriptionPlan: (plan: SubscriptionPlan) => void;
  isBasicOrHigher: () => boolean;
}

export const useFeatureStore = create<FeatureStore>((set, get) => ({
  subscriptionPlan: "free",
  setSubscriptionPlan: (plan) => set({ subscriptionPlan: plan }),
  isBasicOrHigher: () => {
    const plan = get().subscriptionPlan;
    return plan === "basic" || plan === "pro" || plan === "ultra";
  },
}));