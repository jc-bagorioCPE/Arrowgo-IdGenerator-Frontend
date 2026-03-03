import { useEffect, useState, useMemo } from "react";
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  CheckCircle, 
  Clock,
  Users,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";


export default function Claim() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const api = import.meta.env.VITE_API_BASE_URL;

  // Load employees
  const loadEmployees = async () => {
    try {
      const res = await fetch(`${api}/api/employees/done`);
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error("Load employees error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
    const interval = setInterval(loadEmployees, 20000);
    return () => clearInterval(interval);
  }, []);

  // Filter + Sort + Status + Location
  const processedEmployees = useMemo(() => {
    let data = employees.filter((emp) => emp.status === "done");

    if (search) {
      data = data.filter(
        (emp) =>
          emp.employee_name.toLowerCase().includes(search.toLowerCase()) ||
          emp.employee_id.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Location filter
    if (locationFilter !== "all") {
      data = data.filter((emp) => 
        emp.employee_id && emp.employee_id.includes(locationFilter)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      data = data.filter((emp) =>
        statusFilter === "claimed"
          ? emp.current_status === "claimed"
          : emp.current_status !== "claimed"
      );
    }

    data.sort((a, b) => {
      const nameA = a.employee_name.toLowerCase();
      const nameB = b.employee_name.toLowerCase();
      return sortOrder === "asc"
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });

    return data;
  }, [employees, search, sortOrder, statusFilter, locationFilter]);

  // Pagination
  const totalPages = Math.ceil(processedEmployees.length / ITEMS_PER_PAGE);
  const paginatedEmployees = processedEmployees.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  // Stats
  const totalEmployees = processedEmployees.length;
  const claimedCount = processedEmployees.filter(e => e.current_status === "claimed").length;
  const unclaimedCount = totalEmployees - claimedCount;
  const claimedPercentage = totalEmployees > 0 ? Math.round((claimedCount / totalEmployees) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200 rounded-full filter blur-3xl opacity-20" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-200 rounded-full filter blur-3xl opacity-20" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-5 py-2.5 rounded-full mb-4 shadow-lg border border-blue-200">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-bold text-blue-700 tracking-wide">CLAIM STATUS</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Employee ID Claim Status
          </h1>
          <p className="text-gray-600 text-lg">
            Track and monitor employee ID claim progress
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
        >
          <Card className="border-2 border-blue-100 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total IDs</p>
                  <p className="text-3xl font-bold text-gray-800">{totalEmployees}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-100 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Claimed</p>
                  <p className="text-3xl font-bold text-green-600">{claimedCount}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-yellow-100 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Unclaimed</p>
                  <p className="text-3xl font-bold text-yellow-600">{unclaimedCount}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-100 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Progress</p>
                  <p className="text-3xl font-bold text-purple-600">{claimedPercentage}%</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="border-2 border-blue-200 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-200">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle className="text-2xl text-gray-800 flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-blue-600" />
                    Claim Records
                  </CardTitle>
                  <CardDescription className="text-gray-600 mt-1">
                    View and search employee claim status
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadEmployees}
                  className="flex items-center gap-2 border-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Controls */}
              <div className="flex flex-col md:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                  <Input
                    placeholder="Search by name or ID..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="pl-10 h-11 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                  />
                </div>

                <div className="flex gap-2">
                  {/* Location Filter */}
                  <div className="relative w-[180px]">
                    <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#70B9A1] pointer-events-none z-10" />
                    <select
                      value={locationFilter}
                      onChange={(e) => {
                        setLocationFilter(e.target.value);
                        setPage(1);
                      }}
                      className="h-11 pl-9 pr-10 py-2 border-2 border-gray-200 rounded-xl text-sm w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-[#70B9A1] focus:border-[#70B9A1] hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors appearance-none cursor-pointer outline-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2370B9A1' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.75rem center',
                        backgroundSize: '12px',
                      }}
                    >
                      <option value="all">All Locations</option>
                      <option value="ALIMDC">ALIMDC</option>
                      <option value="ALITAG">ALITAG</option>
                      <option value="ALIPAL">ALIPAL</option>
                      <option value="TEMPO-ALICEBU">TEMPO-ALICEBU</option>
                      <option value="TEMPO-ALIDAVAO">TEMPO-ALIDAVAO</option>
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div className="relative w-[160px]">
                    <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#70B9A1] pointer-events-none z-10" />
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setPage(1);
                      }}
                      className="h-11 pl-9 pr-10 py-2 border-2 border-gray-200 rounded-xl text-sm w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-[#70B9A1] focus:border-[#70B9A1] hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors appearance-none cursor-pointer outline-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2370B9A1' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.75rem center',
                        backgroundSize: '12px',
                      }}
                    >
                      <option value="all">All Status</option>
                      <option value="claimed">Claimed</option>
                      <option value="unclaimed">Unclaimed</option>
                    </select>
                  </div>

                  {/* Sort */}
                  <Button
                    variant="outline"
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    className="h-11 border-2 border-gray-200 rounded-xl hover:border-blue-500 flex items-center gap-2"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                    {sortOrder === "asc" ? "A → Z" : "Z → A"}
                  </Button>
                </div>
              </div>

              {/* Table */}
              <div className="rounded-xl border-2 border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-50 to-purple-50 border-b-2 border-gray-200">
                        <th className="text-left p-4 font-bold text-gray-700">Employee Name</th>
                        <th className="text-left p-4 font-bold text-gray-700">Employee ID</th>
                        <th className="text-left p-4 font-bold text-gray-700">Position</th>
                        <th className="text-left p-4 font-bold text-gray-700">Claim Status</th>
                      </tr>
                    </thead>
                  </table>
                </div>
                
                {/* Fixed height tbody container */}
                <div className="overflow-x-auto" style={{ minHeight: '480px', maxHeight: '480px' }}>
                  <table className="w-full">
                    <tbody>
                      <AnimatePresence mode="wait">
                        {loading ? (
                          <tr>
                            <td colSpan={4} className="text-center py-12">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"
                              />
                              <p className="text-gray-600 mt-3 font-medium">Loading...</p>
                            </td>
                          </tr>
                        ) : paginatedEmployees.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="text-center py-12">
                              <div className="flex flex-col items-center gap-3">
                                <div className="p-4 bg-gray-100 rounded-full">
                                  <Search className="h-8 w-8 text-gray-400" />
                                </div>
                                <p className="text-gray-600 font-medium">No records found.</p>
                                <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          paginatedEmployees.map((emp, index) => (
                            <motion.tr
                              key={emp.employee_id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                              className="border-b border-gray-100 hover:bg-blue-50 transition-colors"
                            >
                              <td className="p-4 font-medium text-gray-800" style={{ width: '30%' }}>
                                {emp.employee_name}
                              </td>
                              <td className="p-4 text-gray-600" style={{ width: '25%' }}>
                                <span className="px-3 py-1 bg-gray-100 rounded-lg font-mono text-sm">
                                  {emp.employee_id}
                                </span>
                              </td>
                              <td className="p-4 text-gray-600" style={{ width: '25%' }}>{emp.position}</td>
                              <td className="p-4" style={{ width: '20%' }}>
                                <div className="flex items-center gap-2">
                                  {emp.current_status === "claimed" ? (
                                    <>
                                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-300 whitespace-nowrap">
                                        Claimed
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <Clock className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-300 whitespace-nowrap">
                                        Unclaimed
                                      </span>
                                    </>
                                  )}
                                </div>
                              </td>
                            </motion.tr>
                          ))
                        )}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 flex-wrap gap-4">
                  <p className="text-sm text-gray-600">
                    Showing {((page - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(page * ITEMS_PER_PAGE, totalEmployees)} of {totalEmployees} results
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="h-10 px-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <span className="text-sm font-medium text-gray-700 px-2">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="h-10 px-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 disabled:opacity-50"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}