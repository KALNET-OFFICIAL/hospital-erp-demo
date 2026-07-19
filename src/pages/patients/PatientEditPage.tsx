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
import { patients as mockPatients } from "@/lib/mock-data";

const patientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  gender: z.enum(["male", "female", "other"]),
  dob: z.string().min(1, "Date of birth is required"),
  bloodGroup: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const bloodGroupOptions = [
  { value: "", label: "Select blood group" },
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
];

// Get patients from localStorage or fall back to mock data
function getPatients() {
  const stored = localStorage.getItem("hos_patients");
  if (stored) {
    return JSON.parse(stored);
  }
  return mockPatients;
}

// Save patients to localStorage
function savePatients(patients: typeof mockPatients) {
  localStorage.setItem("hos_patients", JSON.stringify(patients));
}

export function PatientEditPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patient, setPatient] = useState<typeof mockPatients[0] | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
  });

  useEffect(() => {
    const patients = getPatients();
    const found = patients.find((p: typeof mockPatients[0]) => p.id === patientId);
    if (found) {
      setPatient(found);
      reset({
        name: found.name,
        phone: found.phone,
        email: found.email || "",
        gender: found.gender,
        dob: found.dob,
        bloodGroup: found.bloodGroup || "",
        address: found.address || "",
        emergencyContact: found.emergencyContact || "",
        emergencyPhone: found.emergencyPhone || "",
      });
    }
  }, [patientId, reset]);

  const onSubmit = async (data: PatientFormData) => {
    if (!patient) return;
    
    setIsSubmitting(true);
    
    // Update patient in storage
    const patients = getPatients();
    const updatedPatients = patients.map((p: typeof mockPatients[0]) =>
      p.id === patientId
        ? {
            ...p,
            ...data,
            updatedAt: new Date().toISOString(),
          }
        : p
    );
    
    savePatients(updatedPatients);
    
    // Simulate API delay
    setTimeout(() => {
      setIsSubmitting(false);
      navigate(`/patients/${patientId}`);
    }, 500);
  };

  if (!patient) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-ink-muted">Patient not found</p>
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
          <h1 className="text-2xl font-bold text-ink">Edit Patient</h1>
          <p className="text-ink-muted">Update patient information for {patient.id}</p>
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
              placeholder="Enter patient name"
              error={errors.name?.message}
              {...register("name")}
            />
            <Input
              label="Phone Number *"
              placeholder="10-digit mobile number"
              error={errors.phone?.message}
              {...register("phone")}
            />
            <Input
              label="Email"
              type="email"
              placeholder="email@example.com"
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              label="Date of Birth *"
              type="date"
              error={errors.dob?.message}
              {...register("dob")}
            />
            <Select
              label="Gender *"
              options={genderOptions}
              error={errors.gender?.message}
              {...register("gender")}
            />
            <Select
              label="Blood Group"
              options={bloodGroupOptions}
              {...register("bloodGroup")}
            />
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              label="Full Address"
              placeholder="House no, Street, City, State, PIN"
              {...register("address")}
            />
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Contact Name"
              placeholder="Emergency contact name"
              {...register("emergencyContact")}
            />
            <Input
              label="Contact Phone"
              placeholder="Emergency contact phone"
              {...register("emergencyPhone")}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            <Save size={16} />
            {isSubmitting ? "Saving..." : "Update Patient"}
          </Button>
        </div>
      </form>
    </div>
  );
}
