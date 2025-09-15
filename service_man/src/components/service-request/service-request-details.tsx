"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Clock, DollarSign, User, Star, ArrowLeft, Calendar, Phone } from "lucide-react"
import Link from "next/link"
import { QuoteForm } from "./quote-form"
import { BookingForm } from "./booking-form"

interface ServiceRequestDetailsProps {
  serviceRequest: any
  currentUser: { id: string; email: string }
}

export function ServiceRequestDetails({ serviceRequest, currentUser }: ServiceRequestDetailsProps) {
  const [showQuoteForm, setShowQuoteForm] = useState(false)
  const [showBookingForm, setShowBookingForm] = useState<string | null>(null)
  const supabase = createClient()

  const isCustomer = serviceRequest.customer_id === currentUser.id
  const hasUserQuoted = serviceRequest.quotes?.some((quote: any) => quote.technician.id === currentUser.id)
  const acceptedQuote = serviceRequest.quotes?.find((quote: any) => quote.is_accepted)

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: "در انتظار", variant: "secondary" as const },
      quoted: { label: "قیمت‌گذاری شده", variant: "default" as const },
      accepted: { label: "پذیرفته شده", variant: "default" as const },
      booked: { label: "رزرو شده", variant: "default" as const },
      in_progress: { label: "در حال انجام", variant: "default" as const },
      completed: { label: "تکمیل شده", variant: "default" as const },
      cancelled: { label: "لغو شده", variant: "destructive" as const },
    }
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: "secondary" as const }
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  const handleAcceptQuote = async (quoteId: string) => {
    try {
      // Update quote as accepted
      const { error: quoteError } = await supabase.from("quotes").update({ is_accepted: true }).eq("id", quoteId)

      if (quoteError) throw quoteError

      // Update service request status
      const { error: requestError } = await supabase
        .from("service_requests")
        .update({ status: "accepted" })
        .eq("id", serviceRequest.id)

      if (requestError) throw requestError

      // Refresh page
      window.location.reload()
    } catch (error) {
      console.error("Error accepting quote:", error)
    }
  }

  const handleStartJob = async () => {
    try {
      const { error } = await supabase
        .from("service_requests")
        .update({ status: "in_progress" })
        .eq("id", serviceRequest.id)

      if (error) throw error

      // Update booking status if exists
      if (acceptedQuote) {
        await supabase.from("bookings").update({ status: "in_progress" }).eq("quote_id", acceptedQuote.id)
      }

      window.location.reload()
    } catch (error) {
      console.error("Error starting job:", error)
    }
  }

  const handleCompleteJob = async () => {
    try {
      const { error } = await supabase
        .from("service_requests")
        .update({ status: "completed" })
        .eq("id", serviceRequest.id)

      if (error) throw error

      // Update booking status if exists
      if (acceptedQuote) {
        await supabase.from("bookings").update({ status: "completed" }).eq("quote_id", acceptedQuote.id)
      }

      window.location.reload()
    } catch (error) {
      console.error("Error completing job:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{serviceRequest.title}</h1>
          <p className="text-gray-600 mt-1">{serviceRequest.service?.name_fa}</p>
        </div>
        <div className="flex items-center space-x-4 space-x-reverse">
          {getStatusBadge(serviceRequest.status)}
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 ml-2" />
              بازگشت
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request Details */}
          <Card>
            <CardHeader>
              <CardTitle>جزئیات درخواست</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">توضیحات</h4>
                <p className="text-gray-700">{serviceRequest.description}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 ml-2" />
                  <div>
                    <div className="font-medium">آدرس</div>
                    <div>{serviceRequest.address}</div>
                    <div>{serviceRequest.city}</div>
                  </div>
                </div>

                {serviceRequest.preferred_date && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 ml-2" />
                    <div>
                      <div className="font-medium">تاریخ مطلوب</div>
                      <div>{new Date(serviceRequest.preferred_date).toLocaleDateString("fa-IR")}</div>
                    </div>
                  </div>
                )}

                {(serviceRequest.budget_min || serviceRequest.budget_max) && (
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 ml-2" />
                    <div>
                      <div className="font-medium">بودجه</div>
                      <div>
                        {serviceRequest.budget_min && serviceRequest.budget_max
                          ? `${serviceRequest.budget_min.toLocaleString()} - ${serviceRequest.budget_max.toLocaleString()} تومان`
                          : serviceRequest.budget_min
                            ? `از ${serviceRequest.budget_min.toLocaleString()} تومان`
                            : `تا ${serviceRequest.budget_max.toLocaleString()} تومان`}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 ml-2" />
                  <div>
                    <div className="font-medium">تاریخ ثبت</div>
                    <div>{new Date(serviceRequest.created_at).toLocaleDateString("fa-IR")}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Actions for Technician */}
          {!isCustomer && acceptedQuote && acceptedQuote.technician.id === currentUser.id && (
            <Card>
              <CardHeader>
                <CardTitle>مدیریت کار</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {serviceRequest.status === "accepted" && (
                  <Button onClick={handleStartJob} className="w-full">
                    شروع کار
                  </Button>
                )}
                {serviceRequest.status === "in_progress" && (
                  <Button onClick={handleCompleteJob} className="w-full">
                    تکمیل کار
                  </Button>
                )}
                {serviceRequest.status === "booked" && (
                  <div className="text-center py-4">
                    <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">کار رزرو شده است. منتظر زمان شروع باشید.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quotes */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>پیشنهادات قیمت ({serviceRequest.quotes?.length || 0})</CardTitle>
                {!isCustomer && !hasUserQuoted && serviceRequest.status === "pending" && (
                  <Button onClick={() => setShowQuoteForm(true)} size="sm">
                    ارسال پیشنهاد
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {showQuoteForm && (
                <div className="mb-6">
                  <QuoteForm
                    serviceRequestId={serviceRequest.id}
                    technicianId={currentUser.id}
                    onSuccess={() => {
                      setShowQuoteForm(false)
                      window.location.reload()
                    }}
                    onCancel={() => setShowQuoteForm(false)}
                  />
                </div>
              )}

              {serviceRequest.quotes?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">💰</div>
                  <p>هنوز پیشنهادی ثبت نشده است</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {serviceRequest.quotes?.map((quote: any) => (
                    <div
                      key={quote.id}
                      className={`border rounded-lg p-4 ${quote.is_accepted ? "border-green-200 bg-green-50" : "border-gray-200"}`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">
                              {quote.technician.profile.first_name} {quote.technician.profile.last_name}
                            </h4>
                            <div className="flex items-center text-sm text-gray-600">
                              <Star className="h-3 w-3 text-yellow-400 ml-1" />
                              <span>{quote.technician.rating.toFixed(1)}</span>
                              <span className="mx-2">•</span>
                              <span>{quote.technician.total_jobs} کار انجام شده</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-left">
                          <div className="text-lg font-bold text-green-600">{quote.price.toLocaleString()} تومان</div>
                          {quote.estimated_duration && (
                            <div className="text-sm text-gray-600">مدت زمان: {quote.estimated_duration} ساعت</div>
                          )}
                        </div>
                      </div>

                      {quote.description && (
                        <div className="mb-3">
                          <p className="text-gray-700 text-sm">{quote.description}</p>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-500">
                          {new Date(quote.created_at).toLocaleDateString("fa-IR")}
                        </div>
                        <div className="flex space-x-2 space-x-reverse">
                          {isCustomer && !quote.is_accepted && serviceRequest.status === "pending" && (
                            <Button size="sm" onClick={() => handleAcceptQuote(quote.id)}>
                              پذیرش پیشنهاد
                            </Button>
                          )}
                          {isCustomer && quote.is_accepted && serviceRequest.status === "accepted" && (
                            <Button size="sm" onClick={() => setShowBookingForm(quote.id)}>
                              رزرو زمان
                            </Button>
                          )}
                          {quote.is_accepted && <Badge variant="default">پذیرفته شده</Badge>}
                        </div>
                      </div>

                      {/* Booking Form */}
                      {showBookingForm === quote.id && (
                        <div className="mt-4 pt-4 border-t">
                          <BookingForm
                            quoteId={quote.id}
                            serviceRequestId={serviceRequest.id}
                            onSuccess={() => {
                              setShowBookingForm(null)
                              window.location.reload()
                            }}
                            onCancel={() => setShowBookingForm(null)}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          {!isCustomer && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">اطلاعات مشتری</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">
                      {serviceRequest.customer.first_name} {serviceRequest.customer.last_name}
                    </h4>
                    {serviceRequest.customer.phone && (
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Phone className="h-3 w-3 ml-1" />
                        <span>{serviceRequest.customer.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Technician Info for Customer */}
          {isCustomer && acceptedQuote && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">تکنسین انتخاب شده</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 space-x-reverse mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">
                      {acceptedQuote.technician.profile.first_name} {acceptedQuote.technician.profile.last_name}
                    </h4>
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="h-3 w-3 text-yellow-400 ml-1" />
                      <span>{acceptedQuote.technician.rating.toFixed(1)}</span>
                      <span className="mx-2">•</span>
                      <span>{acceptedQuote.technician.total_jobs} کار</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">قیمت:</span>
                    <span className="font-medium">{acceptedQuote.price.toLocaleString()} تومان</span>
                  </div>
                  {acceptedQuote.estimated_duration && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">مدت زمان:</span>
                      <span className="font-medium">{acceptedQuote.estimated_duration} ساعت</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Service Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">اطلاعات خدمات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900">{serviceRequest.service?.name_fa}</h4>
                  {serviceRequest.service?.description && (
                    <p className="text-sm text-gray-600 mt-1">{serviceRequest.service.description}</p>
                  )}
                </div>
                {serviceRequest.service?.base_price && (
                  <div className="text-sm">
                    <span className="text-gray-600">قیمت پایه: </span>
                    <span className="font-medium">{serviceRequest.service.base_price.toLocaleString()} تومان</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
