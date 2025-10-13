'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { ChevronDown, Download, Filter, Search, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  enableExport?: boolean;
  title?: string;
  description?: string;
  initialColumnVisibility?: VisibilityState;
  className?: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'date' | 'daterange' | 'number';
  options?: { label: string; value: string }[];
  placeholder?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = 'Search...',
  filters = [],
  enableExport = false,
  title,
  description,
  initialColumnVisibility = {},
  className
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(initialColumnVisibility);
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [activeFilters, setActiveFilters] = React.useState<Record<string, any>>(
    {}
  );

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter
    }
  });

  const handleFilterChange = (key: string, value: any) => {
    setActiveFilters((prev) => ({
      ...prev,
      [key]: value
    }));

    // Apply filter to table
    const column = table.getColumn(key);
    if (column) {
      if (key === 'project') {
        // For project filtering, we need to filter by project.id
        column.setFilterValue(value);
      } else {
        column.setFilterValue(value);
      }
    }
  };

  const clearFilter = (key: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [key]: '__all__'
    }));

    const column = table.getColumn(key);
    if (column) {
      column.setFilterValue(undefined);
    }
  };

  const clearAllFilters = () => {
    const clearedFilters: Record<string, any> = {};
    filters.forEach((filter) => {
      clearedFilters[filter.key] = '__all__';
    });
    setActiveFilters(clearedFilters);
    setGlobalFilter('');
    table.resetColumnFilters();
    table.resetGlobalFilter();
  };

  const exportToCSV = () => {
    const headers = columns
      .filter((col) => col.id !== 'select' && col.id !== 'actions')
      .map((col) => (col as any).header || col.id)
      .join(',');

    const rows = table.getFilteredRowModel().rows.map((row) =>
      columns
        .filter((col) => col.id !== 'select' && col.id !== 'actions')
        .map((col) => {
          const cellValue = row.getValue(col.id as string);
          return typeof cellValue === 'string' ? `"${cellValue}"` : cellValue;
        })
        .join(',')
    );

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'data'}-export.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const activeFilterCount = Object.keys(activeFilters).filter(
    (key) => activeFilters[key] && activeFilters[key] !== '__all__'
  ).length;

  return (
    <Card className='w-full'>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            {title && <CardTitle>{title}</CardTitle>}
            {description && (
              <p className='text-muted-foreground mt-1 text-sm'>
                {description}
              </p>
            )}
          </div>
          <div className='flex items-center gap-2'>
            {enableExport && (
              <Button
                variant='outline'
                size='sm'
                onClick={exportToCSV}
                className='h-8'
              >
                <Download className='mr-2 h-4 w-4' />
                Export
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' size='sm' className='h-8'>
                  <ChevronDown className='mr-2 h-4 w-4' />
                  View
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-[150px]'>
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className='capitalize'
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {/* Search and Filters */}
          <div className='flex flex-col gap-4'>
            {/* Global Search */}
            {searchKey && (
              <div className='flex items-center space-x-2'>
                <Search className='text-muted-foreground h-4 w-4' />
                <Input
                  placeholder={searchPlaceholder}
                  value={globalFilter}
                  onChange={(event) => setGlobalFilter(event.target.value)}
                  className='max-w-sm'
                />
              </div>
            )}

            {/* Filters */}
            {filters.length > 0 && (
              <div className='space-y-3'>
                <div className='text-muted-foreground flex items-center gap-2 text-sm font-medium'>
                  <Filter className='h-4 w-4' />
                  Filters
                </div>
                <div className='flex flex-wrap items-center gap-2'>
                  {filters.map((filter) => (
                    <Select
                      key={filter.key}
                      value={activeFilters[filter.key] || '__all__'}
                      onValueChange={(value) =>
                        handleFilterChange(
                          filter.key,
                          value === '__all__' ? undefined : value
                        )
                      }
                    >
                      <SelectTrigger className='h-9 w-[160px] text-sm'>
                        <SelectValue
                          placeholder={filter.placeholder || filter.label}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='__all__'>
                          All {filter.label}
                        </SelectItem>
                        {filter.options?.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ))}
                  {activeFilterCount > 0 && (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={clearAllFilters}
                      className='h-9 px-3 text-sm'
                    >
                      Clear All
                      <X className='ml-2 h-3 w-3' />
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Active Filters Display */}
            {activeFilterCount > 0 && (
              <div className='flex flex-wrap gap-2'>
                {Object.entries(activeFilters).map(([key, value]) => {
                  if (!value || value === '__all__') return null;
                  const filter = filters.find((f) => f.key === key);
                  const option = filter?.options?.find(
                    (o) => o.value === value
                  );
                  return (
                    <Badge key={key} variant='secondary' className='text-xs'>
                      {filter?.label}: {option?.label || value}
                      <button
                        onClick={() => clearFilter(key)}
                        className='hover:bg-muted ml-1 rounded-full'
                      >
                        <X className='h-3 w-3' />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>

          {/* Table */}
          <div className='rounded-md border'>
            <div className='overflow-x-auto'>
              <Table className={className || 'w-full'}>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow
                      key={headerGroup.id}
                      className='hover:bg-muted/50'
                    >
                      {headerGroup.headers.map((header) => {
                        const columnSize = (header.column.columnDef as any)
                          .size;
                        return (
                          <TableHead
                            key={header.id}
                            className='font-semibold whitespace-nowrap'
                            style={
                              columnSize
                                ? {
                                    width: `${columnSize}px`,
                                    minWidth: `${columnSize}px`
                                  }
                                : undefined
                            }
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
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
                        data-state={row.getIsSelected() && 'selected'}
                        className='hover:bg-muted/50 transition-colors'
                      >
                        {row.getVisibleCells().map((cell) => {
                          const columnSize = (cell.column.columnDef as any)
                            .size;
                          return (
                            <TableCell
                              key={cell.id}
                              className='py-3'
                              style={
                                columnSize
                                  ? {
                                      width: `${columnSize}px`,
                                      minWidth: `${columnSize}px`
                                    }
                                  : undefined
                              }
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className='text-muted-foreground h-24 text-center'
                      >
                        No results found. Try adjusting your filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
          <div className='flex items-center justify-between space-x-2 py-4'>
            <div className='text-muted-foreground flex-1 text-sm'>
              {table.getFilteredSelectedRowModel().rows.length} of{' '}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className='flex items-center space-x-6 lg:space-x-8'>
              <div className='flex items-center space-x-2'>
                <p className='text-sm font-medium'>Rows per page</p>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={(value) => {
                    table.setPageSize(Number(value));
                  }}
                >
                  <SelectTrigger className='h-8 w-[70px]'>
                    <SelectValue
                      placeholder={table.getState().pagination.pageSize}
                    />
                  </SelectTrigger>
                  <SelectContent side='top'>
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='flex w-[100px] items-center justify-center text-sm font-medium'>
                Page {table.getState().pagination.pageIndex + 1} of{' '}
                {table.getPageCount()}
              </div>
              <div className='flex items-center space-x-2'>
                <Button
                  variant='outline'
                  className='hidden h-8 w-8 p-0 lg:flex'
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className='sr-only'>Go to first page</span>
                  {'<<'}
                </Button>
                <Button
                  variant='outline'
                  className='h-8 w-8 p-0'
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className='sr-only'>Go to previous page</span>
                  {'<'}
                </Button>
                <Button
                  variant='outline'
                  className='h-8 w-8 p-0'
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <span className='sr-only'>Go to next page</span>
                  {'>'}
                </Button>
                <Button
                  variant='outline'
                  className='hidden h-8 w-8 p-0 lg:flex'
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <span className='sr-only'>Go to last page</span>
                  {'>>'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
