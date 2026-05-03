"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion"
import {
  Bell, MessageSquare, Mail, Phone, Users, Calendar, Zap, Shield,
  ChevronRight, Check, Star, ArrowRight, Sparkles, Globe, Clock,
  BarChart3, Repeat, CreditCard, Building2, Menu, X, Bot,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"

// ─── Animation Variants ───────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
}
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
}
const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
}
const slideLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
}

function useScrollReveal() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  return { ref, isInView }
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  { name: "Ayşe Kaya", role: "İK Direktörü, TechCorp", text: "Hatirlat.io ile ekibimiz artık hiçbir toplantıyı, randevuyu veya son tarihi kaçırmıyor. Verimlilik %40 arttı.", avatar: "AK", stars: 5 },
  { name: "Mehmet Demir", role: "Operasyon Müdürü, LogiNet", text: "WhatsApp ve SMS entegrasyonu muhteşem. Müşterilerimiz bildirimleri anında alıyor. Kesinlikle tavsiye ederim.", avatar: "MD", stars: 5 },
  { name: "Selin Arslan", role: "Kurucu, StartupHub", text: "Kurulumu 5 dakika sürdü. Şimdi 200+ kişilik ekibime otomatik hatırlatıcılar gönderiyorum. Hayat kurtarıcı!", avatar: "SA", stars: 5 },
  { name: "Can Yıldız", role: "CTO, DataFlow", text: "API entegrasyonu son derece temiz. Geliştirici dostu bir platform. Audit log özelliği harika.", avatar: "CY", stars: 5 },
  { name: "Zeynep Çelik", role: "Proje Yöneticisi, BuildCo", text: "Grup hatırlatıcıları özelliği sayesinde tüm ekibimizi tek noktadan yönetiyoruz. Mükemmel!", avatar: "ZÇ", stars: 5 },
  { name: "Ali Öztürk", role: "CEO, E-Ticaret Plus", text: "Müşteri bildirim sistemimizi tamamen Hatirlat.io üzerine kurduk. Açılma oranları %85'e çıktı.", avatar: "AÖ", stars: 5 },
]

const BENTO_FEATURES = [
  {
    icon: MessageSquare,
    title: "Çok Kanallı Teslimat",
    desc: "SMS, WhatsApp ve E-posta üzerinden eş zamanlı bildirim gönderin. Türkiye için Netgsm, uluslararası için Twilio.",
    color: "from-violet-600/20 to-purple-600/10",
    border: "border-violet-500/20",
    glow: "shadow-violet-500/10",
    size: "col-span-2",
    icons: [Phone, MessageSquare, Mail],
  },
  {
    icon: Users,
    title: "Grup & Ekip Yönetimi",
    desc: "Yüzlerce kişiye tek tıkla toplu bildirim gönderin.",
    color: "from-blue-600/20 to-cyan-600/10",
    border: "border-blue-500/20",
    glow: "shadow-blue-500/10",
    size: "",
    icons: [],
  },
  {
    icon: Repeat,
    title: "Tekrarlayan Olaylar",
    desc: "Günlük, haftalık, aylık veya özel periyotlarla otomatik hatırlatıcılar.",
    color: "from-emerald-600/20 to-teal-600/10",
    border: "border-emerald-500/20",
    glow: "shadow-emerald-500/10",
    size: "",
    icons: [],
  },
  {
    icon: CreditCard,
    title: "Kredi Tabanlı Sistem",
    desc: "Sadece kullandığın kadar öde. Esnek kredi paketleri ile bütçeni kontrol altında tut.",
    color: "from-amber-600/20 to-orange-600/10",
    border: "border-amber-500/20",
    glow: "shadow-amber-500/10",
    size: "",
    icons: [],
  },
  {
    icon: BarChart3,
    title: "Gelişmiş Analitik & Audit Log",
    desc: "Her bildirimin durumunu, maliyetini ve teslimat süresini gerçek zamanlı takip et.",
    color: "from-pink-600/20 to-rose-600/10",
    border: "border-pink-500/20",
    glow: "shadow-pink-500/10",
    size: "col-span-2",
    icons: [],
  },
]

const STEPS = [
  {
    num: "01",
    icon: Bell,
    title: "Hatırlatıcıyı Kur",
    desc: "Başlık, mesaj ve zamanı belirle. Tek seferlik veya tekrarlayan olarak ayarla.",
    color: "text-violet-400",
    bg: "from-violet-600/20 to-transparent",
    glow: "shadow-violet-500/20",
  },
  {
    num: "02",
    icon: Globe,
    title: "Kanalları Seç",
    desc: "SMS, WhatsApp veya E-posta kanallarından birini ya da hepsini seç. Türk numaraları otomatik yönlendirilir.",
    color: "text-blue-400",
    bg: "from-blue-600/20 to-transparent",
    glow: "shadow-blue-500/20",
  },
  {
    num: "03",
    icon: Zap,
    title: "Bildirimi Al",
    desc: "Zamanı geldiğinde platform otomatik olarak gönderir. Sen sadece önemli işlerine odaklan.",
    color: "text-emerald-400",
    bg: "from-emerald-600/20 to-transparent",
    glow: "shadow-emerald-500/20",
  },
]

const PLANS = [
  {
    name: "Ücretsiz",
    price: "₺0",
    period: "/ ay",
    desc: "Bireysel kullanım için mükemmel başlangıç.",
    cta: "Hemen Başla",
    ctaHref: "/register",
    popular: false,
    color: "border-white/10",
    features: [
      "10 aktif hatırlatıcı",
      "E-posta bildirimleri",
      "Temel grup yönetimi",
      "7 günlük geçmiş",
      "Standart destek",
    ],
    missing: ["SMS & WhatsApp", "Tekrarlayan olaylar", "Audit log", "API erişimi"],
  },
  {
    name: "Premium",
    price: "₺299",
    period: "/ ay",
    desc: "Takımlar ve büyüyen işletmeler için.",
    cta: "Premium'a Geç",
    ctaHref: "/register",
    popular: true,
    color: "border-violet-500/50",
    features: [
      "Sınırsız hatırlatıcı",
      "SMS + WhatsApp + E-posta",
      "Gelişmiş grup yönetimi",
      "90 günlük geçmiş & audit log",
      "Tekrarlayan olaylar",
      "1.000 SMS kredisi / ay",
      "Öncelikli destek",
    ],
    missing: [],
  },
  {
    name: "Kurumsal",
    price: "Özel",
    period: "",
    desc: "Büyük ölçekli operasyonlar için özelleştirilmiş çözüm.",
    cta: "Bize Ulaşın",
    ctaHref: "/register",
    popular: false,
    color: "border-white/10",
    features: [
      "Her şey Premium'da +",
      "Sınırsız SMS & WhatsApp",
      "Özel API entegrasyonu",
      "SSO & SAML",
      "SLA garantisi",
      "Özel hesap yöneticisi",
      "On-premise seçenek",
    ],
    missing: [],
  },
]

// ─── Dashboard Mockup ─────────────────────────────────────────────────────────

function DashboardMockup() {
  const reminders = [
    { title: "Takım Toplantısı", time: "14:00", channel: "WP", status: "sent", color: "bg-emerald-500" },
    { title: "Proje Teslimi", time: "17:30", channel: "SMS", status: "pending", color: "bg-amber-500" },
    { title: "Müşteri Görüşmesi", time: "10:00", channel: "E-P", status: "sent", color: "bg-blue-500" },
    { title: "Fatura Son Tarihi", time: "23:59", channel: "SMS", status: "scheduled", color: "bg-violet-500" },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, rotateX: 15 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
      className="relative w-full max-w-lg mx-auto"
      style={{ perspective: "1000px" }}
    >
      {/* Glow behind */}
      <div className="absolute inset-0 rounded-2xl bg-violet-600/20 blur-3xl scale-110 -z-10" />
      <div className="absolute inset-0 rounded-2xl bg-blue-600/10 blur-2xl scale-105 -z-10" />

      {/* Main card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-amber-500/70" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
          </div>
          <div className="flex-1 text-center text-xs text-white/40 font-mono">hatirlat.io / dashboard</div>
        </div>

        <div className="p-4 space-y-3">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Aktif", val: "24", color: "text-emerald-400" },
              { label: "Bu Ay", val: "148", color: "text-blue-400" },
              { label: "Başarı", val: "99%", color: "text-violet-400" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-white/5 border border-white/8 p-3 text-center">
                <div className={`text-lg font-bold ${s.color}`}>{s.val}</div>
                <div className="text-[10px] text-white/40 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Reminder list */}
          <div className="space-y-2">
            {reminders.map((r, i) => (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/8 px-3 py-2.5 group hover:bg-white/10 transition-colors"
              >
                <div className={`w-2 h-2 rounded-full ${r.color} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-white/90 truncate">{r.title}</div>
                  <div className="text-[10px] text-white/40">{r.time}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold rounded-md px-1.5 py-0.5 bg-white/10 text-white/60">{r.channel}</span>
                  <div className={`w-1.5 h-1.5 rounded-full ${r.status === "sent" ? "bg-emerald-400" : r.status === "pending" ? "bg-amber-400" : "bg-violet-400"}`} />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mini chart */}
          <div className="rounded-xl bg-white/5 border border-white/8 p-3">
            <div className="text-[10px] text-white/40 mb-2">Bu Hafta Gönderimler</div>
            <div className="flex items-end gap-1 h-10">
              {[30, 55, 40, 80, 65, 90, 75].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: 1 + i * 0.07, duration: 0.5, ease: "easeOut" }}
                  className="flex-1 rounded-t-sm bg-gradient-to-t from-violet-600/80 to-blue-500/60"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating notification */}
      <motion.div
        initial={{ opacity: 0, x: 60, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="absolute -right-4 top-16 rounded-xl border border-emerald-500/30 bg-black/60 backdrop-blur-xl shadow-xl px-3 py-2 flex items-center gap-2"
      >
        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <Check className="w-3 h-3 text-emerald-400" />
        </div>
        <div>
          <div className="text-[10px] font-semibold text-white">Bildirim Gönderildi</div>
          <div className="text-[9px] text-white/50">WhatsApp • şimdi</div>
        </div>
      </motion.div>

      {/* Floating channel badges */}
      <motion.div
        initial={{ opacity: 0, x: -40, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ delay: 1.4, duration: 0.5 }}
        className="absolute -left-4 bottom-20 rounded-xl border border-white/10 bg-black/60 backdrop-blur-xl shadow-xl p-2.5 flex gap-1.5"
      >
        {[
          { icon: MessageSquare, color: "text-emerald-400", bg: "bg-emerald-500/20" },
          { icon: Phone, color: "text-blue-400", bg: "bg-blue-500/20" },
          { icon: Mail, color: "text-violet-400", bg: "bg-violet-500/20" },
        ].map(({ icon: Icon, color, bg }, i) => (
          <div key={i} className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center`}>
            <Icon className={`w-3.5 h-3.5 ${color}`} />
          </div>
        ))}
      </motion.div>
    </motion.div>
  )
}

// ─── Marquee ─────────────────────────────────────────────────────────────────

function Marquee({ children, reverse = false }: { children: React.ReactNode; reverse?: boolean }) {
  return (
    <div className="overflow-hidden">
      <div
        className={`flex gap-4 ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}
        style={{ width: "max-content" }}
      >
        {children}
        {children}
      </div>
    </div>
  )
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", fn)
    return () => window.removeEventListener("scroll", fn)
  }, [])

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-black/60 backdrop-blur-xl border-b border-white/10 shadow-xl"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Bell className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">Hatirlat<span className="text-violet-400">.io</span></span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
            {[["Özellikler", "#features"], ["Nasıl Çalışır", "#how"], ["Fiyatlar", "#pricing"], ["İletişim", "#contact"]].map(([label, href]) => (
              <a key={label} href={href} className="hover:text-white transition-colors">{label}</a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Link href="/dashboard" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all hover:scale-105">
                Dashboard <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm text-white/70 hover:text-white transition-colors px-3 py-2">Giriş Yap</Link>
                <Link href="/register" className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all hover:scale-105">
                  Ücretsiz Başla <Sparkles className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-white/70 hover:text-white">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 bg-black/80 backdrop-blur-xl"
          >
            <div className="px-4 py-4 space-y-3">
              {[["Özellikler", "#features"], ["Nasıl Çalışır", "#how"], ["Fiyatlar", "#pricing"]].map(([label, href]) => (
                <a key={label} href={href} onClick={() => setMobileOpen(false)} className="block py-2 text-white/70 hover:text-white text-sm">{label}</a>
              ))}
              <div className="pt-2 flex flex-col gap-2">
                <Link href="/login" className="text-center py-2 text-sm text-white/70 border border-white/10 rounded-xl">Giriş Yap</Link>
                <Link href="/register" className="text-center py-2 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-blue-600 rounded-xl">Ücretsiz Başla</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const { scrollYProgress } = useScroll()
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])

  // Redirect authenticated users
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading || isAuthenticated) return null

  return (
    <div className="min-h-screen bg-[#050510] text-white overflow-x-hidden">
      {/* Scroll progress */}
      <motion.div
        className="fixed top-0 left-0 h-[2px] bg-gradient-to-r from-violet-600 to-blue-500 z-[100]"
        style={{ width: progressWidth }}
      />

      {/* Background orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-violet-700/10 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-blue-700/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-cyan-700/8 blur-[100px]" />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center py-20 lg:py-28">
            {/* Left */}
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              {/* Badge */}
              <motion.div variants={fadeUp}>
                <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300">
                  <Bot className="w-3.5 h-3.5" />
                  Akıllı Bildirim Platformu
                  <span className="flex w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                </span>
              </motion.div>

              {/* Headline */}
              <motion.div variants={fadeUp}>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight">
                  <span className="text-white">Asla Unutma,</span>
                  <br />
                  <span className="text-white">Her Anı</span>{" "}
                  <span className="relative">
                    <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                      Yakala.
                    </span>
                    <motion.span
                      className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-violet-400/0 via-violet-400/80 to-violet-400/0"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 1, duration: 0.8 }}
                    />
                  </span>
                  <br />
                  <span className="text-white/70 text-3xl sm:text-4xl lg:text-5xl font-bold">Akıllı Hatırlatıcı Sistemin.</span>
                </h1>
              </motion.div>

              {/* Sub */}
              <motion.p variants={fadeUp} className="text-lg text-white/50 leading-relaxed max-w-lg">
                SMS, WhatsApp ve E-posta üzerinden otomatik bildirimler gönder. Bireyler, ekipler ve işletmeler için
                tasarlandı. Tek platform, sonsuz olasılık.
              </motion.p>

              {/* Channel icons */}
              <motion.div variants={fadeUp} className="flex items-center gap-3">
                {[
                  { icon: MessageSquare, label: "WhatsApp", color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/30" },
                  { icon: Phone, label: "SMS", color: "text-blue-400", bg: "bg-blue-500/15 border-blue-500/30" },
                  { icon: Mail, label: "E-posta", color: "text-violet-400", bg: "bg-violet-500/15 border-violet-500/30" },
                ].map(({ icon: Icon, label, color, bg }) => (
                  <div key={label} className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${bg} ${color}`}>
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </div>
                ))}
              </motion.div>

              {/* CTAs */}
              <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-3.5 text-base font-semibold text-white shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 transition-all hover:scale-105 active:scale-100"
                >
                  <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
                  <span className="relative">Ücretsiz Başla</span>
                  <Sparkles className="relative w-4 h-4 group-hover:rotate-12 transition-transform" />
                </Link>
                <a
                  href="#how"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-base font-medium text-white/80 hover:bg-white/10 hover:text-white transition-all hover:scale-105 active:scale-100"
                >
                  Nasıl Çalışır <ChevronRight className="w-4 h-4" />
                </a>
              </motion.div>

              {/* Social proof mini */}
              <motion.div variants={fadeUp} className="flex items-center gap-3 pt-2">
                <div className="flex -space-x-2">
                  {["AK", "MD", "SA", "CY"].map((a) => (
                    <div key={a} className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-[10px] font-bold border-2 border-[#050510]">
                      {a}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                  </div>
                  <div className="text-xs text-white/40 mt-0.5">500+ ekip kullanıyor</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right — Dashboard */}
            <div className="lg:pl-8">
              <DashboardMockup />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20"
        >
          <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-white/40" />
          </div>
        </motion.div>
      </section>

      {/* ── FEATURES BENTO ───────────────────────────────────────────────────── */}
      <section id="features" className="py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Özellikler"
            title="Her İhtiyacına Göre Tasarlandı"
            sub="Tek platform ile SMS, WhatsApp ve E-posta bildirimlerini yönet. Kurumsal ölçekte, bireysel kolaylıkta."
          />

          <BentoGrid />
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section id="how" className="py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/10 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <SectionHeader
            badge="Nasıl Çalışır"
            title="3 Adımda Aktif Ol"
            sub="Dakikalar içinde kur, saniyeler içinde bildirimler ulaşsın. Teknik bilgi gerektirmez."
          />

          <StepsGrid />
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Fiyatlandırma"
            title="Şeffaf, Adil Fiyatlar"
            sub="Gizli ücret yok. Sadece kullandığın kadar öde. Her ölçekte büyümeye hazır."
          />

          <div className="mt-16 grid md:grid-cols-3 gap-6">
            {PLANS.map((plan, i) => <PricingCard key={plan.name} plan={plan} i={i} />)}
          </div>
          <CreditBanner />
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────────── */}
      <section className="py-28 overflow-hidden">
        <SectionHeader
          badge="Müşteri Yorumları"
          title="500+ Ekip Güveniyor"
          sub="Hatirlat.io ile iş süreçlerini otomatikleştiren kullanıcıların deneyimleri."
        />

        <div className="mt-16 space-y-4">
          <Marquee>
            {TESTIMONIALS.map((t) => <TestimonialCard key={t.name} t={t} />)}
          </Marquee>
          <Marquee reverse>
            {[...TESTIMONIALS].reverse().map((t) => <TestimonialCard key={t.name + "r"} t={t} />)}
          </Marquee>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────────── */}
      <section className="py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/20 to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <CTASection />
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer id="contact" className="border-t border-white/8 bg-black/20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white text-lg">Hatirlat<span className="text-violet-400">.io</span></span>
              </div>
              <p className="text-sm text-white/40 leading-relaxed">
                Akıllı çok kanallı bildirim platformu. SMS, WhatsApp ve E-posta ile hiçbir şeyi kaçırma.
              </p>
            </div>

            {/* Links */}
            {[
              { title: "Ürün", links: ["Özellikler", "Fiyatlandırma", "Nasıl Çalışır", "API Dökümanı"] },
              { title: "Şirket", links: ["Hakkımızda", "Blog", "Kariyer", "İletişim"] },
              { title: "Hukuki", links: ["Gizlilik Politikası", "Kullanım Şartları", "KVKK", "Çerez Politikası"] },
            ].map(({ title, links }) => (
              <div key={title}>
                <div className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">{title}</div>
                <ul className="space-y-2.5">
                  {links.map((l) => (
                    <li key={l}>
                      <a href="#" className="text-sm text-white/50 hover:text-white transition-colors">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-white/30">© 2026 Hatirlat.io — Tüm hakları saklıdır.</div>
            <div className="flex items-center gap-4">
              {[
                { ch: "WA", label: "WhatsApp", color: "text-emerald-400 bg-emerald-500/10" },
                { ch: "SMS", label: "SMS", color: "text-blue-400 bg-blue-500/10" },
                { ch: "E-P", label: "E-posta", color: "text-violet-400 bg-violet-500/10" },
              ].map(({ ch, label, color }) => (
                <span key={label} className={`text-[10px] font-bold rounded-md px-2 py-1 ${color}`}>{ch}</span>
              ))}
              <span className="text-xs text-white/20">Çok Kanallı Platform</span>
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-marquee { animation: marquee 35s linear infinite; }
        .animate-marquee-reverse { animation: marquee-reverse 35s linear infinite; }
        .animate-marquee:hover, .animate-marquee-reverse:hover { animation-play-state: paused; }
      `}</style>
    </div>
  )
}

// ─── Bento Grid (hooks-safe) ──────────────────────────────────────────────────

function BentoCard({ f, i }: { f: typeof BENTO_FEATURES[0]; i: number }) {
  const { ref, isInView } = useScrollReveal()
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: i * 0.1, duration: 0.6 }}
      className={`relative rounded-2xl border ${f.border} bg-gradient-to-br ${f.color} backdrop-blur-sm p-6 overflow-hidden group hover:scale-[1.02] transition-transform cursor-default shadow-xl ${f.glow} ${f.size}`}
    >
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-100 transition-opacity blur-sm`} />
      <div className="relative z-10 h-full flex flex-col justify-between">
        <div>
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4">
            <f.icon className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
          <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
        </div>
        {f.icons.length > 0 && (
          <div className="flex gap-2 mt-4">
            {f.icons.map((Icon, j) => (
              <div key={j} className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
                <Icon className="w-4 h-4 text-white/70" />
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-white/5 blur-xl" />
    </motion.div>
  )
}

function BentoGrid() {
  return (
    <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[220px]">
      {BENTO_FEATURES.map((f, i) => <BentoCard key={f.title} f={f} i={i} />)}
    </div>
  )
}

// ─── Steps Grid (hooks-safe) ──────────────────────────────────────────────────

function StepCard({ step, i }: { step: typeof STEPS[0]; i: number }) {
  const { ref, isInView } = useScrollReveal()
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: i * 0.2, duration: 0.7 }}
    >
      <div className={`rounded-2xl border border-white/10 bg-gradient-to-b ${step.bg} p-6 h-full hover:border-white/20 transition-colors shadow-xl ${step.glow}`}>
        <div className="flex items-center gap-3 mb-5">
          <div className="relative w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg">
            <step.icon className={`w-5 h-5 ${step.color}`} />
            <div className={`absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#050510] border border-white/10 flex items-center justify-center text-[9px] font-bold ${step.color}`}>
              {i + 1}
            </div>
          </div>
          <span className={`text-5xl font-black opacity-10 ${step.color}`}>{step.num}</span>
        </div>
        <h3 className="text-lg font-bold text-white mb-3">{step.title}</h3>
        <p className="text-sm text-white/50 leading-relaxed">{step.desc}</p>
      </div>
    </motion.div>
  )
}

function StepsGrid() {
  return (
    <div className="mt-16 grid md:grid-cols-3 gap-6 relative">
      <div className="hidden md:block absolute top-12 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px bg-gradient-to-r from-violet-600/50 via-blue-600/50 to-emerald-600/50" />
      {STEPS.map((step, i) => <StepCard key={step.title} step={step} i={i} />)}
    </div>
  )
}

// ─── Pricing Grid (hooks-safe) ────────────────────────────────────────────────

function PricingCard({ plan, i }: { plan: typeof PLANS[0]; i: number }) {
  const { ref, isInView } = useScrollReveal()
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: i * 0.15, duration: 0.7 }}
      className={`relative rounded-2xl border ${plan.color} p-6 flex flex-col ${
        plan.popular
          ? "bg-gradient-to-b from-violet-600/15 to-blue-600/10 shadow-2xl shadow-violet-500/20 scale-[1.03]"
          : "bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-1 text-xs font-bold text-white shadow-lg shadow-violet-500/30">
            <Sparkles className="w-3 h-3" /> En Popüler
          </span>
        </div>
      )}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-semibold text-white/60">{plan.name}</span>
          {plan.popular && <span className="text-[10px] text-violet-400 font-medium">✦ Tavsiye Edilen</span>}
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-black text-white">{plan.price}</span>
          {plan.period && <span className="text-sm text-white/40">{plan.period}</span>}
        </div>
        <p className="text-sm text-white/40 mt-2">{plan.desc}</p>
      </div>
      <div className="space-y-3 flex-1">
        {plan.features.map((f) => (
          <div key={f} className="flex items-start gap-2.5 text-sm text-white/70">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            {f}
          </div>
        ))}
        {plan.missing.map((f) => (
          <div key={f} className="flex items-start gap-2.5 text-sm text-white/25 line-through">
            <X className="w-4 h-4 text-white/20 shrink-0 mt-0.5" />
            {f}
          </div>
        ))}
      </div>
      <Link
        href={plan.ctaHref}
        className={`mt-8 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all hover:scale-105 ${
          plan.popular
            ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
            : "border border-white/10 text-white/70 hover:bg-white/[0.08] hover:text-white"
        }`}
      >
        {plan.cta} <ArrowRight className="w-4 h-4" />
      </Link>
    </motion.div>
  )
}

// ─── CTA Section (hooks-safe) ─────────────────────────────────────────────────

function CTASection() {
  const { ref, isInView } = useScrollReveal()
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7 }}
      className="rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-600/10 via-blue-600/5 to-transparent p-12 shadow-2xl shadow-violet-500/10 relative overflow-hidden"
    >
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-40 rounded-full bg-violet-600/20 blur-3xl" />
      <div className="relative text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300 mb-6">
          <Sparkles className="w-3.5 h-3.5" /> Hemen Başla, Kredi Kartı Gerekmez
        </div>
        <h2 className="text-4xl sm:text-5xl font-black mb-4">
          Hiçbir Şeyi <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">Kaçırma.</span>
        </h2>
        <p className="text-lg text-white/50 mb-8">
          Dakikalar içinde kur, hemen bildirim göndermeye başla. Ücretsiz plan ile sınırsız süre kullan.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50 transition-all hover:scale-105"
          >
            Ücretsiz Başla <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-base font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all"
          >
            Zaten hesabım var
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Credit Banner (hooks-safe) ───────────────────────────────────────────────

function CreditBanner() {
  const { ref, isInView } = useScrollReveal()
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="mt-10 rounded-2xl border border-white/8 bg-white/[0.03] p-5 flex flex-wrap items-center justify-between gap-4"
    >
      <div className="flex items-center gap-3">
        <CreditCard className="w-5 h-5 text-violet-400" />
        <div>
          <div className="text-sm font-medium text-white">Kredi Sistemi</div>
          <div className="text-xs text-white/40">SMS ve WhatsApp bildirimleriniz kredi ile hesaplanır. İstediğin zaman yükle.</div>
        </div>
      </div>
      <div className="flex gap-4 text-xs">
        {[["Netgsm SMS", "₺0.08 / adet", "text-blue-400"], ["Twilio SMS", "$0.0079 / adet", "text-violet-400"], ["WhatsApp", "$0.005 / msg", "text-emerald-400"]].map(([label, price, color]) => (
          <div key={label} className="text-center">
            <div className={`font-bold ${color}`}>{price}</div>
            <div className="text-white/30 mt-0.5">{label}</div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SectionHeader({ badge, title, sub }: { badge: string; title: string; sub: string }) {
  const { ref, isInView } = useScrollReveal()
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={stagger}
      className="text-center max-w-2xl mx-auto"
    >
      <motion.span
        variants={fadeUp}
        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-white/50 mb-5"
      >
        <Sparkles className="w-3 h-3 text-violet-400" />
        {badge}
      </motion.span>
      <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
        {title}
      </motion.h2>
      <motion.p variants={fadeUp} className="text-base text-white/40 leading-relaxed">
        {sub}
      </motion.p>
    </motion.div>
  )
}

function TestimonialCard({ t }: { t: typeof TESTIMONIALS[0] }) {
  return (
    <div className="w-[340px] shrink-0 rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm p-5 hover:bg-white/6 transition-colors">
      <div className="flex gap-0.5 mb-3">
        {[...Array(t.stars)].map((_, i) => (
          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p className="text-sm text-white/60 leading-relaxed mb-4">"{t.text}"</p>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
          {t.avatar}
        </div>
        <div>
          <div className="text-sm font-semibold text-white">{t.name}</div>
          <div className="text-xs text-white/40">{t.role}</div>
        </div>
      </div>
    </div>
  )
}
