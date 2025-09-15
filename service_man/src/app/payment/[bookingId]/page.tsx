"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Shield, CheckCircle, User, MapPin, Calendar } from "lucide-react"

interface Booking {
  id: string
  service_requests: {
    title: string
    description: string
    service_categories: {
      name: string
    }
  }
  quotes: {
    price: number
    technician_profiles: {
      first_name: string
      last_name: string
      avatar_url: string | null
    }
  }
  scheduled_date: string
  scheduled_time: string
  address: string
  status: string
}

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const bookingId = params.bookingId as string

  useEffect(() => {
    fetchBooking()
  }, [bookingId])

  const fetchBooking = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        service_requests (
          title,
          description,
          service_categories (name)
        ),
        quotes (
          price,
          technician_profiles (
            first_name,
            last_name,
            avatar_url
          )
        )
      `)
      .eq("id", bookingId)
      .single()

    if (error) {
      console.error("Error fetching booking:", error)
    } else {
      setBooking(data)
    }
    setIsLoading(false)
  }

  const handlePayment = async () => {
    setIsProcessing(true)
    const supabase = createClient()

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Update booking status to paid
      const { error } = await supabase
        .from("bookings")
        .update({
          status: "paid",
          payment_status: "completed",
          payment_date: new Date().toISOString(),
        })
        .eq("id", bookingId)

      if (error) throw error

      router.push(`/booking-success/${bookingId}`)
    } catch (error) {
      console.error("Payment error:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">رزرو مورد نظر یافت نشد</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">پرداخت امن</h1>
          <p className="text-muted-foreground">اطلاعات پرداخت شما کاملاً محفوظ است</p>
        </div>

        <div className="grid gap-6">
          {/* Booking Details */}
          <Card className="shadow-soft border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 space-x-reverse">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>جزئیات رزرو</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">{booking.service_requests.title}</h3>
                  <Badge variant="secondary">{booking.service_requests.service_categories.name}</Badge>
                  <p className="text-sm text-muted-foreground">{booking.service_requests.description}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    {booking.quotes.technician_profiles.first_name} {booking.quotes.technician_profiles.last_name}
                  </span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    {new Date(booking.scheduled_date).toLocaleDateString("fa-IR")} - {booking.scheduled_time}
                  </span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse md:col-span-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{booking.address}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card className="shadow-soft border-0">
            <CardHeader>
              <CardTitle>خلاصه پرداخت</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">هزینه خدمات</span>
                <span className="font-medium">{booking.quotes.price.toLocaleString("fa-IR")} تومان</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">مالیات بر ارزش افزوده</span>
                <span className="font-medium">
                  {Math.round(booking.quotes.price * 0.09).toLocaleString("fa-IR")} تومان
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center text-lg font-bold">
                <span>مجموع</span>
                <span className="text-primary">
                  {Math.round(booking.quotes.price * 1.09).toLocaleString("fa-IR")} تومان
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="shadow-soft border-0">
            <CardHeader>
              <CardTitle>روش پرداخت</CardTitle>
              <CardDescription>پرداخت آنلاین امن با درگاه بانکی</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3 space-x-reverse p-4 border border-border rounded-lg bg-muted/30">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">پرداخت آنلاین</p>
                  <p className="text-sm text-muted-foreground">کارت‌های عضو شتاب</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Card className="shadow-soft border-0 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3 space-x-reverse">
                <Shield className="w-6 h-6 text-primary" />
                <div>
                  <p className="font-medium text-foreground">پرداخت امن</p>
                  <p className="text-sm text-muted-foreground">
                    اطلاعات پرداخت شما با بالاترین استانداردهای امنیتی محافظت می‌شود
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Button */}
          <Button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full gradient-primary text-lg py-4 shadow-soft hover:shadow-medium transition-all"
          >
            {isProcessing ? (
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                <span>در حال پردازش...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 space-x-reverse">
                <CreditCard className="w-5 h-5" />
                <span>پرداخت {Math.round(booking.quotes.price * 1.09).toLocaleString("fa-IR")} تومان</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
