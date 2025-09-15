"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, UserIcon, Settings, LogOut, MapPin, Clock, DollarSign } from "lucide-react"
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

interface TechnicianProfile {
  id: string
  bio: string | null
  experience_years: number
  hourly_rate: number | null
  service_areas: string[]
  skills: string[]
  is_verified: boolean
  is_available: boolean
  rating: number
  total_jobs: number
}

interface ServiceRequest {
  id: string
  title: string
  description: string
  address: string
  city: string
  status: string
  budget_min: number | null
  budget_max: number | null
  created_at: string
  service: {
    name: string
    name_fa: string
  }
  customer: {
    first_name: string
    last_name: string
  }
}

interface TechnicianDashboardProps {
  user: { id: string; email: string }
  profile: Profile
}

export function TechnicianDashboard({ user, profile }: TechnicianDashboardProps) {
  const [technicianProfile, setTechnicianProfile] = useState<TechnicianProfile | null>(null)
  const [availableRequests, setAvailableRequests] = useState<ServiceRequest[]>([])
  const [myJobs, setMyJobs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchTechnicianProfile()
    fetchAvailableRequests()
    fetchMyJobs()
  }, [])

  const fetchTechnicianProfile = async () => {
    try {
      const { data, error } = await supabase.from("technician_profiles").select("*").eq("id", user.id).single()

      if (error && error.code !== "PGRST116") {
        throw error
      }

      setTechnicianProfile(data)
    } catch (error) {
      console.error("Error fetching technician profile:", error)
    }
  }

  const fetchAvailableRequests = async () => {
    try {
      // Get service requests that are pending and in technician's service areas
      const { data, error } = await supabase
        .from("service_requests")
        .select(`
          *,
          service:services(name, name_fa),
          customer:profiles!service_requests_customer_id_fkey(first_name, last_name)
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) throw error
      setAvailableRequests(data || [])
    } catch (error) {
      console.error("Error fetching available requests:", error)
    }
  }

  const fetchMyJobs = async () => {
    try {
      // Get quotes and bookings for this technician
      const { data: quotes, error } = await supabase
        .from("quotes")
        .select(`
          *,
          service_request:service_requests(
            *,
            service:services(name, name_fa),
            customer:profiles!service_requests_customer_id_fkey(first_name, last_name)
          )
        `)
        .eq("technician_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setMyJobs(quotes || [])
    } catch (error) {
      console.error("Error fetching my jobs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const toggleAvailability = async () => {
    if (!technicianProfile) return

    try {
      const { error } = await supabase
        .from("technician_profiles")
        .update({ is_available: !technicianProfile.is_available })
        .eq("id", user.id)

      if (error) throw error

      setTechnicianProfile({
        ...technicianProfile,
        is_available: !technicianProfile.is_available,
      })
    } catch (error) {
      console.error("Error updating availability:", error)
    }
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

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">در حال بارگذاری...</div>
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
                <div className="flex flex-col gap-2 mt-2">
                  {technicianProfile?.is_verified ? (
                    <Badge variant="default">تأیید شده</Badge>
                  ) : (
                    <Badge variant="secondary">در انتظار تأیید</Badge>
                  )}
                  {technicianProfile && (
                    <Button
                      size="sm"
                      variant={technicianProfile.is_available ? "default" : "outline"}
                      onClick={toggleAvailability}
                    >
                      {technicianProfile.is_available ? "در دسترس" : "غیر فعال"}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild variant="ghost" className="w-full justify-start">
                  <Link href="/dashboard">
                    <UserIcon className="h-4 w-4 ml-2" />
                    داشبورد
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="w-full justify-start">
                  <Link href="/technician/profile">
                    <Settings className="h-4 w-4 ml-2" />
                    ویرایش پروفایل
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Stats Card */}
            {technicianProfile && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-sm">آمار شما</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">امتیاز:</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 ml-1" />
                      <span className="font-medium">{technicianProfile.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">کارهای انجام شده:</span>
                    <span className="font-medium">{technicianProfile.total_jobs}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">سابقه کار:</span>
                    <span className="font-medium">{technicianProfile.experience_years} سال</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">نرخ ساعتی:</span>
                    <span className="font-medium">
                      {technicianProfile.hourly_rate?.toLocaleString() || "تعیین نشده"} تومان
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">داشبورد تکنسین</h2>
            </div>

            {!technicianProfile ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-6xl mb-4">👷</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">پروفایل تکنسین شما ناقص است</h3>
                  <p className="text-gray-600 mb-6">برای شروع کار، لطفاً پروفایل تکنسین خود را تکمیل کنید</p>
                  <Button asChild>
                    <Link href="/technician/setup">تکمیل پروفایل</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Tabs defaultValue="requests" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="requests">درخواست‌های جدید</TabsTrigger>
                  <TabsTrigger value="jobs">کارهای من</TabsTrigger>
                  <TabsTrigger value="earnings">درآمد</TabsTrigger>
                </TabsList>

                <TabsContent value="requests" className="space-y-4">
                  {availableRequests.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-12">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">درخواست جدیدی وجود ندارد</h3>
                        <p className="text-gray-600">درخواست‌های جدید در منطقه شما در اینجا نمایش داده می‌شود</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {availableRequests.map((request) => (
                        <Card key={request.id} className="hover:shadow-md transition-shadow">
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg">{request.title}</CardTitle>
                                <CardDescription className="mt-1">
                                  {request.service?.name_fa || request.service?.name}
                                </CardDescription>
                                <p className="text-sm text-gray-600 mt-1">
                                  مشتری: {request.customer.first_name} {request.customer.last_name}
                                </p>
                              </div>
                              {getStatusBadge(request.status)}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-600 mb-4 line-clamp-2">{request.description}</p>
                            <div className="flex items-center text-sm text-gray-500 space-x-4 space-x-reverse mb-4">
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 ml-1" />
                                {request.city}
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 ml-1" />
                                {new Date(request.created_at).toLocaleDateString("fa-IR")}
                              </div>
                              {(request.budget_min || request.budget_max) && (
                                <div className="flex items-center">
                                  <DollarSign className="h-4 w-4 ml-1" />
                                  {request.budget_min && request.budget_max
                                    ? `${request.budget_min.toLocaleString()}-${request.budget_max.toLocaleString()}`
                                    : request.budget_min
                                      ? `از ${request.budget_min.toLocaleString()}`
                                      : `تا ${request.budget_max?.toLocaleString()}`}{" "}
                                  تومان
                                </div>
                              )}
                            </div>
                            <div className="flex justify-end">
                              <Button asChild size="sm">
                                <Link href={`/request/${request.id}`}>مشاهده و ارسال پیشنهاد</Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="jobs" className="space-y-4">
                  {myJobs.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-12">
                        <div className="text-6xl mb-4">🛠️</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">هنوز پیشنهادی ارسال نکرده‌اید</h3>
                        <p className="text-gray-600">پیشنهادات و کارهای شما در اینجا نمایش داده می‌شود</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {myJobs.map((job) => (
                        <Card key={job.id} className="hover:shadow-md transition-shadow">
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg">{job.service_request.title}</CardTitle>
                                <CardDescription className="mt-1">
                                  {job.service_request.service?.name_fa}
                                </CardDescription>
                                <p className="text-sm text-gray-600 mt-1">
                                  مشتری: {job.service_request.customer.first_name}{" "}
                                  {job.service_request.customer.last_name}
                                </p>
                              </div>
                              <div className="text-left">
                                <div className="text-lg font-bold text-green-600">
                                  {job.price.toLocaleString()} تومان
                                </div>
                                {job.is_accepted ? (
                                  <Badge variant="default">پذیرفته شده</Badge>
                                ) : (
                                  <Badge variant="secondary">در انتظار پاسخ</Badge>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {job.description && <p className="text-gray-600 mb-4">{job.description}</p>}
                            <div className="flex items-center text-sm text-gray-500 space-x-4 space-x-reverse mb-4">
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 ml-1" />
                                {job.service_request.city}
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 ml-1" />
                                {new Date(job.created_at).toLocaleDateString("fa-IR")}
                              </div>
                              {job.estimated_duration && (
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 ml-1" />
                                  {job.estimated_duration} ساعت
                                </div>
                              )}
                            </div>
                            <div className="flex justify-end">
                              <Button asChild variant="outline" size="sm">
                                <Link href={`/request/${job.service_request.id}`}>مشاهده جزئیات</Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="earnings" className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">درآمد این ماه</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">۰ تومان</div>
                        <p className="text-xs text-gray-500 mt-1">+۰% نسبت به ماه قبل</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">کل درآمد</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">۰ تومان</div>
                        <p className="text-xs text-gray-500 mt-1">از {technicianProfile.total_jobs} کار</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">میانگین درآمد</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">۰ تومان</div>
                        <p className="text-xs text-gray-500 mt-1">به ازای هر کار</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>تاریخچه درآمد</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-500">
                        <div className="text-4xl mb-2">📊</div>
                        <p>تاریخچه درآمد شما پس از تکمیل کارها در اینجا نمایش داده می‌شود</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
