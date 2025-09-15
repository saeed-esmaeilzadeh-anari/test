"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, User, Phone, DollarSign } from "lucide-react"
import Link from "next/link"

interface Booking {
  id: string
  scheduled_date: string
  notes: string | null
  status: string
  created_at: string
  quote: {
    id: string
    price: number
    estimated_duration: number | null
    technician: {
      id: string
      profile: {
        first_name: string
        last_name: string
        phone: string | null
      }
    }
    service_request: {
      id: string
      title: string
      address: string
      city: string
      service: {
        name: string
        name_fa: string
      }
      customer: {
        first_name: string
        last_name: string
        phone: string | null
      }
    }
  }
}

interface BookingsListProps {
  bookings: Booking[]
  userRole: string
  currentUserId: string
}

export function BookingsList({ bookings, userRole, currentUserId }: BookingsListProps) {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const getStatusBadge = (status: string) => {
    const statusMap = {
      scheduled: { label: "زمان‌بندی شده", variant: "default" as const },
      in_progress: { label: "در حال انجام", variant: "default" as const },
      completed: { label: "تکمیل شده", variant: "default" as const },
      cancelled: { label: "لغو شده", variant: "destructive" as const },
    }
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: "secondary" as const }
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  const handleUpdateBookingStatus = async (bookingId: string, newStatus: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.from("bookings").update({ status: newStatus }).eq("id", bookingId)

      if (error) throw error

      // Also update service request status
      const booking = bookings.find((b) => b.id === bookingId)
      if (booking) {
        await supabase.from("service_requests").update({ status: newStatus }).eq("id", booking.quote.service_request.id)
      }

      window.location.reload()
    } catch (error) {
      console.error("Error updating booking status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const upcomingBookings = bookings.filter(
    (booking) => booking.status === "scheduled" && new Date(booking.scheduled_date) >= new Date(),
  )
  const activeBookings = bookings.filter((booking) => booking.status === "in_progress")
  const pastBookings = bookings.filter((booking) => booking.status === "completed" || booking.status === "cancelled")

  const renderBookingCard = (booking: Booking) => (
    <Card key={booking.id} className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{booking.quote.service_request.title}</CardTitle>
            <CardDescription className="mt-1">{booking.quote.service_request.service.name_fa}</CardDescription>
          </div>
          {getStatusBadge(booking.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 ml-2" />
            <div>
              <div className="font-medium">تاریخ و ساعت</div>
              <div>
                {new Date(booking.scheduled_date).toLocaleDateString("fa-IR")} -{" "}
                {new Date(booking.scheduled_date).toLocaleTimeString("fa-IR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 ml-2" />
            <div>
              <div className="font-medium">آدرس</div>
              <div>{booking.quote.service_request.city}</div>
            </div>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <DollarSign className="h-4 w-4 ml-2" />
            <div>
              <div className="font-medium">قیمت</div>
              <div>{booking.quote.price.toLocaleString()} تومان</div>
            </div>
          </div>

          {booking.quote.estimated_duration && (
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 ml-2" />
              <div>
                <div className="font-medium">مدت زمان</div>
                <div>{booking.quote.estimated_duration} ساعت</div>
              </div>
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div className="flex items-center text-sm text-gray-600">
          <User className="h-4 w-4 ml-2" />
          <div>
            <div className="font-medium">{userRole === "customer" ? "تکنسین" : "مشتری"}:</div>
            <div>
              {userRole === "customer"
                ? `${booking.quote.technician.profile.first_name} ${booking.quote.technician.profile.last_name}`
                : `${booking.quote.service_request.customer.first_name} ${booking.quote.service_request.customer.last_name}`}
            </div>
            {(userRole === "customer"
              ? booking.quote.technician.profile.phone
              : booking.quote.service_request.customer.phone) && (
              <div className="flex items-center mt-1">
                <Phone className="h-3 w-3 ml-1" />
                <span>
                  {userRole === "customer"
                    ? booking.quote.technician.profile.phone
                    : booking.quote.service_request.customer.phone}
                </span>
              </div>
            )}
          </div>
        </div>

        {booking.notes && (
          <div className="text-sm">
            <div className="font-medium text-gray-900 mb-1">یادداشت:</div>
            <p className="text-gray-600">{booking.notes}</p>
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t">
          <Button asChild variant="outline" size="sm">
            <Link href={`/request/${booking.quote.service_request.id}`}>مشاهده جزئیات</Link>
          </Button>

          {/* Action buttons based on role and status */}
          {userRole === "technician" && booking.status === "scheduled" && (
            <Button size="sm" onClick={() => handleUpdateBookingStatus(booking.id, "in_progress")} disabled={isLoading}>
              شروع کار
            </Button>
          )}

          {userRole === "technician" && booking.status === "in_progress" && (
            <Button size="sm" onClick={() => handleUpdateBookingStatus(booking.id, "completed")} disabled={isLoading}>
              تکمیل کار
            </Button>
          )}

          {booking.status === "scheduled" && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleUpdateBookingStatus(booking.id, "cancelled")}
              disabled={isLoading}
            >
              لغو
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">هنوز رزروی ندارید</h3>
          <p className="text-gray-600 mb-6">رزروهای شما در اینجا نمایش داده می‌شود</p>
          <Button asChild>
            <Link href="/dashboard">بازگشت به داشبورد</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Tabs defaultValue="upcoming" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="upcoming">آینده ({upcomingBookings.length})</TabsTrigger>
        <TabsTrigger value="active">فعال ({activeBookings.length})</TabsTrigger>
        <TabsTrigger value="past">گذشته ({pastBookings.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="upcoming" className="space-y-4">
        {upcomingBookings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <div className="text-4xl mb-2">📅</div>
              <p className="text-gray-600">رزرو آینده‌ای ندارید</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">{upcomingBookings.map(renderBookingCard)}</div>
        )}
      </TabsContent>

      <TabsContent value="active" className="space-y-4">
        {activeBookings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <div className="text-4xl mb-2">🔧</div>
              <p className="text-gray-600">کار فعالی ندارید</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">{activeBookings.map(renderBookingCard)}</div>
        )}
      </TabsContent>

      <TabsContent value="past" className="space-y-4">
        {pastBookings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <div className="text-4xl mb-2">📋</div>
              <p className="text-gray-600">تاریخچه کاری ندارید</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">{pastBookings.map(renderBookingCard)}</div>
        )}
      </TabsContent>
    </Tabs>
  )
}
