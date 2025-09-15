"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { CheckCircle, Calendar, MapPin, User, Phone } from "lucide-react"

interface Booking {
  id: string
  service_requests: {
    title: string
    service_categories: {
      name: string
    }
  }
  quotes: {
    price: number
    technician_profiles: {
      first_name: string
      last_name: string
      phone: string
      avatar_url: string | null
    }
  }
  scheduled_date: string
  scheduled_time: string
  address: string
}

export default function BookingSuccessPage() {
  const params = useParams()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState(true)
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
          service_categories (name)
        ),
        quotes (
          price,
          technician_profiles (
            first_name,
            last_name,
            phone,
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
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">پرداخت موفق!</h1>
          <p className="text-xl text-muted-foreground mb-2">رزرو شما با موفقیت ثبت شد</p>
          <Badge variant="secondary" className="text-sm">
            کد رزرو: {booking.id.slice(0, 8)}
          </Badge>
        </div>

        <div className="grid gap-6">
          {/* Booking Confirmation */}
          <Card className="shadow-soft border-0 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-primary">تأیید رزرو</CardTitle>
              <CardDescription>جزئیات رزرو شما در زیر آمده است</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">{booking.service_requests.title}</h3>
                <Badge variant="outline">{booking.service_requests.service_categories.name}</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">تاریخ و زمان</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(booking.scheduled_date).toLocaleDateString("fa-IR")} - {booking.scheduled_time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">آدرس</p>
                    <p className="text-sm text-muted-foreground">{booking.address}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technician Info */}
          <Card className="shadow-soft border-0">
            <CardHeader>
              <CardTitle>اطلاعات تکنسین</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">
                    {booking.quotes.technician_profiles.first_name} {booking.quotes.technician_profiles.last_name}
                  </h4>
                  <div className="flex items-center space-x-2 space-x-reverse mt-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{booking.quotes.technician_profiles.phone}</span>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-primary">{booking.quotes.price.toLocaleString("fa-IR")}</p>
                  <p className="text-sm text-muted-foreground">تومان</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="shadow-soft border-0">
            <CardHeader>
              <CardTitle>مراحل بعدی</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3 space-x-reverse">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm font-bold text-primary">۱</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">تماس تکنسین</p>
                  <p className="text-sm text-muted-foreground">تکنسین تا ۲۴ ساعت آینده با شما تماس خواهد گرفت</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 space-x-reverse">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm font-bold text-primary">۲</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">انجام خدمات</p>
                  <p className="text-sm text-muted-foreground">تکنسین در زمان مقرر به آدرس شما مراجعه خواهد کرد</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 space-x-reverse">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm font-bold text-primary">۳</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">ارزیابی خدمات</p>
                  <p className="text-sm text-muted-foreground">
                    پس از اتمام کار، نظر خود را درباره کیفیت خدمات ثبت کنید
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button asChild variant="outline" className="border-2 bg-transparent">
              <Link href="/bookings">مشاهده رزروها</Link>
            </Button>
            <Button asChild className="gradient-primary">
              <Link href="/dashboard">بازگشت به داشبورد</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
