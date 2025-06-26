import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Star, Send } from "lucide-react"

interface Feedback {
  id: string
  title: string
  category: string
  status: string
}

interface RatingModalProps {
  feedback: Feedback | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (rating: number, comment: string) => void
}

export default function RatingModal({ feedback, isOpen, onClose, onSubmit }: RatingModalProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) return

    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000)) 
    onSubmit(rating, comment)

    setRating(0)
    setHoveredRating(0)
    setComment("")
    setIsSubmitting(false)
  }

  const handleClose = () => {
    setRating(0)
    setHoveredRating(0)
    setComment("")
    onClose()
  }

  if (!feedback) return null

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1:
        return "Poor"
      case 2:
        return "Fair"
      case 3:
        return "Good"
      case 4:
        return "Very Good"
      case 5:
        return "Excellent"
      default:
        return "Select Rating"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Rate Our Service
          </DialogTitle>
          <DialogDescription>How satisfied are you with how we handled your feedback?</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Feedback Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-1">{feedback.title}</h4>
            <p className="text-sm text-gray-600">Category: {feedback.category.replace("-", " ")}</p>
          </div>

          {/* Rating Stars */}
          <div className="text-center">
            <Label className="text-base font-semibold mb-4 block">Your Rating</Label>
            <div className="flex justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm font-medium text-gray-700">{getRatingText(hoveredRating || rating)}</p>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Additional Comments (Optional)</Label>
            <Textarea
              id="comment"
              placeholder="Tell us more about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose} className="flex-1" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || isSubmitting}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Submit Rating
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
