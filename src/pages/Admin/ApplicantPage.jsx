import { useEffect, useMemo, useState } from "react"
import api from "../../lib/api"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  Search,
  RefreshCcw,
  FileText,
  ChevronLeft,
  ChevronRight,
  Download,
  Users,
  Loader2,
  AlertCircle,
} from "lucide-react"

const API_BASE = "http://localhost:5000"
const PAGE_SIZE = 7

const statusColors = {
  pending:     "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20",
  reviewing:   "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  shortlisted: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20",
  rejected:    "bg-red-50 text-red-700 border-red-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
  hired:       "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
}

export default function AdminApplications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [sortPosition, setSortPosition] = useState("none")
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState([])

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const res = await api.get(`${API_BASE}/api/recruitment/applications`)
      setApplications(res.data.applications)
    } catch (err) {
      console.error("Failed to fetch applications", err)
    } finally {
      setLoading(false)
    }
  }

  /* ===============================
     SEARCH + SORT
  =============================== */
  const filteredData = useMemo(() => {
    let data = [...applications]
    if (search) {
      const q = search.toLowerCase()
      data = data.filter((app) =>
        `${app.name} ${app.email} ${app.position}`.toLowerCase().includes(q)
      )
    }
    if (sortPosition !== "none") {
      data.sort((a, b) =>
        sortPosition === "asc"
          ? a.position.localeCompare(b.position)
          : b.position.localeCompare(a.position)
      )
    }
    return data
  }, [applications, search, sortPosition])

  /* ===============================
     PAGINATION
  =============================== */
  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE)

  const paginatedData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredData.slice(start, start + PAGE_SIZE)
  }, [filteredData, page])

  useEffect(() => {
    setPage(1)
    setSelectedIds([])
  }, [search, sortPosition])

  /* ===============================
     CHECKBOX HANDLERS
  =============================== */
  const toggleRow = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )

  const toggleAll = (checked) =>
    setSelectedIds(checked ? paginatedData.map((a) => a.id) : [])

  /* ===============================
     EXPORT CSV
  =============================== */
  const exportSelected = () => {
    const rows = applications.filter((a) => selectedIds.includes(a.id))
    if (!rows.length) return

    const headers = ["Name", "Email", "Phone", "Position", "Status", "Date"]
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        [r.name, r.email, r.phone, r.position, r.status,
          new Date(r.created_at).toLocaleDateString()]
          .map((v) => `"${v}"`).join(",")
      ),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `applications_${new Date().toISOString().split("T")[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleViewResume = async (app) => {
    try {
      const res = await api.get(
        `${API_BASE}/api/recruitment/applications/${app.id}/resume`,
        { responseType: "blob" }
      )
      const url = window.URL.createObjectURL(res.data)
      window.open(url, "_blank")
      setTimeout(() => URL.revokeObjectURL(url), 10000)
    } catch (err) {
      console.error(err)
      alert("Failed to open resume")
    }
  }

  /* ===============================
     LOADING STATE
  =============================== */
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-[3px] border-[#70B9A1]/20 dark:border-[#70B9A1]/10" />
            <div className="absolute inset-0 rounded-full border-[3px] border-[#70B9A1] border-t-transparent animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-slate-900 dark:text-white">Loading Applications</p>
            <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">Fetching recruitment data…</p>
          </div>
        </div>
      </div>
    )
  }

  /* ===============================
     STAT CARDS CONFIG
  =============================== */
  const stats = [
    {
      label: "Total Applications",
      value: applications.length,
      icon: Users,
      iconBg: "bg-gradient-to-br from-[#70B9A1] to-[#5A9A85]",
      borderColor: "border-l-[#70B9A1]",
      chipBg: "dark:bg-[#70B9A1]/5 dark:border-[#70B9A1]/20",
    },
    {
      label: "Pending",
      value: applications.filter((a) => a.status === "pending").length,
      icon: AlertCircle,
      iconBg: "bg-yellow-500",
      borderColor: "border-l-yellow-500",
      chipBg: "dark:bg-yellow-500/5 dark:border-yellow-500/20",
    },
    {
      label: "Hired",
      value: applications.filter((a) => a.status === "hired").length,
      icon: FileText,
      iconBg: "bg-emerald-500",
      borderColor: "border-l-emerald-500",
      chipBg: "dark:bg-emerald-500/5 dark:border-emerald-500/20",
    },
    {
      label: "Selected",
      value: selectedIds.length,
      icon: Download,
      iconBg: "bg-purple-500",
      borderColor: "border-l-purple-500",
      chipBg: "dark:bg-purple-500/5 dark:border-purple-500/20",
    },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, iconBg, borderColor, chipBg }) => (
            <Card
              key={label}
              className={`border-l-4 ${borderColor} bg-white dark:bg-zinc-950 dark:border-zinc-800 ${chipBg} border border-slate-200 shadow-sm dark:shadow-black/30 transition-colors duration-300`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-zinc-500 font-medium">{label}</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
                  </div>
                  <div className={`w-11 h-11 ${iconBg} rounded-xl flex items-center justify-center shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Main Card ── */}
        <Card className="rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 dark:shadow-black/40 transition-colors duration-300">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-zinc-800 bg-slate-50/60 dark:bg-white/[0.02] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#70B9A1]/10 border border-[#70B9A1]/20 dark:border-[#70B9A1]/20 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-[#70B9A1]" />
              </div>
              <div>
                <CardTitle className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                  Recruitment Applications
                </CardTitle>
                <p className="text-xs text-slate-500 dark:text-zinc-500 mt-0.5">
                  Manage and review job applications
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchApplications}
                className="gap-2 rounded-xl h-9 border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <RefreshCcw className="h-4 w-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>

              <Button
                size="sm"
                disabled={!selectedIds.length}
                onClick={exportSelected}
                className="gap-2 rounded-xl h-9 bg-gradient-to-r from-[#70B9A1] to-[#5A9A85] text-white border-0 hover:from-[#5A9A85] hover:to-[#4A8A75] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span> ({selectedIds.length})
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-5 px-6 pb-6">
            {/* ── Search & Sort ── */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
                <Input
                  placeholder="Search by name, email, or position..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:border-[#70B9A1] dark:focus:border-[#70B9A1] transition-colors"
                />
              </div>

              <Select value={sortPosition} onValueChange={setSortPosition}>
                <SelectTrigger className="w-full sm:w-56 bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300">
                  <SelectValue placeholder="Sort by position" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-xl dark:shadow-black/50">
                  <SelectItem value="none" className="text-slate-700 dark:text-zinc-200 focus:bg-slate-100 dark:focus:bg-white/5">No sorting</SelectItem>
                  <SelectItem value="asc" className="text-slate-700 dark:text-zinc-200 focus:bg-slate-100 dark:focus:bg-white/5">Position A → Z</SelectItem>
                  <SelectItem value="desc" className="text-slate-700 dark:text-zinc-200 focus:bg-slate-100 dark:focus:bg-white/5">Position Z → A</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* ── Table ── */}
            <div className="rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.03] border-b border-slate-200 dark:border-zinc-800">
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            paginatedData.length > 0 &&
                            selectedIds.length === paginatedData.length
                          }
                          onCheckedChange={toggleAll}
                          className="border-slate-300 dark:border-zinc-600"
                        />
                      </TableHead>
                      {["Name", "Email", "Phone", "Position", "Status", "Resume"].map((h) => (
                        <TableHead key={h} className="font-semibold text-slate-600 dark:text-zinc-400 text-xs uppercase tracking-wide">
                          {h}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {paginatedData.length ? (
                      paginatedData.map((app) => (
                        <TableRow
                          key={app.id}
                          className="hover:bg-slate-50 dark:hover:bg-white/[0.025] transition-colors border-b border-slate-100 dark:border-zinc-800/70"
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedIds.includes(app.id)}
                              onCheckedChange={() => toggleRow(app.id)}
                              className="border-slate-300 dark:border-zinc-600"
                            />
                          </TableCell>

                          <TableCell className="font-semibold text-slate-900 dark:text-white">
                            {app.name}
                          </TableCell>
                          <TableCell className="text-slate-500 dark:text-zinc-400">
                            {app.email}
                          </TableCell>
                          <TableCell className="text-slate-500 dark:text-zinc-400 font-mono text-sm">
                            {app.phone || <span className="text-slate-300 dark:text-zinc-600">—</span>}
                          </TableCell>
                          <TableCell className="text-slate-700 dark:text-zinc-300">
                            {app.position}
                          </TableCell>

                          <TableCell>
                            <Badge
                              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border ${statusColors[app.status] || statusColors.pending}`}
                            >
                              {app.status}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            {app.resume ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1.5 h-8 rounded-lg border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 hover:bg-[#70B9A1] hover:text-white hover:border-[#70B9A1] dark:hover:bg-[#70B9A1] dark:hover:border-[#70B9A1] dark:hover:text-white transition-colors"
                                onClick={() => handleViewResume(app)}
                              >
                                <FileText className="h-3.5 w-3.5" />
                                View
                              </Button>
                            ) : (
                              <span className="text-slate-300 dark:text-zinc-600 text-sm">No file</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-14">
                          <div className="flex flex-col items-center gap-2">
                            <Search className="w-10 h-10 text-slate-200 dark:text-zinc-700" />
                            <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400">
                              No applications found
                            </p>
                            <p className="text-xs text-slate-400 dark:text-zinc-600">
                              Try adjusting your search or filters
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* ── Pagination ── */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <p className="text-sm text-slate-500 dark:text-zinc-500">
                Showing{" "}
                <span className="font-semibold text-slate-900 dark:text-white">{paginatedData.length}</span>
                {" "}of{" "}
                <span className="font-semibold text-slate-900 dark:text-white">{filteredData.length}</span>
                {" "}applications{search && " (filtered)"}
              </p>

              <div className="flex items-center gap-2">
                <p className="text-sm text-slate-500 dark:text-zinc-500">
                  Page {page} of {totalPages || 1}
                </p>
                <div className="flex gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="h-8 w-8 p-0 rounded-lg border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages || totalPages === 0}
                    onClick={() => setPage((p) => p + 1)}
                    className="h-8 w-8 p-0 rounded-lg border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}