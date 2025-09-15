import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Search,
  Shield,
  Star,
  Users,
  CheckCircle,
  ArrowLeft,
  Home,
  Wrench,
  Zap,
  Hammer,
  Paintbrush,
  Scissors,
  Snowflake,
  Leaf,
  Package,
  Monitor,
} from "lucide-react"

export default function HomePage() {
  const services = [
    { icon: Home, name: "نظافت منزل", color: "text-blue-600" },
    { icon: Wrench, name: "لوله کشی", color: "text-red-600" },
    { icon: Zap, name: "برق", color: "text-yellow-600" },
    { icon: Hammer, name: "تعمیر لوازم", color: "text-gray-600" },
    { icon: Paintbrush, name: "نقاشی", color: "text-purple-600" },
    { icon: Scissors, name: "نجاری", color: "text-amber-600" },
    { icon: Snowflake, name: "تهویه مطبوع", color: "text-cyan-600" },
    { icon: Leaf, name: "باغبانی", color: "text-green-600" },
    { icon: Package, name: "اسباب کشی", color: "text-orange-600" },
    { icon: Monitor, name: "تعمیر کامپیوتر", color: "text-indigo-600" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary-foreground" />
                </div>
                <h1 className="text-2xl font-bold text-primary">خدمت از ما</h1>
              </div>
            </div>
            <div className="flex items-center space-x-3 space-x-reverse">
              <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground">
                <Link href="/auth/login">ورود</Link>
              </Button>
              <Button
                asChild
                className="gradient-primary text-primary-foreground shadow-soft hover:shadow-medium transition-all"
              >
                <Link href="/auth/register">ثبت نام</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 gradient-secondary opacity-50"></div>
        <div className="relative max-w-5xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium">
            بیش از ۱۰۰۰ متخصص فعال
          </Badge>
          <h2 className="text-5xl md:text-7xl font-bold text-foreground mb-8 leading-tight">
            بهترین متخصصان را
            <span className="text-primary block">پیدا کنید</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            پلتفرم معتبر خدمات خانگی که شما را به بهترین تکنسین‌های محلی متصل می‌کند. از تعمیرات تا نظافت، همه چیز با
            کیفیت بالا و قیمت مناسب.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              asChild
              size="lg"
              className="gradient-primary text-lg px-10 py-4 shadow-medium hover:shadow-lg transition-all"
            >
              <Link href="/auth/register?role=customer" className="flex items-center space-x-2 space-x-reverse">
                <span>درخواست خدمات</span>
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg px-10 py-4 border-2 hover:bg-muted/50 bg-transparent"
            >
              <Link href="/auth/register?role=technician" className="flex items-center space-x-2 space-x-reverse">
                <Users className="w-5 h-5" />
                <span>پیوستن به تکنسین‌ها</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-foreground mb-4">چرا خدمت از ما؟</h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              ما بهترین تجربه خدمات خانگی را با کیفیت و اعتماد برای شما فراهم می‌کنیم
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-soft hover:shadow-medium transition-all bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">جستجوی هوشمند</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  با فیلترهای پیشرفته و جستجوی مکان‌محور، بهترین متخصصان را در کمترین زمان پیدا کنید
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-soft hover:shadow-medium transition-all bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-accent" />
                </div>
                <CardTitle className="text-xl">متخصصان تأیید شده</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  همه تکنسین‌ها دارای مدارک معتبر و بررسی کامل هستند تا کیفیت خدمات تضمین شود
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-soft hover:shadow-medium transition-all bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">قیمت‌گذاری شفاف</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  قیمت‌های مشخص و رقابتی بدون هزینه پنهان، با امکان مقایسه قیمت‌های مختلف
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-foreground mb-4">خدمات ما</h3>
            <p className="text-xl text-muted-foreground">بیش از ۵۰ نوع خدمات مختلف در دسترس شما</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {services.map((service, index) => {
              const IconComponent = service.icon
              return (
                <Card
                  key={index}
                  className="group text-center p-6 border-0 shadow-soft hover:shadow-medium transition-all cursor-pointer bg-card/50 backdrop-blur-sm hover:bg-card"
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform ${service.color}`}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {service.name}
                  </p>
                </Card>
              )
            })}
          </div>
          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg" className="border-2 bg-transparent">
              <Link href="/services">مشاهده همه خدمات</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">۱۰۰۰+</div>
              <div className="text-primary-foreground/80">متخصص فعال</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">۵۰۰۰+</div>
              <div className="text-primary-foreground/80">پروژه تکمیل شده</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">۴.۸</div>
              <div className="text-primary-foreground/80 flex items-center justify-center space-x-1 space-x-reverse">
                <Star className="w-4 h-4 fill-current" />
                <span>رضایت مشتریان</span>
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">۷۷</div>
              <div className="text-primary-foreground/80">شهر فعال</div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-card border-t border-border py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-2 space-x-reverse mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary-foreground" />
                </div>
                <h4 className="text-xl font-bold text-foreground">خدمت از ما</h4>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                پلتفرم معتبر خدمات خانگی که اعتماد هزاران خانواده ایرانی را جلب کرده است.
              </p>
            </div>
            <div>
              <h5 className="font-semibold text-foreground mb-4">خدمات</h5>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    نظافت منزل
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    تعمیرات
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    باغبانی
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    اسباب کشی
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-foreground mb-4">شرکت</h5>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    درباره ما
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    تماس با ما
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    فرصت‌های شغلی
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    وبلاگ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-foreground mb-4">پشتیبانی</h5>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    مرکز راهنمایی
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    شرایط استفاده
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    حریم خصوصی
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    گزارش مشکل
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-muted-foreground">
            <p>&copy; ۱۴۰۳ خدمت از ما. تمامی حقوق محفوظ است.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
