import { useState, useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../components/ui/select";
import {
  Search, SlidersHorizontal, ArrowUpDown, ArrowUp, ArrowDown,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoveHorizontal,
} from "lucide-react";

const LOCATIONS = [
  ["all",            "All Locations"  ],
  ["ALIMDC",         "ALIMDC"         ],
  ["ALITAG",         "ALITAG"         ],
  ["ALIPAL",         "ALIPAL"         ],
  ["TEMPO-ALICEBU",  "TEMPO-ALICEBU"  ],
  ["TEMPO-ALIDAVAO", "TEMPO-ALIDAVAO" ],
];

const STATUSES = [
  ["all",         "All Status"  ],
  ["claimed",     "Claimed"     ],
  ["not_claimed", "Not Claimed" ],
];

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50];

export default function DataTableClaim({ columns, data, onRefresh }) {
  const [sorting,        setSorting]        = useState([]);
  const [columnFilters,  setColumnFilters]  = useState([]);
  const [locationFilter, setLocationFilter] = useState("all");
  const [statusFilter,   setStatusFilter]   = useState("all");
  const [pageSize,       setPageSize]       = useState(10);

  const filteredData = useMemo(() => {
    let result = data;
    if (locationFilter !== "all")
      result = result.filter(r => r.employee_id?.includes(locationFilter));
    if (statusFilter !== "all")
      result = result.filter(r => r.current_status === statusFilter);
    return result;
  }, [data, locationFilter, statusFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, columnFilters },
    onSortingChange:       setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel:       getCoreRowModel(),
    getFilteredRowModel:   getFilteredRowModel(),
    getSortedRowModel:     getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  const handlePageSizeChange = (val) => {
    const n = parseInt(val);
    setPageSize(n);
    table.setPageSize(n);
  };

  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();
  const totalRows = table.getFilteredRowModel().rows.length;
  const startRow  = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const endRow    = Math.min(startRow + pageSize - 1, totalRows);

  // active filter count for indicator
  const activeFilters = (locationFilter !== "all" ? 1 : 0) + (statusFilter !== "all" ? 1 : 0);

  return (
    <div className="w-full flex flex-col">

      {/* ── Controls ─────────────────────────────────────────────────────── */}
      <div className="px-4 sm:px-5 py-3.5 border-b border-border bg-muted/20 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">

          {/* Search */}
          <div className="relative flex-1 sm:max-w-[260px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search employees…"
              value={table.getColumn("employee_name")?.getFilterValue() ?? ""}
              onChange={(e) => table.getColumn("employee_name")?.setFilterValue(e.target.value)}
              className="pl-9 h-9 text-sm bg-background border-border text-foreground placeholder:text-muted-foreground/60 rounded-xl focus-visible:ring-emerald-500/40 focus-visible:border-emerald-500/60"
            />
          </div>

          {/* Location filter */}
          <div className="relative sm:w-[200px]">
            <SlidersHorizontal size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none z-10" />
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="pl-9 h-9 text-sm bg-background border-border text-foreground rounded-xl focus:ring-emerald-500/40 [&>span]:truncate">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border rounded-xl">
                {LOCATIONS.map(([v, l]) => (
                  <SelectItem key={v} value={v} className="text-xs font-medium text-popover-foreground focus:bg-accent rounded-lg">
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status filter */}
          <div className="relative sm:w-[170px]">
            <SlidersHorizontal size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none z-10" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="pl-9 h-9 text-sm bg-background border-border text-foreground rounded-xl focus:ring-emerald-500/40 [&>span]:truncate">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border rounded-xl">
                {STATUSES.map(([v, l]) => (
                  <SelectItem key={v} value={v} className="text-xs font-medium text-popover-foreground focus:bg-accent rounded-lg">
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active filter badge + clear */}
          {activeFilters > 0 && (
            <button
              onClick={() => { setLocationFilter("all"); setStatusFilter("all"); }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition-colors flex-shrink-0"
            >
              {activeFilters} filter{activeFilters > 1 ? "s" : ""} active · clear
            </button>
          )}
        </div>

        {/* Row count + mobile hint */}
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">
            {totalRows === 0
              ? "No results"
              : <>Showing <span className="font-bold text-foreground">{startRow}–{endRow}</span> of <span className="font-bold text-foreground">{totalRows}</span> records</>
            }
          </p>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground/50 sm:hidden">
            <MoveHorizontal size={11} />
            Scroll for more
          </div>
        </div>
      </div>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <div
        className="overflow-x-auto"
        style={{
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "thin",
          scrollbarColor: "#3ecf8e hsl(var(--muted))",
        }}
      >
        <Table className="w-full min-w-[800px]">

          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id} className="bg-muted/30 hover:bg-muted/30 border-b border-border">
                {group.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted  = header.column.getIsSorted();
                  return (
                    <TableHead
                      key={header.id}
                      className="text-[11px] font-black uppercase tracking-[0.12em] text-muted-foreground whitespace-nowrap px-4"
                    >
                      {canSort ? (
                        <button
                          onClick={header.column.getToggleSortingHandler()}
                          className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sorted === "asc"  && <ArrowUp    size={12} className="text-emerald-500" />}
                          {sorted === "desc" && <ArrowDown  size={12} className="text-emerald-500" />}
                          {!sorted           && <ArrowUpDown size={12} className="opacity-30"      />}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-b border-border hover:bg-muted/40 transition-colors duration-100"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 whitespace-nowrap text-sm text-foreground">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Search size={28} className="text-muted-foreground/20" />
                    <p className="text-sm font-semibold text-foreground">No results found</p>
                    <p className="text-xs text-muted-foreground">Try adjusting your search or filters</p>
                    {activeFilters > 0 && (
                      <button
                        onClick={() => { setLocationFilter("all"); setStatusFilter("all"); }}
                        className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline underline-offset-2"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination footer ────────────────────────────────────────────── */}
      <div className="px-4 sm:px-5 py-3 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3">

        {/* Rows per page */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-shrink-0">
          <span>Rows per page</span>
          <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="h-7 w-16 text-xs bg-background border-border text-foreground rounded-lg focus:ring-emerald-500/40 px-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border rounded-xl min-w-[4rem]">
              {PAGE_SIZE_OPTIONS.map((n) => (
                <SelectItem key={n} value={String(n)} className="text-xs text-popover-foreground focus:bg-accent rounded-lg">
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page info + nav buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            Page{" "}
            <span className="font-bold text-foreground">{totalRows > 0 ? pageIndex + 1 : 0}</span>
            {" "}of{" "}
            <span className="font-bold text-foreground">{pageCount || 0}</span>
          </span>
          <div className="flex items-center gap-1">
            {[
              { icon: ChevronsLeft,  action: () => table.setPageIndex(0),       disabled: !table.getCanPreviousPage() },
              { icon: ChevronLeft,   action: () => table.previousPage(),         disabled: !table.getCanPreviousPage() },
              { icon: ChevronRight,  action: () => table.nextPage(),             disabled: !table.getCanNextPage()     },
              { icon: ChevronsRight, action: () => table.setPageIndex(pageCount - 1), disabled: !table.getCanNextPage() },
            ].map(({ icon: Icon, action, disabled }, i) => (
              <Button
                key={i}
                variant="outline" size="icon"
                className="h-7 w-7 rounded-lg border-border text-foreground hover:bg-accent disabled:opacity-30"
                onClick={action}
                disabled={disabled}
              >
                <Icon size={14} />
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}