import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { staff as mockStaff, departments } from "@/lib/mock-data";
import type { UserRole } from "@/types";

const staffSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  role: z.enum(["admin", "doctor", "reception", "pharmacist"]),
  department: z.string().min(1, "Department is required"),
  specialization: z.string().optional(),
  qualification: z.string().optional(),
  consultationFee: z.string().optional(),
});

type StaffFormData = z.infer<typeof staffSchema>;

const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "doctor", label: "Doctor" },
  { value: "reception", label: "Reception" },
  { value: "pharmacist", label: "Pharmacist" },
];

// Get staff from localStorage or fall back to mock data
function getStaff() {
  const stored = localStorage.getItem("hos_staff");
  if (stored) {
    return JSON.parse(stored);
  }
  return mockStaff;
}

// Save staff to localStorage
function saveStaff(staffList: typeof mockStaff) {
  localStorage.setItem("hos_staff", JSON.stringify(staffList));
}

// Generate staff ID
function generateStaffId(role: UserRole): string {
  const prefix = role === "doctor" ? "DOC" : role === "reception" ? "REC" : role === "pharmacist" ? "PH" : "ADM";
  return `${prefix}${String(Date.now()).slice(-4)}`;
}

interface StaffFormPageProps {
  mode: "create" | "edit";
}

export function StaffFormPage({ mode }: StaffFormPageProps) {
  const { staffId } = useParams<{ staffId: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingStaff, setExistingStaff] = useState<typeof mockStaff[0] | null>(null);

  const departmentOptions = [
    { value: "", label: "Select department" },
    ...departments.map((d) => ({ value: d.name, label: d.name })),
  ];

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      role: "doctor",
    },
  });

  const selectedRole = watch("role");

  useEffect(() => {
    if (mode === "edit" && staffId) {
      const staffList = getStaff();
      const found = staffList.find((s: typeof mockStaff[0]) => s.id === staffId);
      if (found) {
        setExistingStaff(found);
        reset({
          name: found.name,
          email: found.email,
          phone: found.phone,
          role: found.role,
          department: found.department,
          specialization: found.specialization || "",
          qualification: found.qualification || "",
          consultationFee: found.consultationFee?.toString() || "",
        });
      }
    }
  }, [mode, staffId, reset]);

  const onSubmit = async (data: StaffFormData) => {
    setIsSubmitting(true);
    const staffList = getStaff();

    if (mode === "create") {
      const newStaff = {
        id: generateStaffId(data.role as UserRole),
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role as UserRole,
        department: data.department,
        specialization: data.specialization || undefined,
        qualification: data.qualification || undefined,
        consultationFee: data.consultationFee ? parseInt(data.consultationFee) : undefined,
        joinDate: new Date().toISOString().split("T")[0],
        status: "active" as const,
      };
      staffList.push(newStaff);
      saveStaff(staffList);
    } else if (mode === "edit" && staffId) {
      const updatedList = staffList.map((s: typeof mockStaff[0]) =>
        s.id === staffId
          ? {
              ...s,
              name: data.name,
              email: data.email,
              phone: data.phone,
              role: data.role as UserRole,
              department: data.department,
              specialization: data.specialization || undefined,
              qualification: data.qualification || undefined,
              consultationFee: data.consultationFee ? parseInt(data.consultationFee) : undefined,
            }
          : s
      );
      saveStaff(updatedList);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      navigate("/staff");
    }, 500);
  };

  if (mode === "edit" && !existingStaff && staffId) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-ink-muted">Staff member not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-ink">
            {mode === "create" ? "Add New Staff" : "Edit Staff"}
          </h1>
          <p className="text-ink-muted">
            {mode === "create" ? "Register a new staff member" : `Update details for ${existingStaff?.id}`}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Full Name *"
              placeholder="Enter staff name"
              error={errors.name?.message}
              {...register("name")}
            />
            <Input
              label="Email *"
              type="email"
              placeholder="email@hospital.com"
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              label="Phone Number *"
              placeholder="10-digit mobile number"
              error={errors.phone?.message}
              {...register("phone")}
            />
            <Select
              label="Role *"
              options={roleOptions}
              error={errors.role?.message}
              {...register("role")}
            />
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Department *"
              options={departmentOptions}
              error={errors.department?.message}
              {...register("department")}
            />
            {selectedRole === "doctor" && (
              <>
                <Input
                  label="Specialization"
                  placeholder="e.g., Cardiologist, General Physician"
                  {...register("specialization")}
                />
                <Input
                  label="Qualification"
                  placeholder="e.g., MBBS, MD"
                  {...register("qualification")}
                />
                <Input
                  label="Consultation Fee (₹)"
                  type="number"
                  placeholder="500"
                  {...register("consultationFee")}
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            <Save size={16} />
            {isSubmitting ? "Saving..." : mode === "create" ? "Add Staff" : "Update Staff"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export function StaffCreatePage() {
  return <StaffFormPage mode="create" />;
}

export function StaffEditPage() {
  return <StaffFormPage mode="edit" />;
}
