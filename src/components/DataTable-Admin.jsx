import { useState } from "react";
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
import { Checkbox } from "../components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import {
  Search, Download, SlidersHorizontal, ArrowUpDown,
  ArrowUp, ArrowDown, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, MoveHorizontal,
} from "lucide-react";
import { downloadExcel } from "../lib/DownloadExcel";

const LOCATIONS = [
  ["all",            "All Locations"   ],
  ["ALIMDC",         "ALIMDC"          ],
  ["ALITAG",         "ALITAG"          ],
  ["ALIPAL",         "ALIPAL"          ],
  ["TEMPO-ALICEBU",  "TEMPO-ALICEBU"   ],
  ["TEMPO-ALIDAVAO", "TEMPO-ALIDAVAO"  ],
];

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50];

export default function DataTable({ columns, data }) {
  const [selectedRows,      setSelectedRows]      = useState([]);
  const [selectedLocation,  setSelectedLocation]  = useState("all");
  const [sorting,           setSorting]           = useState([]);
  const [columnFilters,     setColumnFilters]     = useState([]);
  const [pageSize,          setPageSize]          = useState(10);

  const table = useReactTable({
    data,
    columns,
    state:    { sorting, columnFilters },
    onSortingChange:       setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel:       getCoreRowModel(),
    getFilteredRowModel:   getFilteredRowModel(),
    getSortedRowModel:     getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  // keep table page size in sync
  const handlePageSizeChange = (val) => {
    const n = parseInt(val);
    setPageSize(n);
    table.setPageSize(n);
  };

  const toggleRow   = (id) => setSelectedRows((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const allSelected = selectedRows.length === data.length && data.length > 0;
  const anySelected = selectedRows.length > 0;

  const handleExport = () => {
    const rows = data.filter((r) => selectedRows.includes(r.id));
    downloadExcel(rows, "employees");
  };

  const handleLocationFilter = (value) => {
    setSelectedLocation(value);
    table.getColumn("employee_id")?.setFilterValue(value === "all" ? "" : value);
  };

  const searchValue = table.getColumn("employee_name")?.getFilterValue() ?? "";

  const pageIndex  = table.getState().pagination.pageIndex;
  const pageCount  = table.getPageCount();
  const totalRows  = table.getFilteredRowModel().rows.length;
  const startRow   = pageIndex * pageSize + 1;
  const endRow     = Math.min(startRow + pageSize - 1, totalRows);

  return (
    <div className="w-full flex flex-col">

      {/* ── Controls bar ─────────────────────────────────────────────────── */}
      <div className="px-4 sm:px-5 py-3.5 border-b border-border bg-muted/20 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">

          {/* Search */}
          <div className="relative flex-1 sm:max-w-[260px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search employees…"
              value={searchValue}
              onChange={(e) => table.getColumn("employee_name")?.setFilterValue(e.target.value)}
              className="pl-9 h-9 text-sm bg-background border-border text-foreground placeholder:text-muted-foreground/60 rounded-xl focus-visible:ring-emerald-500/40 focus-visible:border-emerald-500/60"
            />
          </div>

          {/* Location filter */}
          <div className="relative sm:w-[200px]">
            <SlidersHorizontal size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none z-10" />
            <Select value={selectedLocation} onValueChange={handleLocationFilter}>
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

          {/* Spacer */}
          <div className="flex-1 hidden sm:block" />

          {/* Selection badge + Export */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {anySelected && (
              <Badge className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-none text-xs font-semibold px-2.5">
                {selectedRows.length} selected
              </Badge>
            )}
            <Button
              onClick={handleExport}
              variant="outline"
              size="sm"
              disabled={!anySelected}
              className="h-9 gap-2 rounded-xl border-border text-foreground hover:bg-accent disabled:opacity-40"
            >
              <Download size={14} />
              Export
            </Button>
          </div>
        </div>

        {/* Result count */}
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">
            Showing <span className="font-bold text-foreground">{startRow}–{endRow}</span> of{" "}
            <span className="font-bold text-foreground">{totalRows}</span> employees
          </p>

          {/* Mobile scroll hint */}
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground/50 sm:hidden">
            <MoveHorizontal size={11} />
            Scroll to see more
          </div>
        </div>
      </div>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <Table className="min-w-[800px] w-full">

          {/* Header */}
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id} className="bg-muted/30 hover:bg-muted/30 border-b border-border">

                {/* Select-all checkbox */}
                <TableHead className="w-[46px] px-4 sticky left-0 bg-muted/30 z-10">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={(checked) =>
                      setSelectedRows(checked ? data.map((r) => r.id) : [])
                    }
                    className="border-border data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                  />
                </TableHead>

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
                          {sorted === "asc"  && <ArrowUp   size={12} className="text-emerald-500" />}
                          {sorted === "desc" && <ArrowDown  size={12} className="text-emerald-500" />}
                          {!sorted           && <ArrowUpDown size={12} className="opacity-30" />}
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

          {/* Body */}
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row, i) => {
                const isSelected = selectedRows.includes(row.original.id);
                return (
                  <TableRow
                    key={row.id}
                    className={`
                      border-b border-border transition-colors duration-100
                      ${isSelected
                        ? "bg-emerald-50/60 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                        : "hover:bg-muted/40"
                      }
                    `}
                  >
                    {/* Row checkbox */}
                    <TableCell className={`px-4 sticky left-0 z-10 ${isSelected ? "bg-emerald-50/60 dark:bg-emerald-950/20" : "bg-card"}`}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleRow(row.original.id)}
                        className="border-border data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                      />
                    </TableCell>

                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-4 whitespace-nowrap text-sm text-foreground">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="py-16 text-center"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Search size={28} className="text-muted-foreground/20" />
                    <p className="text-sm font-semibold text-foreground">No results found</p>
                    <p className="text-xs text-muted-foreground">
                      Try adjusting your search or location filter
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination footer ────────────────────────────────────────────── */}
      <div className="px-4 sm:px-5 py-3 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3">

        {/* Page size selector */}
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

        {/* Page info + buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            Page <span className="font-bold text-foreground">{pageIndex + 1}</span> of{" "}
            <span className="font-bold text-foreground">{pageCount || 1}</span>
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="outline" size="icon"
              className="h-7 w-7 rounded-lg border-border text-foreground hover:bg-accent disabled:opacity-30"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft size={14} />
            </Button>
            <Button
              variant="outline" size="icon"
              className="h-7 w-7 rounded-lg border-border text-foreground hover:bg-accent disabled:opacity-30"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft size={14} />
            </Button>
            <Button
              variant="outline" size="icon"
              className="h-7 w-7 rounded-lg border-border text-foreground hover:bg-accent disabled:opacity-30"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight size={14} />
            </Button>
            <Button
              variant="outline" size="icon"
              className="h-7 w-7 rounded-lg border-border text-foreground hover:bg-accent disabled:opacity-30"
              onClick={() => table.setPageIndex(pageCount - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight size={14} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}