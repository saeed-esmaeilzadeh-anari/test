"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Star, Send } from "lucide-react"

interface ReviewFormProps {
  bookingId: string
  technicianId: string
  onReviewSubmitted?: () => void
}

export default function ReviewForm({ bookingId, technicianId, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) return

    setIsSubmitting(true)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const { error } = await supabase.from("reviews").insert({
        booking_id: bookingId,
        customer_id: user.id,
        technician_id: technicianId,
        rating,
        comment: comment.trim() || null,
      })

      if (error) throw error

      // Update booking status to reviewed
      await supabase.from("bookings").update({ status: "reviewed" }).eq("id", bookingId)

      onReviewSubmitted?.()
    } catch (error) {
      console.error("Error submitting review:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="shadow-soft border-0">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 space-x-reverse">
          <Star className="w-5 h-5 text-primary" />
          <span>ارزیابی خدمات</span>
        </CardTitle>
        <CardDescription>نظر شما به بهبود کیفیت خدمات کمک می‌کند</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">امتیاز شما</Label>
            <div className="flex items-center space-x-1 space-x-reverse">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 transition-colors"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoveredRating || rating) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-muted-foreground">
                {rating === 1 && "خیلی ضعیف"}
                {rating === 2 && "ضعیف"}
                {rating === 3 && "متوسط"}
                {rating === 4 && "خوب"}
                {rating === 5 && "عالی"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment" className="text-sm font-medium text-foreground">
              نظر شما (اختیاری)
            </Label>
            <Textarea
              id="comment"
              placeholder="تجربه خود از این خدمات را با ما به اشتراک بگذارید..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px] border-border focus:ring-2 focus:ring-primary/20"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-left">{comment.length}/500</p>
          </div>

          <Button
            type="submit"
            disabled={rating === 0 || isSubmitting}
            className="w-full gradient-primary shadow-soft hover:shadow-medium transition-all"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                <span>در حال ارسال...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 space-x-reverse">
                <Send className="w-4 h-4" />
                <span>ثبت نظر</span>
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
