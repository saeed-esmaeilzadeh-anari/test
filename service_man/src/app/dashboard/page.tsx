import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CustomerDashboard } from "@/components/customer/customer-dashboard"
import { TechnicianDashboard } from "@/components/technician/technician-dashboard"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile to determine role
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  // Render appropriate dashboard based on user role
  if (profile.role === "customer") {
    return <CustomerDashboard user={data.user} profile={profile} />
  } else if (profile.role === "technician") {
    return <TechnicianDashboard user={data.user} profile={profile} />
  } else {
    // Admin dashboard would go here
    return <div>Admin Dashboard Coming Soon</div>
  }
}
