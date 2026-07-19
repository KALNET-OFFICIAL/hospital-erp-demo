import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generatePatientId } from "@/lib/utils";
import { getPatientsFromStorage, savePatientsToStorage } from "@/lib/patient-storage";
import type { Patient } from "@/types";

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

export function PatientCreatePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      gender: "male",
    },
  });

  const onSubmit = async (data: PatientFormData) => {
    setIsSubmitting(true);
    const patientId = generatePatientId();
    const now = new Date().toISOString();
    const newPatient: Patient = {
      id: patientId,
      name: data.name,
      phone: data.phone,
      email: data.email || undefined,
      gender: data.gender,
      dob: data.dob,
      bloodGroup: (data.bloodGroup || undefined) as Patient["bloodGroup"],
      address: data.address || undefined,
      emergencyContact: data.emergencyContact || undefined,
      emergencyPhone: data.emergencyPhone || undefined,
      createdAt: now,
      updatedAt: now,
    };

    const existingPatients = getPatientsFromStorage();
    savePatientsToStorage([newPatient, ...existingPatients]);

    setIsSubmitting(false);
    navigate(`/patients/${patientId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-ink">Register New Patient</h1>
          <p className="text-ink-muted">Quick registration form</p>
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
            {isSubmitting ? "Saving..." : "Register Patient"}
          </Button>
        </div>
      </form>
    </div>
  );
}
