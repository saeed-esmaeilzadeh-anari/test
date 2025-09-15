"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Wrench,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  BarChart3,
} from "lucide-react"

interface DashboardStats {
  totalUsers: number
  totalTechnicians: number
  totalBookings: number
  totalRevenue: number
  pendingBookings: number
  completedBookings: number
  averageRating: number
}

interface RecentBooking {
  id: string
  status: string
  created_at: string
  service_requests: {
    title: string
    service_categories: {
      name: string
    }
  }
  customer_profiles: {
    first_name: string
    last_name: string
  }
  quotes: {
    price: number
    technician_profiles: {
      first_name: string
      last_name: string
    }
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalTechnicians: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingBookings: 0,
    completedBookings: 0,
    averageRating: 0,
  })
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    const supabase = createClient()

    try {
      // Fetch stats
      const [
        { count: totalUsers },
        { count: totalTechnicians },
        { count: totalBookings },
        { data: bookings },
        { data: reviews },
      ] = await Promise.all([
        supabase.from("customer_profiles").select("*", { count: "exact", head: true }),
        supabase.from("technician_profiles").select("*", { count: "exact", head: true }),
        supabase.from("bookings").select("*", { count: "exact", head: true }),
        supabase.from("bookings").select("status, quotes(price)"),
        supabase.from("reviews").select("rating"),
      ])

      const pendingBookings = bookings?.filter((b) => b.status === "confirmed").length || 0
      const completedBookings = bookings?.filter((b) => b.status === "completed").length || 0
      const totalRevenue = bookings?.reduce((sum, booking) => sum + (booking.quotes?.price || 0), 0) || 0
      const averageRating = reviews?.length
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0

      setStats({
        totalUsers: totalUsers || 0,
        totalTechnicians: totalTechnicians || 0,
        totalBookings: totalBookings || 0,
        totalRevenue,
        pendingBookings,
        completedBookings,
        averageRating: Math.round(averageRating * 10) / 10,
      })

      // Fetch recent bookings
      const { data: recentBookingsData } = await supabase
        .from("bookings")
        .select(`
          *,
          service_requests (
            title,
            service_categories (name)
          ),
          customer_profiles (
            first_name,
            last_name
          ),
          quotes (
            price,
            technician_profiles (
              first_name,
              last_name
            )
          )
        `)
        .order("created_at", { ascending: false })
        .limit(10)

      setRecentBookings(recentBookingsData || [])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            در انتظار
          </Badge>
        )
      case "confirmed":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            تأیید شده
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            تکمیل شده
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            لغو شده
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">پنل مدیریت</h1>
              <p className="text-muted-foreground mt-1">مدیریت کامل پلتفرم خدمات</p>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                مدیر سیستم
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-soft border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">کل کاربران</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalUsers.toLocaleString("fa-IR")}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">تکنسین‌ها</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalTechnicians.toLocaleString("fa-IR")}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">کل رزروها</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalBookings.toLocaleString("fa-IR")}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">درآمد کل</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalRevenue.toLocaleString("fa-IR")}</p>
                  <p className="text-xs text-muted-foreground">تومان</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-soft border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">رزروهای در انتظار</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingBookings.toLocaleString("fa-IR")}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">رزروهای تکمیل شده</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completedBookings.toLocaleString("fa-IR")}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">میانگین رضایت</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.averageRating}</p>
                  <div className="flex items-center mt-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs text-muted-foreground mr-1">از ۵</span>
                  </div>
                </div>
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for detailed views */}
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
            <TabsTrigger value="bookings" className="flex items-center space-x-2 space-x-reverse">
              <Calendar className="w-4 h-4" />
              <span>رزروهای اخیر</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2 space-x-reverse">
              <BarChart3 className="w-4 h-4" />
              <span>آمار</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center space-x-2 space-x-reverse">
              <AlertCircle className="w-4 h-4" />
              <span>هشدارها</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <Card className="shadow-soft border-0">
              <CardHeader>
                <CardTitle>رزروهای اخیر</CardTitle>
                <CardDescription>آخرین رزروهای ثبت شده در سیستم</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentBookings.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">رزروی یافت نشد</p>
                  ) : (
                    recentBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/30"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 space-x-reverse mb-2">
                            <h4 className="font-medium text-foreground">{booking.service_requests.title}</h4>
                            {getStatusBadge(booking.status)}
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>
                              مشتری: {booking.customer_profiles.first_name} {booking.customer_profiles.last_name}
                            </p>
                            <p>
                              تکنسین: {booking.quotes.technician_profiles.first_name}{" "}
                              {booking.quotes.technician_profiles.last_name}
                            </p>
                            <p>تاریخ: {new Date(booking.created_at).toLocaleDateString("fa-IR")}</p>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="text-lg font-bold text-primary">
                            {booking.quotes.price.toLocaleString("fa-IR")}
                          </p>
                          <p className="text-xs text-muted-foreground">تومان</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-soft border-0">
                <CardHeader>
                  <CardTitle>عملکرد ماهانه</CardTitle>
                  <CardDescription>آمار رشد پلتفرم در ماه‌های اخیر</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">رشد کاربران</span>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">+۱۲٪</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">رشد درآمد</span>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">+۱۸٪</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">رشد تکنسین‌ها</span>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">+۸٪</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-soft border-0">
                <CardHeader>
                  <CardTitle>محبوب‌ترین خدمات</CardTitle>
                  <CardDescription>خدماتی که بیشترین تقاضا را دارند</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: "نظافت منزل", percentage: 35 },
                      { name: "تعمیرات لوله کشی", percentage: 28 },
                      { name: "تعمیرات برق", percentage: 22 },
                      { name: "نقاشی ساختمان", percentage: 15 },
                    ].map((service, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-foreground">{service.name}</span>
                          <span className="text-muted-foreground">{service.percentage}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${service.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="alerts">
            <Card className="shadow-soft border-0">
              <CardHeader>
                <CardTitle>هشدارهای سیستم</CardTitle>
                <CardDescription>موارد مهم که نیاز به توجه دارند</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 space-x-reverse p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">رزروهای در انتظار تأیید</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        {stats.pendingBookings} رزرو در انتظار تأیید تکنسین هستند
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 space-x-reverse p-4 border border-blue-200 rounded-lg bg-blue-50">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800">تکنسین‌های جدید</h4>
                      <p className="text-sm text-blue-700 mt-1">۵ تکنسین جدید منتظر تأیید مدارک هستند</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 space-x-reverse p-4 border border-green-200 rounded-lg bg-green-50">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-800">عملکرد مثبت</h4>
                      <p className="text-sm text-green-700 mt-1">
                        میانگین رضایت مشتریان در هفته گذشته ۴.۸ از ۵ بوده است
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
