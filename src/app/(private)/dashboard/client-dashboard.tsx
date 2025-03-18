"use client"

import { useState } from "react"
import Sidebar from "./sidebar-dashboard"
import ProfileTab from "./profiletab-dashboard"
import LinksTab from "./linkstab-dashboard"
import AnalyticsTab from "./analyticstab-dashboard"

const ClientDashboard = () => {
  const [activeTab, setActiveTab] = useState<string>("profile")

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar setActiveTab={setActiveTab} activeTab={activeTab} />
      <main className="flex-1 overflow-auto p-6">
        {activeTab === "profile" && <ProfileTab />}
        {activeTab === "links" && <LinksTab />}
        {activeTab === "analytics" && <AnalyticsTab />}
      </main>
    </div>
  )
}

export default ClientDashboard
