"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, AlertCircle, CheckCircle2, ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { apiManager } from "@/services/api/apiManager"

interface CsvRow {
  title: string
  message?: string
  dateTime: string
  targetType: string
  groupName?: string
  contactEmail?: string
  contactName?: string
  contactPhone?: string
  channels: string[]
  repeat: string
  // local-only
  _line?: number
  _error?: string
}

const REQUIRED_HEADERS = ["title", "dateTime", "targetType", "channels", "repeat"]
const KNOWN_HEADERS = [
  "title",
  "message",
  "dateTime",
  "targetType",
  "groupName",
  "contactEmail",
  "contactName",
  "contactPhone",
  "channels",
  "repeat",
]

const SAMPLE = `title,message,dateTime,targetType,groupName,contactEmail,contactName,contactPhone,channels,repeat
Doğum günü,"Mutlu yıllar!",2026-06-15T10:00:00,CONTACT,,ali@example.com,Ali Veli,+905551112233,EMAIL|SMS,none
Ekip toplantısı,"Haftalık sync",2026-05-12T09:30:00,GROUP,Ekibim,,,,EMAIL,weekly`

/** Minimal CSV parser: handles quoted fields with embedded commas and "" escaping. No newline-in-quotes. */
function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.replace(/\r\n/g, "\n").split("\n").filter((l) => l.trim().length > 0)
  if (lines.length === 0) return { headers: [], rows: [] }
  const parseLine = (line: string): string[] => {
    const out: string[] = []
    let cur = ""
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') {
          cur += '"'
          i++
        } else if (ch === '"') {
          inQuotes = false
        } else {
          cur += ch
        }
      } else {
        if (ch === ',') {
          out.push(cur)
          cur = ""
        } else if (ch === '"') {
          inQuotes = true
        } else {
          cur += ch
        }
      }
    }
    out.push(cur)
    return out.map((s) => s.trim())
  }
  const headers = parseLine(lines[0])
  const rows = lines.slice(1).map(parseLine)
  return { headers, rows }
}

export default function BulkImportPage() {
  const router = useRouter()
  const [rawCsv, setRawCsv] = useState("")
  const [parsed, setParsed] = useState<CsvRow[]>([])
  const [parseError, setParseError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [resultSummary, setResultSummary] = useState<{ created: number; failed: number; total: number } | null>(null)

  const onFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => setRawCsv(String(reader.result || ""))
    reader.readAsText(file)
  }

  const doParse = () => {
    setParseError(null)
    setResultSummary(null)
    if (!rawCsv.trim()) {
      setParseError("CSV içeriği boş")
      setParsed([])
      return
    }
    const { headers, rows } = parseCsv(rawCsv)
    const missing = REQUIRED_HEADERS.filter((h) => !headers.includes(h))
    if (missing.length > 0) {
      setParseError(`Eksik sütunlar: ${missing.join(", ")}`)
      setParsed([])
      return
    }
    const idx = (h: string) => headers.indexOf(h)
    const out: CsvRow[] = rows.map((r, i) => {
      const get = (h: string) => (idx(h) >= 0 ? r[idx(h)] : "")
      const channels = get("channels")
        .split(/[|,]/)
        .map((s) => s.trim())
        .filter(Boolean)
      const row: CsvRow = {
        _line: i + 2,
        title: get("title"),
        message: get("message"),
        dateTime: get("dateTime"),
        targetType: get("targetType").toUpperCase(),
        groupName: get("groupName") || undefined,
        contactEmail: get("contactEmail") || undefined,
        contactName: get("contactName") || undefined,
        contactPhone: get("contactPhone") || undefined,
        channels,
        repeat: (get("repeat") || "none").toLowerCase(),
      }
      // Per-row validation
      if (!row.title) row._error = "title boş"
      else if (!row.dateTime || isNaN(Date.parse(row.dateTime))) row._error = "dateTime geçersiz (YYYY-MM-DDTHH:mm:ss)"
      else if (!["PERSONAL", "GROUP", "CONTACT"].includes(row.targetType)) row._error = "targetType PERSONAL|GROUP|CONTACT olmalı"
      else if (row.targetType === "GROUP" && !row.groupName) row._error = "GROUP için groupName zorunlu"
      else if (row.targetType === "CONTACT" && !row.contactEmail) row._error = "CONTACT için contactEmail zorunlu"
      else if (channels.length === 0) row._error = "En az bir kanal gerekli"
      return row
    })
    setParsed(out)
  }

  const validRows = parsed.filter((r) => !r._error)
  const invalidRows = parsed.filter((r) => r._error)

  const submit = async () => {
    if (validRows.length === 0) {
      toast.error("Geçerli satır yok")
      return
    }
    setSubmitting(true)
    try {
      const payload = validRows.map(({ _line, _error, ...rest }) => rest)
      const result = await apiManager.bulkImportReminders(payload)
      setResultSummary({ created: result.created, failed: result.failed, total: result.total })
      toast.success(`${result.created}/${result.total} hatırlatıcı oluşturuldu`)
    } catch (e: any) {
      toast.error(e?.message || "İçe aktarma başarısız")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container max-w-5xl py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Toplu Hatırlatıcı İçe Aktar (CSV)</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" /> Şablon
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="text-muted-foreground">
            Sütunlar: {KNOWN_HEADERS.join(", ")}. Zorunlu: {REQUIRED_HEADERS.join(", ")}.
          </p>
          <p className="text-muted-foreground">
            <strong>targetType</strong>: PERSONAL, GROUP (groupName şart), CONTACT (contactEmail şart).
            <strong> channels</strong>: <code>EMAIL|SMS|WHATSAPP</code> (boru veya virgülle ayır).
            <strong> repeat</strong>: none / hourly / daily / weekly.
          </p>
          <pre className="bg-muted p-3 rounded text-xs overflow-x-auto whitespace-pre">{SAMPLE}</pre>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setRawCsv(SAMPLE)
              setParsed([])
              setParseError(null)
            }}
          >
            Örneği yükle
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Upload className="h-4 w-4" /> CSV Yükle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) onFile(f)
            }}
          />
          <textarea
            value={rawCsv}
            onChange={(e) => setRawCsv(e.target.value)}
            rows={8}
            className="w-full p-3 rounded-md border bg-background font-mono text-xs"
            placeholder="...veya CSV içeriğini buraya yapıştır"
          />
          <div className="flex gap-2">
            <Button onClick={doParse} disabled={!rawCsv.trim()}>
              Önizle
            </Button>
            {validRows.length > 0 && (
              <Button onClick={submit} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {validRows.length} satırı içe aktar
              </Button>
            )}
          </div>
          {parseError && (
            <div className="text-sm text-rose-500 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> {parseError}
            </div>
          )}
        </CardContent>
      </Card>

      {parsed.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              Önizleme
              <Badge variant="secondary">{validRows.length} geçerli</Badge>
              {invalidRows.length > 0 && <Badge variant="destructive">{invalidRows.length} hatalı</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Hedef</TableHead>
                    <TableHead>Kanallar</TableHead>
                    <TableHead>Tekrar</TableHead>
                    <TableHead>Durum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsed.map((r, i) => (
                    <TableRow key={i} className={r._error ? "bg-rose-500/5" : ""}>
                      <TableCell className="text-muted-foreground">{r._line}</TableCell>
                      <TableCell className="font-medium">{r.title || <em className="text-muted-foreground">—</em>}</TableCell>
                      <TableCell className="text-xs">{r.dateTime}</TableCell>
                      <TableCell className="text-xs">
                        {r.targetType}
                        {r.groupName && ` · ${r.groupName}`}
                        {r.contactEmail && ` · ${r.contactEmail}`}
                      </TableCell>
                      <TableCell className="text-xs">{r.channels.join(", ")}</TableCell>
                      <TableCell className="text-xs">{r.repeat}</TableCell>
                      <TableCell>
                        {r._error ? (
                          <span className="text-xs text-rose-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> {r._error}
                          </span>
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {resultSummary && (
        <Card className="border-emerald-500/30">
          <CardContent className="py-6 space-y-1">
            <p className="font-semibold">İçe aktarma sonucu</p>
            <p className="text-sm">
              Toplam: {resultSummary.total} · Oluşturuldu: {resultSummary.created} · Başarısız: {resultSummary.failed}
            </p>
            <div className="pt-2 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => router.push("/schedules")}>
                Hatırlatıcılara git
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
