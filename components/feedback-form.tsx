"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { Send, MessageSquare, Tag, AlertCircle, Star, Filter, TrendingUp } from "lucide-react"
import { Loader2 } from "lucide-react"

interface FeedbackFormProps {
  onSubmitSuccess?: () => void
}

export default function FeedbackForm({ onSubmitSuccess }: FeedbackFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    feedbackText: "",
    category: "",
    priority: "medium",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { user, token } = useAuth()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.feedbackText || !formData.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    if (!token) {
      toast({
        title: "Error",
        description: "You must be logged in to submit feedback.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch("http://localhost:5000/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          feedbackText: formData.feedbackText,
          category: formData.category,
          priority: formData.priority,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast({
          title: "Success!",
          description: "Your feedback has been submitted successfully. We'll get back to you soon!",
        })
        setFormData({
          title: "",
          feedbackText: "",
          category: "",
          priority: "medium",
        })
        const allFeedback = JSON.parse(localStorage.getItem("feedbackData") || "[]")
        const newFeedback = data.feedback || {
          id: data.id || Math.random().toString(36).substr(2, 9),
          userId: user?.id,
          userName: user?.name,
          userEmail: user?.email,
          title: formData.title,
          feedbackText: formData.feedbackText,
          category: formData.category,
          priority: formData.priority,
          timestamp: new Date().toISOString(),
          status: "open",
          rating: null,
          adminResponse: null,
          completedAt: null,
        }
        localStorage.setItem("feedbackData", JSON.stringify([newFeedback, ...allFeedback]))
        onSubmitSuccess?.()
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to submit feedback.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
    setIsSubmitting(false)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600"
      case "medium":
        return "text-yellow-600"
      case "low":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="shadow-xl border-0 bg-yellow-100/90 backdrop-blur-sm">
        <CardHeader className="text-center bg-gradient-to-r from-yellow-400 to-yellow-300 text-gray-900 rounded-t-lg">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <MessageSquare className="w-6 h-6" />
            Submit New Feedback
          </CardTitle>
          <CardDescription className="text-yellow-900">
            Share your thoughts, report issues, or suggest improvements
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-2 text-base font-semibold">
                <Star className="w-4 h-4" />
                Title *
              </Label>
              <Input
                id="title"
                placeholder="Enter a concise title for your feedback"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="feedbackText" className="flex items-center gap-2 text-base font-semibold">
                <MessageSquare className="w-4 h-4" />
                Detailed Feedback *
              </Label>
              <Textarea
                id="feedbackText"
                placeholder="Please provide detailed information about your feedback..."
                value={formData.feedbackText}
                onChange={(e) => handleInputChange("feedbackText", e.target.value)}
                rows={8}
                className="transition-all duration-200 focus:ring-2 focus:ring-yellow-400 resize-none text-base"
              />
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">{formData.feedbackText.length}/1000 characters</p>
                <p className={`text-sm font-medium ${getPriorityColor(formData.priority)}`}>
                  Priority: {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category" className="flex items-center gap-2 text-base font-semibold">
                <Filter className="w-4 h-4" />
                Category *
              </Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger id="category" className="text-base">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="suggestion">💡 Suggestion</SelectItem>
                  <SelectItem value="bug-report">🐛 Bug Report</SelectItem>
                  <SelectItem value="feature-request">✨ Feature Request</SelectItem>
                  <SelectItem value="general">💬 General</SelectItem>
                  <SelectItem value="complaint">⚠️ Complaint</SelectItem>
                  <SelectItem value="compliment">👏 Compliment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority" className="flex items-center gap-2 text-base font-semibold">
                <TrendingUp className="w-4 h-4" />
                Priority
              </Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                <SelectTrigger id="priority" className="text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Submitting as:</p>
              <p className="font-semibold text-gray-800">
                {user?.name} ({user?.email})
              </p>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold text-lg py-3 rounded-lg shadow hover:from-yellow-500 hover:to-yellow-400 transition-all duration-200"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <MessageSquare className="w-5 h-5 mr-2" />}
              Submit Feedback
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
