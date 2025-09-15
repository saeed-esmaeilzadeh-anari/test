import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ServiceRequestForm } from "@/components/service-request/service-request-form"

export default async function RequestServicePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  if (!profile || profile.role !== "customer") {
    redirect("/dashboard")
  }

  // Get service categories and services
  const { data: categories } = await supabase
    .from("service_categories")
    .select(`
      id,
      name,
      name_fa,
      services (
        id,
        name,
        name_fa,
        description,
        base_price
      )
    `)
    .eq("is_active", true)
    .order("name")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">خدمت از ما</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">درخواست خدمات جدید</h2>
          <p className="text-gray-600 mt-1">خدمات مورد نیاز خود را درخواست کنید</p>
        </div>

        <ServiceRequestForm user={data.user} profile={profile} categories={categories || []} />
      </div>
    </div>
  )
}
