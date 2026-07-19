import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { invoices } from "@/lib/mock-data";
import { formatDate, formatCurrency } from "@/lib/utils";

export function BillingListPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.patientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || inv.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPending = invoices
    .filter((i) => i.paymentStatus !== "paid")
    .reduce((sum, i) => sum + (i.total - i.paidAmount), 0);

  const totalCollected = invoices
    .filter((i) => i.paymentStatus === "paid")
    .reduce((sum, i) => sum + i.total, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Billing</h1>
          <p className="text-ink-muted">Manage invoices and payments</p>
        </div>
        <Button onClick={() => navigate("/billing/new")} className="gap-2">
          <Plus size={16} />
          Create Invoice
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card
          variant="interactive"
          accent="primary"
          onClick={() => {
            setStatusFilter("all");
            setSearchQuery("");
          }}
          className="hover:shadow-lg hover:-translate-y-0.5"
        >
          <CardContent className="p-4">
            <p className="text-sm text-ink-muted">Total Invoices</p>
            <p className="text-2xl font-bold text-ink">{invoices.length}</p>
          </CardContent>
        </Card>
        <Card
          variant="interactive"
          accent="success"
          onClick={() => navigate("/billing/payments")}
          className="hover:shadow-lg hover:-translate-y-0.5"
        >
          <CardContent className="p-4">
            <p className="text-sm text-ink-muted">Collected Today</p>
            <p className="text-2xl font-bold text-success-600">
              {formatCurrency(totalCollected)}
            </p>
          </CardContent>
        </Card>
        <Card
          variant="interactive"
          accent="warning"
          onClick={() => setStatusFilter("pending")}
          className="hover:shadow-lg hover:-translate-y-0.5"
        >
          <CardContent className="p-4">
            <p className="text-sm text-ink-muted">Pending Amount</p>
            <p className="text-2xl font-bold text-warning-600">
              {formatCurrency(totalPending)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search by invoice ID or patient..."
                icon={<Search size={18} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
              </select>
              <Button variant="outline" size="sm" className="gap-2">
                <Download size={14} />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice ID</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.map((invoice) => (
              <TableRow
                key={invoice.id}
                className="cursor-pointer"
                onClick={() => navigate(`/billing/${invoice.id}`)}
              >
                <TableCell>
                  <Badge variant="default">{invoice.id}</Badge>
                </TableCell>
                <TableCell className="font-medium">{invoice.patientName}</TableCell>
                <TableCell>
                  <Badge variant="primary" className="uppercase">
                    {invoice.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-ink-muted">
                  {formatDate(invoice.createdAt)}
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(invoice.total)}
                </TableCell>
                <TableCell>{formatCurrency(invoice.paidAmount)}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      invoice.paymentStatus === "paid"
                        ? "success"
                        : invoice.paymentStatus === "partial"
                        ? "warning"
                        : "danger"
                    }
                  >
                    {invoice.paymentStatus}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
