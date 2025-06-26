import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { User, Mail, Calendar, MessageSquare, X, Star, Clock, CheckCircle, AlertCircle } from "lucide-react"

interface Feedback {
  id: string
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

interface FeedbackDetailModalProps {
  feedback: Feedback | null
  isOpen: boolean
  onClose: () => void
}

export default function FeedbackDetailModal({ feedback, isOpen, onClose }: FeedbackDetailModalProps) {
  if (!feedback) return null

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <Clock className="w-4 h-4" />
      case "in-progress":
        return <AlertCircle className="w-4 h-4" />
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "closed":
        return <X className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <MessageSquare className="w-5 h-5" />
            Feedback Details
          </DialogTitle>
          <DialogDescription>Complete info about feedback submission</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">{feedback.title}</h2>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(feedback.status)}>
                    {getStatusIcon(feedback.status)}
                    <span className="ml-1">{feedback.status.toUpperCase()}</span>
                  </Badge>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge className={getCategoryColor(feedback.category)}>
                  {getCategoryIcon(feedback.category)} {feedback.category.replace("-", " ").toUpperCase()}
                </Badge>
                <Badge className={getPriorityColor(feedback.priority)}>
                  {feedback.priority.toUpperCase()} PRIORITY
                </Badge>
                {feedback.rating && (
                  <Badge className="bg-yellow-100 text-yellow-800">
                    <Star className="w-3 h-3 mr-1" />
                    {feedback.rating}/5 STARS
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

{/* User Information*/}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User className="w-4 h-4" />
                Submitted By
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Name:</span>
                  <span className="font-medium">{feedback.userName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Email:</span>
                  <span className="font-medium">{feedback.userEmail}</span>
                </div>
              </div>
            </CardContent>
          </Card>

{/* Request in time date and out time */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Timeline
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Submitted:</span>
                  <span className="font-medium">{formatDate(feedback.timestamp)}</span>
                </div>
                {feedback.completedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Completed:</span>
                    <span className="font-medium">{formatDate(feedback.completedAt)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Feedbacks query check karne ke liye kitne count hai words ke */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />Feedback Content
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{feedback.feedbackText}</p>
              </div>
              <div className="mt-2 text-sm text-gray-500">Character count: {feedback.feedbackText.length}</div>
            </CardContent>
          </Card>

          {/* Admin Response this is not properly set up with admin */}
          {feedback.adminResponse && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Admin Response
                </h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">{feedback.adminResponse}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/*use will rate based on the service provided to him but this will be send by admin as notification as requuest get completed */}
          {feedback.rating && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Your Rating
                </h3>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-6 h-6 ${
                        star <= feedback.rating! ? "text-yellow-400 fill-current" : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-lg font-semibold">{feedback.rating}/5</span>
                </div>
              </CardContent>
            </Card>
          )}

{/* generating some primary keys like feedback id and user id*/}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Metadata</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Feedback ID:</span>
                  <code className="ml-2 bg-gray-200 px-2 py-1 rounded text-xs font-mono">{feedback.id}</code>
                </div>
                <div>
                  <span className="text-gray-600">User ID:</span>
                  <code className="ml-2 bg-gray-200 px-2 py-1 rounded text-xs font-mono">{feedback.userId}</code>
                </div>
              </div>
            </CardContent>
          </Card>

{/* for closing the upper mounted page this is to close that */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
