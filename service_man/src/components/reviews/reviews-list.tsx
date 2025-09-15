"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, User } from "lucide-react"

interface Review {
  id: string
  rating: number
  comment: string | null
  created_at: string
  customer_profiles: {
    first_name: string
    last_name: string
    avatar_url: string | null
  }
  service_requests: {
    title: string
    service_categories: {
      name: string
    }
  }
}

interface ReviewsListProps {
  technicianId: string
}

export default function ReviewsList({ technicianId }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [averageRating, setAverageRating] = useState(0)

  useEffect(() => {
    fetchReviews()
  }, [technicianId])

  const fetchReviews = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("reviews")
      .select(`
        *,
        customer_profiles (
          first_name,
          last_name,
          avatar_url
        ),
        bookings (
          service_requests (
            title,
            service_categories (name)
          )
        )
      `)
      .eq("technician_id", technicianId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching reviews:", error)
    } else {
      setReviews(data || [])
      if (data && data.length > 0) {
        const avg = data.reduce((sum, review) => sum + review.rating, 0) / data.length
        setAverageRating(Math.round(avg * 10) / 10)
      }
    }
    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <Card className="shadow-soft border-0">
        <CardContent className="pt-6 text-center">
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      {reviews.length > 0 && (
        <Card className="shadow-soft border-0 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-4 space-x-reverse">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">{averageRating}</div>
                <div className="flex items-center justify-center space-x-1 space-x-reverse mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(averageRating) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">بر اساس {reviews.length} نظر</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card className="shadow-soft border-0">
            <CardContent className="pt-6 text-center">
              <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">هنوز نظری ثبت نشده است</p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} className="shadow-soft border-0">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4 space-x-reverse">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {review.customer_profiles.first_name} {review.customer_profiles.last_name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString("fa-IR")}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1 space-x-reverse">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {review.service_requests && (
                      <Badge variant="outline" className="text-xs">
                        {review.service_requests.service_categories.name}
                      </Badge>
                    )}

                    {review.comment && <p className="text-muted-foreground leading-relaxed">{review.comment}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
