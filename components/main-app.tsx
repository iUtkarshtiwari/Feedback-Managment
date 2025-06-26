"use client"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import FeedbackForm from "@/components/feedback-form"
import FeedbackDashboard from "@/components/feedback-dashboard"
import UserProfile from "@/components/user-profile"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, BarChart3, User, LogOut, Bell, Settings } from "lucide-react"
import {DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuLabel,DropdownMenuSeparator,DropdownMenuTrigger} from "@/components/ui/dropdown-menu"

export default function MainApp() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [refreshKey, setRefreshKey] = useState(0)
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Feedback System</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.name}!</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        {user?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setActiveTab("profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-lg border border-gray-200">
            <Button
              variant={activeTab === "dashboard" ? "default" : "ghost"}
              onClick={() => setActiveTab("dashboard")}
              className="mr-1 bg-gradient-to-r from-blue-600 to-indigo-600 data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              My Dashboard
            </Button>
            <Button
              variant={activeTab === "form" ? "default" : "ghost"}
              onClick={() => setActiveTab("form")}
              className="mr-1"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              New Feedback
            </Button>
            <Button variant={activeTab === "profile" ? "default" : "ghost"} onClick={() => setActiveTab("profile")}>
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          {activeTab === "dashboard" && <FeedbackDashboard refreshKey={refreshKey} />}
          {activeTab === "form" && <FeedbackForm onSubmitSuccess={() => { setActiveTab("dashboard"); setRefreshKey(k => k + 1); }} />}
          {activeTab === "profile" && <UserProfile refreshKey={refreshKey} />}
        </div>
      </div>
    </div>
  )
}
