import { useState, useMemo } from "react";
import { Search, Trash2, ShoppingCart, CreditCard, Printer, CheckCircle, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { medicines as mockMedicines, patients } from "@/lib/mock-data";
import { formatCurrency, cn } from "@/lib/utils";
import type { PaymentMethod } from "@/types";

interface CartItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  batchNumber: string;
  expiryDate: string;
}

interface PharmacySale {
  id: string;
  customerName: string;
  patientId?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  change: number;
  createdAt: string;
}

// Get medicines from localStorage or mock data
function getMedicines() {
  const stored = localStorage.getItem("hos_medicines");
  if (stored) {
    return JSON.parse(stored);
  }
  return mockMedicines;
}

// Save medicines to localStorage
function saveMedicines(meds: typeof mockMedicines) {
  localStorage.setItem("hos_medicines", JSON.stringify(meds));
}

// Get sales history
function getSales(): PharmacySale[] {
  const stored = localStorage.getItem("hos_pharmacy_sales");
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
}

// Save sale
function saveSale(sale: PharmacySale) {
  const sales = getSales();
  sales.unshift(sale);
  localStorage.setItem("hos_pharmacy_sales", JSON.stringify(sales));
}

// Generate sale ID
function generateSaleId(): string {
  return `POS${Date.now()}`;
}

const paymentOptions = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "upi", label: "UPI" },
];

export function PharmacyPOSPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [amountReceived, setAmountReceived] = useState("");
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastSale, setLastSale] = useState<PharmacySale | null>(null);
  const [medicines, setMedicines] = useState(getMedicines);

  const filteredMedicines = useMemo(() => 
    medicines.filter(
      (med: typeof mockMedicines[0]) =>
        (med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.genericName.toLowerCase().includes(searchQuery.toLowerCase())) &&
        med.stock > 0
    ),
    [medicines, searchQuery]
  );

  const patientOptions = useMemo(() => [
    { value: "", label: "Walk-in Customer" },
    ...patients.map((p) => ({ value: p.id, label: `${p.name} (${p.id})` })),
  ], []);

  const addToCart = (medicine: typeof mockMedicines[0]) => {
    if (medicine.stock <= 0) return;
    
    const existingItem = cart.find((item) => item.id === medicine.id);
    const currentQty = existingItem?.quantity || 0;
    
    if (currentQty >= medicine.stock) {
      alert(`Only ${medicine.stock} units available in stock`);
      return;
    }
    
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === medicine.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          id: medicine.id,
          name: medicine.name,
          quantity: 1,
          unitPrice: medicine.unitPrice,
          batchNumber: medicine.batchNumber,
          expiryDate: medicine.expiryDate,
        },
      ]);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }
    
    const medicine = medicines.find((m: typeof mockMedicines[0]) => m.id === id);
    if (medicine && quantity > medicine.stock) {
      alert(`Only ${medicine.stock} units available in stock`);
      return;
    }
    
    setCart(
      cart.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  const taxRate = 5; // 5% GST
  const tax = Math.round((subtotal * taxRate) / 100);
  const total = subtotal + tax - discount;
  const change = parseFloat(amountReceived || "0") - total;

  const clearCart = () => {
    setCart([]);
    setCustomerName("");
    setPatientId("");
    setDiscount(0);
    setAmountReceived("");
  };

  const openCheckout = () => {
    if (cart.length === 0) return;
    setAmountReceived(total.toString());
    setShowCheckoutModal(true);
  };

  const handleCheckout = () => {
    const received = parseFloat(amountReceived || "0");
    if (received < total) {
      alert("Amount received is less than total");
      return;
    }

    // Create sale record
    const sale: PharmacySale = {
      id: generateSaleId(),
      customerName: customerName || "Walk-in Customer",
      patientId: patientId || undefined,
      items: cart,
      subtotal,
      tax,
      discount,
      total,
      paymentMethod,
      amountPaid: received,
      change: received - total,
      createdAt: new Date().toISOString(),
    };

    // Update inventory
    const updatedMedicines = medicines.map((med: typeof mockMedicines[0]) => {
      const cartItem = cart.find((item) => item.id === med.id);
      if (cartItem) {
        return { ...med, stock: med.stock - cartItem.quantity };
      }
      return med;
    });

    // Save everything
    saveSale(sale);
    saveMedicines(updatedMedicines);
    setMedicines(updatedMedicines);
    setLastSale(sale);
    
    // Clear and show success
    clearCart();
    setShowCheckoutModal(false);
    setShowSuccessModal(true);
  };

  const handlePrint = () => {
    if (!lastSale) return;
    // In a real app, this would open a print dialog
    console.log("Printing receipt for:", lastSale);
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pharmacy POS</h1>
        <p className="text-slate-500">Point of Sale - Quick billing</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Products */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search */}
          <Input
            placeholder="Search medicines by name or generic name..."
            icon={<Search size={18} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Products Grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMedicines.map((medicine: typeof mockMedicines[0]) => (
              <Card
                key={medicine.id}
                className={cn(
                  "cursor-pointer transition-shadow hover:shadow-md",
                  medicine.stock <= medicine.minStock && "border-warning-300 bg-warning-50"
                )}
                onClick={() => addToCart(medicine)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{medicine.name}</p>
                      <p className="text-sm text-slate-500">{medicine.genericName}</p>
                    </div>
                    {medicine.stock <= medicine.minStock && (
                      <Badge variant="warning" className="text-xs">
                        Low
                      </Badge>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-lg font-bold text-primary-600">
                      {formatCurrency(medicine.unitPrice)}
                    </span>
                    <span className="text-sm text-slate-500">
                      Stock: {medicine.stock}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredMedicines.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500">No medicines found</p>
            </div>
          )}
        </div>

        {/* Right: Cart */}
        <div>
          <Card className="sticky top-24">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart size={20} />
                Cart ({cart.length} items)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Customer Selection */}
              <Select
                label="Patient/Customer"
                options={patientOptions}
                value={patientId}
                onChange={(e) => {
                  setPatientId(e.target.value);
                  const patient = patients.find((p) => p.id === e.target.value);
                  if (patient) {
                    setCustomerName(patient.name);
                  }
                }}
              />
              
              {!patientId && (
                <Input
                  placeholder="Customer name (optional)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              )}

              {/* Cart Items */}
              {cart.length === 0 ? (
                <p className="text-center text-slate-500 py-8">
                  Cart is empty. Click on products to add.
                </p>
              ) : (
                <div className="max-h-64 space-y-2 overflow-y-auto">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 p-2"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-slate-500">
                          {formatCurrency(item.unitPrice)} each
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon-sm"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span className="w-6 text-center text-sm">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                      <span className="w-16 text-right text-sm font-medium">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-6 w-6"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 size={14} className="text-danger-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Discount */}
              {cart.length > 0 && (
                <Input
                  label="Discount (₹)"
                  type="number"
                  placeholder="0"
                  value={discount || ""}
                  onChange={(e) => setDiscount(Math.max(0, parseInt(e.target.value) || 0))}
                />
              )}

              {/* Totals */}
              {cart.length > 0 && (
                <div className="space-y-2 border-t border-slate-200 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">GST ({taxRate}%)</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-success-600">
                      <span>Discount</span>
                      <span>-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-xl text-primary-600">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2 pt-2">
                <Button
                  className="w-full gap-2"
                  size="lg"
                  onClick={openCheckout}
                  disabled={cart.length === 0}
                >
                  <CreditCard size={18} />
                  Checkout {cart.length > 0 && `(${formatCurrency(total)})`}
                </Button>
                {cart.length > 0 && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={clearCart}
                  >
                    Clear Cart
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Checkout Modal */}
      <Modal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        title="Complete Payment"
      >
        <ModalBody>
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <p className="text-sm text-slate-500">Total Amount</p>
              <p className="text-3xl font-bold text-primary-600">{formatCurrency(total)}</p>
            </div>

            <Select
              label="Payment Method"
              options={paymentOptions}
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            />

            <Input
              label="Amount Received (₹)"
              type="number"
              value={amountReceived}
              onChange={(e) => setAmountReceived(e.target.value)}
            />

            {parseFloat(amountReceived || "0") >= total && (
              <div className="bg-success-50 rounded-lg p-4 text-center">
                <p className="text-sm text-success-600">Change to Return</p>
                <p className="text-2xl font-bold text-success-600">
                  {formatCurrency(parseFloat(amountReceived || "0") - total)}
                </p>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCheckoutModal(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCheckout}
            disabled={parseFloat(amountReceived || "0") < total}
            className="gap-2"
          >
            <CheckCircle size={16} />
            Complete Sale
          </Button>
        </ModalFooter>
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Sale Complete"
      >
        <ModalBody>
          <div className="text-center py-4">
            <div className="mx-auto w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle size={32} className="text-success-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Payment Successful!</h3>
            {lastSale && (
              <div className="space-y-2 text-sm text-slate-600">
                <p>Sale ID: {lastSale.id}</p>
                <p>Total: {formatCurrency(lastSale.total)}</p>
                {lastSale.change > 0 && (
                  <p className="text-success-600">Change: {formatCurrency(lastSale.change)}</p>
                )}
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowSuccessModal(false)}>
            Close
          </Button>
          <Button onClick={handlePrint} className="gap-2">
            <Printer size={16} />
            Print Receipt
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
