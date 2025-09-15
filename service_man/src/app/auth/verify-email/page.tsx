import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">تأیید ایمیل</CardTitle>
            <CardDescription className="text-gray-600">لطفاً ایمیل خود را بررسی کنید</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-6xl mb-4">📧</div>
            <p className="text-gray-700">
              ایمیل تأیید به آدرس ایمیل شما ارسال شد. لطفاً روی لینک موجود در ایمیل کلیک کنید تا حساب کاربری خود را فعال
              کنید.
            </p>
            <div className="pt-4">
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/auth/login">بازگشت به صفحه ورود</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
