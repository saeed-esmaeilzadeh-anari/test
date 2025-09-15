import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TechnicianSetupForm } from "@/components/technician/technician-setup-form"

export default async function TechnicianSetupPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  if (!profile || profile.role !== "technician") {
    redirect("/dashboard")
  }

  // Get service categories for selection
  const { data: categories } = await supabase
    .from("service_categories")
    .select("id, name, name_fa")
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
          <h2 className="text-2xl font-bold text-gray-900">تکمیل پروفایل تکنسین</h2>
          <p className="text-gray-600 mt-1">برای شروع کار، لطفاً اطلاعات تکنسین خود را تکمیل کنید</p>
        </div>

        <TechnicianSetupForm user={data.user} profile={profile} categories={categories || []} />
      </div>
    </div>
  )
}
