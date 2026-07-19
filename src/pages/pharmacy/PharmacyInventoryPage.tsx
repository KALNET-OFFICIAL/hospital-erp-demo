import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, AlertTriangle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { medicines } from "@/lib/mock-data";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

export function PharmacyInventoryPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const categories = [...new Set(medicines.map((m) => m.category))];

  const filteredMedicines = medicines.filter((med) => {
    const matchesSearch =
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.genericName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || med.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const lowStockCount = medicines.filter((m) => m.stock <= m.minStock).length;
  const totalValue = medicines.reduce((sum, m) => sum + m.stock * m.unitPrice, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Pharmacy Inventory</h1>
          <p className="text-ink-muted">Manage medicine stock and inventory</p>
        </div>
        <Button className="gap-2">
          <Plus size={16} />
          Add Medicine
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card
          variant="interactive"
          accent="primary"
          onClick={() => {
            setSearchQuery("");
            setCategoryFilter("all");
          }}
          className="hover:shadow-lg hover:-translate-y-0.5"
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
                <Package className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-ink-muted">Total Items</p>
                <p className="text-xl font-bold text-ink">{medicines.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          variant="interactive"
          accent="warning"
          onClick={() => navigate("/pharmacy/low-stock")}
          className="hover:shadow-lg hover:-translate-y-0.5"
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-50">
                <AlertTriangle className="h-5 w-5 text-warning-600" />
              </div>
              <div>
                <p className="text-sm text-ink-muted">Low Stock</p>
                <p className="text-xl font-bold text-warning-600">{lowStockCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          variant="interactive"
          accent="teal"
          onClick={() => setCategoryFilter("all")}
          className="hover:shadow-lg hover:-translate-y-0.5"
        >
          <CardContent className="p-4">
            <p className="text-sm text-ink-muted">Categories</p>
            <p className="text-xl font-bold text-ink">{categories.length}</p>
          </CardContent>
        </Card>
        <Card
          variant="interactive"
          accent="success"
          onClick={() => navigate("/reports/pharmacy")}
          className="hover:shadow-lg hover:-translate-y-0.5"
        >
          <CardContent className="p-4">
            <p className="text-sm text-ink-muted">Total Value</p>
            <p className="text-xl font-bold text-success-600">
              {formatCurrency(totalValue)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockCount > 0 && (
        <Card className="border-warning-200 bg-warning-50">
          <CardContent className="flex items-center gap-4 py-4">
            <AlertTriangle className="h-5 w-5 text-warning-600" />
            <div>
              <p className="font-medium text-warning-800">
                {lowStockCount} items are below minimum stock level
              </p>
              <p className="text-sm text-warning-700">
                Review and reorder soon to avoid stockouts
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search medicines..."
                icon={<Search size={18} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="rounded-lg border border-line bg-paper text-ink px-3 py-2 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Medicine</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMedicines.map((medicine) => (
              <TableRow key={medicine.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-ink">{medicine.name}</p>
                    <p className="text-sm text-ink-muted">{medicine.genericName}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="default">{medicine.category}</Badge>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "font-medium",
                      medicine.stock <= medicine.minStock
                        ? "text-danger-600"
                        : "text-ink"
                    )}
                  >
                    {medicine.stock}
                  </span>
                  <span className="text-ink-muted"> / {medicine.minStock} min</span>
                </TableCell>
                <TableCell>{formatCurrency(medicine.unitPrice)}</TableCell>
                <TableCell className="text-ink-muted">{medicine.batchNumber}</TableCell>
                <TableCell className="text-ink-muted">
                  {formatDate(medicine.expiryDate)}
                </TableCell>
                <TableCell>
                  {medicine.stock <= medicine.minStock ? (
                    <Badge variant="danger">Low Stock</Badge>
                  ) : (
                    <Badge variant="success">In Stock</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
