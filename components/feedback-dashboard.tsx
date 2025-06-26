"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import {Search,Filter,Calendar,MessageSquare,Eye,CheckCircle,Clock,Star,TrendingUp,AlertCircle,Loader2,ChevronLeft,ChevronRight,
} from "lucide-react"
import FeedbackDetailModal from "./feedback-detail-modal"
import RatingModal from "./rating-modal"

interface Feedback {
  id: string
  feedbackId?: string
  userId: string
  userName: string
  userEmail: string
  title: string
  feedbackText: string
  category: string
  priority: string
  timestamp: string
  status: "open" | "in-progress" | "completed" | "closed"
  rating: number | null
  adminResponse: string | null
  completedAt: string | null
}

interface FeedbackDashboardProps {
  refreshKey?: number
}

export default function FeedbackDashboard({ refreshKey }: FeedbackDashboardProps) {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([])
  const [userStats, setUserStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    completed: 0,
    avgRating: 0,
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false)
  const [feedbackToRate, setFeedbackToRate] = useState<Feedback | null>(null)
  const [mounted, setMounted] = useState(false)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 10,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const { user, setUser, token } = useAuth()
  const { toast } = useToast()

  // user aur data feedback ka jo backend se chahiye
  useEffect(() => {
    if (!token) return;
    setLoading(true)
    setError("")
    fetch("http://localhost:5000/api/feedback/stats", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data.userStats) {
          setUserStats({
            total: data.data.userStats.total || 0,
            open: data.data.userStats.open || 0,
            inProgress: data.data.userStats.inProgress || 0,
            completed: data.data.userStats.completed || 0,
            avgRating: data.data.userStats.avgRating || 0,
          })
        }
      })
      .catch(() => setUserStats({ total: 0, open: 0, inProgress: 0, completed: 0, avgRating: 0 }))

      const params = new URLSearchParams()
    if (categoryFilter !== "all") params.append("category", categoryFilter)
    if (statusFilter !== "all") params.append("status", statusFilter)
    if (searchTerm) params.append("search", searchTerm)
    params.append("sortBy", sortBy === "priority" ? "priority" : "createdAt")
    params.append("sortOrder", sortBy === "oldest" ? "asc" : "desc")
    params.append("limit", pagination.limit.toString())
    params.append("page", pagination.currentPage.toString())
    params.append("all", "true")
    fetch(`http://localhost:5000/api/feedback?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data.feedback) {
          setFeedbackList(data.data.feedback)
          if (data.data.pagination) setPagination(data.data.pagination)
        } else {
          setFeedbackList([])
          setPagination(p => ({ ...p, totalCount: 0, totalPages: 1 }))
        }
        setLoading(false)
      })
      .catch(() => {
        setFeedbackList([])
        setPagination(p => ({ ...p, totalCount: 0, totalPages: 1 }))
        setError("Failed to fetch feedbacks. Please try again.")
        setLoading(false)
      })
  }, [user?.id, token, refreshKey, categoryFilter, statusFilter, searchTerm, sortBy, pagination.currentPage, pagination.limit])

  useEffect(() => { setMounted(true) }, [])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "suggestion":
        return "💡"
      case "bug-report":
        return "🐛"
      case "feature-request":
        return "✨"
      case "general":
        return "💬"
      case "complaint":
        return "⚠️"
      case "compliment":
        return "👏"
      default:
        return "📝"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "suggestion":
        return "bg-blue-100 text-blue-800"
      case "bug-report":
        return "bg-red-100 text-red-800"
      case "feature-request":
        return "bg-purple-100 text-purple-800"
      case "general":
        return "bg-gray-100 text-gray-800"
      case "complaint":
        return "bg-orange-100 text-orange-800"
      case "compliment":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-yellow-100 text-yellow-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleRateFeedback = (feedback: Feedback) => {
    setFeedbackToRate(feedback)
    setIsRatingModalOpen(true)
  }

  const handleRatingSubmit = (rating: number, comment: string) => {
    if (!feedbackToRate) return

    const updatedFeedback = feedbackList.map((f) =>
      f.id === feedbackToRate.id
        ? { ...f, rating, status: "closed" as const, completedAt: new Date().toISOString() }
        : f,
    )

    setFeedbackList(updatedFeedback)

    // Update localStorage
    const allFeedback = JSON.parse(localStorage.getItem("feedbackData") || "[]")
    const updatedAllFeedback = allFeedback.map((f: Feedback) =>
      f.id === feedbackToRate.id ? { ...f, rating, status: "closed", completedAt: new Date().toISOString() } : f,
    )
    localStorage.setItem("feedbackData", JSON.stringify(updatedAllFeedback))

    toast({
      title: "Thank you!",
      description: "Your rating has been submitted successfully.",
    })

    setIsRatingModalOpen(false)
    setFeedbackToRate(null)
  }

  const formatDate = (timestamp: string) => {
    if (!mounted) return ""
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleSave = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.data.user); // Update context
        toast({
          title: "Profile Updated",
          description: "Your profile information has been updated successfully.",
        });
        setIsEditing(false);
      } else {
        toast({
          title: "Update Failed",
          description: data.message || "Could not update profile.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not connect to the server.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card className="bg-white/60 backdrop-blur-lg shadow-xl border-0 rounded-2xl">
        <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-extrabold text-primary mb-1 tracking-tight">Welcome, {user?.name}!</h2>
            <p className="text-lg text-muted-foreground">Your feedback activity at a glance</p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-5xl font-black text-primary">{userStats.total}</span>
            <span className="text-base text-muted-foreground font-medium">Total Feedback</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-xl shadow border-0 bg-gradient-to-br from-yellow-100 to-yellow-50">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-yellow-700">{userStats.open}</p>
              <p className="text-base text-yellow-800">Open</p>
            </div>
            <Clock className="w-10 h-10 text-yellow-500" />
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow border-0 bg-gradient-to-br from-blue-100 to-blue-50">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-blue-700">{userStats.inProgress}</p>
              <p className="text-base text-blue-800">In Progress</p>
            </div>
            <TrendingUp className="w-10 h-10 text-blue-500" />
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow border-0 bg-gradient-to-br from-green-100 to-green-50">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-green-700">{userStats.completed}</p>
              <p className="text-base text-green-800">Completed</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500" />
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow border-0 bg-gradient-to-br from-purple-100 to-purple-50">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-purple-700">{userStats.avgRating ? userStats.avgRating.toFixed(1) : 'N/A'}</p>
              <p className="text-base text-purple-800">Avg Rating</p>
            </div>
            <Star className="w-10 h-10 text-purple-500" />
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/80 backdrop-blur-lg shadow border-0 rounded-xl">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search feedback..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 rounded-lg border-gray-200 focus:ring-primary"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="rounded-lg border-gray-200 focus:ring-primary">
                <Filter className="w-5 h-5 mr-2 text-gray-400" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="suggestion">💡 Suggestions</SelectItem>
                <SelectItem value="bug-report">🐛 Bug Reports</SelectItem>
                <SelectItem value="feature-request">✨ Feature Requests</SelectItem>
                <SelectItem value="general">💬 General</SelectItem>
                <SelectItem value="complaint">⚠️ Complaints</SelectItem>
                <SelectItem value="compliment">👏 Compliments</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="rounded-lg border-gray-200 focus:ring-primary">
                <AlertCircle className="w-5 h-5 mr-2 text-gray-400" />
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">🟡 Open</SelectItem>
                <SelectItem value="in-progress">🔵 In Progress</SelectItem>
                <SelectItem value="completed">🟢 Completed</SelectItem>
                <SelectItem value="closed">⚫ Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="rounded-lg border-gray-200 focus:ring-primary">
                <Calendar className="w-5 h-5 mr-2 text-gray-400" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin w-10 h-10 text-primary" />
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-12 text-destructive font-semibold">{error}</div>
        ) : !mounted ? null : feedbackList.length === 0 ? (
          <Card key="no-feedback" className="bg-white/80 backdrop-blur-lg shadow border-0 rounded-xl">
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-14 h-14 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No feedback found</h3>
              <p className="text-gray-500">
                {feedbackList.length === 0 ? "You haven't submitted any feedback yet." : "Try adjusting your search or filter criteria."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {(feedbackList as Feedback[]).map((feedback: Feedback, idx: number) => (
              <Card
                key={feedback.feedbackId || feedback.id || idx}
                className="bg-white/90 shadow-md border-0 rounded-xl hover:shadow-lg transition-all duration-200"
              >
                <CardContent className="p-8">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold text-primary mb-2">{feedback.title}</h3>
                        <div className="flex gap-2">
                          <Badge className={getCategoryColor(feedback.category)}>
                            {getCategoryIcon(feedback.category)} {feedback.category.replace("-", " ").toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(feedback.status)}>{feedback.status.toUpperCase()}</Badge>
                          <Badge className={getPriorityColor(feedback.priority)}>{feedback.priority.toUpperCase()}</Badge>
                        </div>
                      </div>
                      <p className="text-gray-700 line-clamp-2 mb-3">{feedback.feedbackText}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(feedback.timestamp)}
                        </span>
                        {feedback.rating && (
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            {feedback.rating}/5
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>

      <div className="flex justify-between items-center mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPagination(p => ({ ...p, currentPage: Math.max(1, p.currentPage - 1) }))}
          disabled={pagination.currentPage === 1}
          className="flex items-center gap-1 rounded-lg"
        >
          <ChevronLeft className="w-4 h-4" /> Prev
        </Button>
        <span className="text-base text-gray-600">
          Page {pagination.currentPage} of {pagination.totalPages} | Total: {pagination.totalCount}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPagination(p => ({ ...p, currentPage: Math.min(p.totalPages, p.currentPage + 1) }))}
          disabled={pagination.currentPage === pagination.totalPages}
          className="flex items-center gap-1 rounded-lg"
        >
          Next <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <FeedbackDetailModal feedback={selectedFeedback} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <RatingModal
        feedback={feedbackToRate}
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        onSubmit={handleRatingSubmit}
      />
    </div>
  )
}