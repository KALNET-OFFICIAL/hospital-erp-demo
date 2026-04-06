import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Save, Printer, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { patients, services, staff } from "@/lib/mock-data";
import { formatCurrency, generateInvoiceId } from "@/lib/utils";

interface BillingItem {
  id: string;
  serviceId: string;
  serviceCode: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

type VisitType = "opd" | "ipd" | "pharmacy";

export function BillingCreatePage() {
  const navigate = useNavigate();

  const [patientId, setPatientId] = useState("");
  const [visitType, setVisitType] = useState<VisitType>("opd");
  const [doctorId, setDoctorId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [items, setItems] = useState<BillingItem[]>([]);
  const [discount, setDiscount] = useState(0);

  const doctors = useMemo(() => staff.filter((member) => member.role === "doctor"), []);
  const selectedDoctor = doctors.find((doctor) => doctor.id === doctorId);

  const patientOptions = patients.map((patient) => ({
    value: patient.id,
    label: `${patient.name} (${patient.id})`,
  }));

  const doctorOptions = doctors.map((doctor) => ({
    value: doctor.id,
    label: `${doctor.name} - ${doctor.department}`,
  }));

  const serviceOptions = useMemo(() => {
    const filteredServices = services.filter((service) => {
      switch (visitType) {
        case "pharmacy":
          return service.category === "pharmacy" || service.category === "other";
        case "ipd":
          return service.category !== "pharmacy";
        case "opd":
        default:
          return service.category !== "room" && service.category !== "pharmacy";
      }
    });

    return filteredServices.map((service) => ({
      value: service.id,
      label: `${service.name} (${service.code}) - ${formatCurrency(service.basePrice)}`,
    }));
  }, [visitType]);

  const addService = (targetServiceId?: string) => {
    const resolvedServiceId = targetServiceId ?? serviceId;
    const selectedService = services.find((service) => service.id === resolvedServiceId);
    if (!selectedService) {
      return;
    }

    const resolvedUnitPrice =
      selectedService.category === "consultation" && selectedDoctor?.consultationFee
        ? selectedDoctor.consultationFee
        : selectedService.basePrice;

    setItems((prev) => {
      const existing = prev.find((item) => item.serviceId === selectedService.id);
      if (existing) {
        return prev.map((item) =>
          item.serviceId === selectedService.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...prev,
        {
          id: `${selectedService.id}_${Date.now()}`,
          serviceId: selectedService.id,
          serviceCode: selectedService.code,
          name: selectedService.name,
          category: selectedService.category,
          quantity: 1,
          unitPrice: resolvedUnitPrice,
          taxRate: selectedService.tax,
        },
      ];
    });

    setServiceId("");
  };

  const addConsultationForDoctor = () => {
    if (!selectedDoctor) {
      return;
    }

    const departmentConsultation =
      services.find(
        (service) =>
          service.category === "consultation" &&
          service.departmentName.toLowerCase() === selectedDoctor.department.toLowerCase()
      ) ?? services.find((service) => service.category === "consultation");

    if (departmentConsultation) {
      addService(departmentConsultation.id);
    }
  };

  useEffect(() => {
    if (!doctorId || visitType !== "opd") {
      return;
    }

    const hasConsultation = items.some((item) => item.category === "consultation");
    if (!hasConsultation) {
      addConsultationForDoctor();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId, visitType]);

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity,
            }
          : item
      )
    );
  };

  const updateUnitPrice = (id: string, unitPrice: number) => {
    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              unitPrice,
            }
          : item
      )
    );
  };

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const tax = items.reduce(
    (sum, item) => sum + (item.unitPrice * item.quantity * item.taxRate) / 100,
    0
  );
  const grandTotal = Math.max(subtotal + tax - discount, 0);

  const handleSubmit = () => {
    const invoiceId = generateInvoiceId();
    console.log("Creating invoice:", {
      id: invoiceId,
      patientId,
      visitType,
      doctorId: doctorId || undefined,
      items,
      subtotal,
      tax,
      discount,
      total: grandTotal,
    });

    navigate("/billing");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create Invoice</h1>
          <p className="text-slate-500">Build bill using configured services and smart defaults</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Billing Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                label="Patient"
                options={patientOptions}
                placeholder="Select patient"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
              />

              <Select
                label="Visit Type"
                value={visitType}
                onChange={(e) => setVisitType(e.target.value as VisitType)}
                options={[
                  { value: "opd", label: "OPD" },
                  { value: "ipd", label: "IPD" },
                  { value: "pharmacy", label: "Pharmacy" },
                ]}
              />

              {visitType !== "pharmacy" && (
                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <Select
                    label="Doctor"
                    options={doctorOptions}
                    placeholder="Select doctor"
                    value={doctorId}
                    onChange={(e) => setDoctorId(e.target.value)}
                  />
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={addConsultationForDoctor}
                      disabled={!selectedDoctor}
                    >
                      <Stethoscope className="mr-2 h-4 w-4" />
                      Add Consult
                    </Button>
                  </div>
                </div>
              )}

              {selectedDoctor && (
                <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                  Smart default consultation fee: {formatCurrency(selectedDoctor.consultationFee ?? 500)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select
                    options={serviceOptions}
                    placeholder="Select service"
                    value={serviceId}
                    onChange={(e) => setServiceId(e.target.value)}
                  />
                </div>
                <Button onClick={() => addService()} disabled={!serviceId}>
                  <Plus size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invoice Items</CardTitle>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <p className="py-8 text-center text-slate-500">No items added yet.</p>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => {
                    const rowTotal = item.unitPrice * item.quantity;
                    return (
                      <div
                        key={item.id}
                        className="grid items-center gap-3 rounded-lg border border-slate-200 p-3 lg:grid-cols-[1fr_auto_auto_auto_auto]"
                      >
                        <div>
                          <p className="font-medium text-slate-900">{item.name}</p>
                          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                            <Badge variant="default">{item.category}</Badge>
                            <span>{item.serviceCode}</span>
                            <span>Tax {item.taxRate}%</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </div>

                        <Input
                          type="number"
                          className="w-24"
                          value={item.unitPrice}
                          onChange={(e) => updateUnitPrice(item.id, Number(e.target.value))}
                        />

                        <div className="w-24 text-right font-semibold">{formatCurrency(rowTotal)}</div>

                        <Button variant="ghost" size="icon-sm" onClick={() => removeItem(item.id)}>
                          <Trash2 size={16} className="text-danger-500" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tax</span>
                  <span className="font-medium">{formatCurrency(tax)}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500">Discount</span>
                  <Input
                    type="number"
                    className="w-28 text-right"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                  />
                </div>
                <div className="border-t border-slate-200 pt-2">
                  <div className="flex justify-between text-base font-semibold text-slate-900">
                    <span>Total</span>
                    <span>{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Button
                  className="w-full gap-2"
                  onClick={handleSubmit}
                  disabled={!patientId || items.length === 0}
                >
                  <Save size={16} />
                  Save & Continue
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <Printer size={16} />
                  Print Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
