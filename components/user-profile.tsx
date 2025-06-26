import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { User, Mail, Calendar, Edit, Save, X, Star, MessageSquare, TrendingUp, Award } from "lucide-react"

export default function UserProfile({ refreshKey }: { refreshKey?: number }) {
  const { user, token } = useAuth()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  })
  const [userStats, setUserStats] = useState({
    totalFeedback: 0,
    avgRating: 0,
    completedFeedback: 0,
    openFeedback: 0,
  })

  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:5000/api/feedback/stats", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data.userStats) {
          setUserStats({
            totalFeedback: data.data.userStats.total || 0,
            avgRating: data.data.userStats.avgRating || 0,
            completedFeedback: data.data.userStats.completed || 0,
            openFeedback: data.data.userStats.open || 0,
          });
        }
      })
      .catch(() => setUserStats({
        totalFeedback: 0,
        avgRating: 0,
        completedFeedback: 0,
        openFeedback: 0,
      }));
  }, [user?.id, refreshKey, token]);

  const handleSave = async () => {
    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated successfully.",
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setProfileData({
      name: user?.name || "",
      email: user?.email || "",
    })
    setIsEditing(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
        <CardContent className="p-8">
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24 border-4 border-white/20">
              <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
              <AvatarFallback className="bg-white/20 text-white text-2xl font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{user?.name}</h1>
              <p className="text-blue-100 mb-1">{user?.email}</p>
              <p className="text-blue-200 text-sm">
                Member since {user?.joinedDate ? formatDate(user.joinedDate) : "N/A"}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <MessageSquare className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">{userStats.totalFeedback}</p>
            <p className="text-sm text-gray-600">Total Feedback</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">
              {userStats.avgRating ? userStats.avgRating.toFixed(1) : "N/A"}
            </p>
            <p className="text-sm text-gray-600">Average Rating</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">{userStats.completedFeedback}</p>
            <p className="text-sm text-gray-600">Completed</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">{userStats.openFeedback}</p>
            <p className="text-sm text-gray-600">Open Requests</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
          </CardTitle>
          <CardDescription>Manage your personal information and account settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} className="bg-gradient-to-r from-blue-600 to-indigo-600">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="font-medium">{user?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Email Address</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="font-medium">{user?.joinedDate ? formatDate(user.joinedDate) : "N/A"}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Activity Summary
          </CardTitle>
          <CardDescription>Overview of your feedback activity and engagement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">Feedback Statistics</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Submissions:</span>
                  <span className="font-medium">{userStats.totalFeedback}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed:</span>
                  <span className="font-medium text-green-600">{userStats.completedFeedback}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Open:</span>
                  <span className="font-medium text-yellow-600">{userStats.openFeedback}</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">Engagement</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Rating Given:</span>
                  <span className="font-medium">
                    {userStats.avgRating ? `${userStats.avgRating.toFixed(1)}/5` : "No ratings yet"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Response Rate:</span>
                  <span className="font-medium">
                    {userStats.totalFeedback > 0
                      ? `${Math.round((userStats.completedFeedback / userStats.totalFeedback) * 100)}%`
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
