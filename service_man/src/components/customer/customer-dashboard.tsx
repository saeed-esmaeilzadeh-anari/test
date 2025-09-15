"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, MapPin, Clock, UserIcon, Settings, LogOut, Calendar } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Profile {
  id: string
  role: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  address: string | null
  city: string | null
}

interface ServiceRequest {
  id: string
  title: string
  description: string
  address: string
  city: string
  status: string
  created_at: string
  service: {
    name: string
    name_fa: string
  }
}

interface CustomerDashboardProps {
  user: any
  profile: Profile
}

export function CustomerDashboard({ user, profile }: CustomerDashboardProps) {
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([])
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchServiceRequests()
    fetchUpcomingBookings()
  }, [])

  const fetchServiceRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("service_requests")
        .select(`
          *,
          service:services(name, name_fa)
        `)
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setServiceRequests(data || [])
    } catch (error) {
      console.error("Error fetching service requests:", error)
    }
  }

  const fetchUpcomingBookings = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          quote:quotes(
            price,
            technician:technician_profiles(
              profile:profiles!technician_profiles_id_fkey(first_name, last_name)
            ),
            service_request:service_requests(
              title,
              service:services(name_fa)
            )
          )
        `)
        .eq("quote.service_request.customer_id", user.id)
        .eq("status", "scheduled")
        .gte("scheduled_date", new Date().toISOString())
        .order("scheduled_date", { ascending: true })
        .limit(3)

      if (error) throw error
      setUpcomingBookings(data || [])
    } catch (error) {
      console.error("Error fetching upcoming bookings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: "در انتظار", variant: "secondary" as const },
      quoted: { label: "قیمت‌گذاری شده", variant: "default" as const },
      accepted: { label: "پذیرفته شده", variant: "default" as const },
      in_progress: { label: "در حال انجام", variant: "default" as const },
      completed: { label: "تکمیل شده", variant: "default" as const },
      cancelled: { label: "لغو شده", variant: "destructive" as const },
    }
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: "secondary" as const }
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">خدمت از ما</h1>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <span className="text-sm text-gray-600">
                سلام، {profile.first_name} {profile.last_name}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 ml-2" />
                خروج
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <Card>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserIcon className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-lg">
                  {profile.first_name} {profile.last_name}
                </CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild variant="ghost" className="w-full justify-start">
                  <Link href="/dashboard">
                    <UserIcon className="h-4 w-4 ml-2" />
                    داشبورد
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="w-full justify-start">
                  <Link href="/profile">
                    <Settings className="h-4 w-4 ml-2" />
                    ویرایش پروفایل
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">داشبورد مشتری</h2>
              <Button asChild>
                <Link href="/request-service">
                  <Plus className="h-4 w-4 ml-2" />
                  درخواست خدمات جدید
                </Link>
              </Button>
            </div>

            {upcomingBookings.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>رزروهای آینده</CardTitle>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/bookings">مشاهده همه</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div>
                          <h4 className="font-medium">{booking.quote.service_request.title}</h4>
                          <p className="text-sm text-gray-600">
                            {booking.quote.technician.profile.first_name} {booking.quote.technician.profile.last_name}
                          </p>
                        </div>
                        <div className="text-left">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 ml-1" />
                            {new Date(booking.scheduled_date).toLocaleDateString("fa-IR")}
                          </div>
                          <div className="text-sm font-medium">{booking.quote.price.toLocaleString()} تومان</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Tabs defaultValue="requests" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="requests">درخواست‌های من</TabsTrigger>
                <TabsTrigger value="history">تاریخچه</TabsTrigger>
              </TabsList>

              <TabsContent value="requests" className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8">در حال بارگذاری...</div>
                ) : serviceRequests.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <div className="text-6xl mb-4">🔧</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">هنوز درخواستی ندارید</h3>
                      <p className="text-gray-600 mb-6">اولین درخواست خدمات خود را ایجاد کنید</p>
                      <Button asChild>
                        <Link href="/request-service">درخواست خدمات جدید</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {serviceRequests.map((request) => (
                      <Card key={request.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{request.title}</CardTitle>
                              <CardDescription className="mt-1">
                                {request.service?.name_fa || request.service?.name}
                              </CardDescription>
                            </div>
                            {getStatusBadge(request.status)}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600 mb-4">{request.description}</p>
                          <div className="flex items-center text-sm text-gray-500 space-x-4 space-x-reverse">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 ml-1" />
                              {request.city}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 ml-1" />
                              {new Date(request.created_at).toLocaleDateString("fa-IR")}
                            </div>
                          </div>
                          <div className="mt-4 flex justify-end">
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/request/${request.id}`}>مشاهده جزئیات</Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <Card>
                  <CardContent className="text-center py-12">
                    <div className="text-6xl mb-4">📋</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">تاریخچه خدمات</h3>
                    <p className="text-gray-600">تاریخچه خدمات تکمیل شده شما در اینجا نمایش داده می‌شود</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
