import { useState } from "react";
import {
  Search,
  Upload,
  FileText,
  File,
  Image,
  Download,
  Eye,
  Trash2,
  Folder,
  FolderOpen,
  Filter,
  Grid,
  List,
  MoreVertical,
  Calendar,
  User,
  Tag,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { patients } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";
import { useHospitalOpsStore } from "@/stores";
import { getIdentityColor, getCurrentThemeMode } from "@/lib/theme";

// Mock documents data
const baseDocuments = [
  { id: "DOC001", name: "Blood Test Report - CBC.pdf", type: "lab_report", category: "Lab Reports", patientId: "PT001", patientName: "Rajesh Kumar", uploadedBy: "Dr. Anil Mehta", uploadedAt: "2024-01-20T10:30:00Z", size: "245 KB", fileType: "pdf" },
  { id: "DOC002", name: "X-Ray Chest.jpg", type: "radiology", category: "Radiology", patientId: "PT001", patientName: "Rajesh Kumar", uploadedBy: "Radiology Dept", uploadedAt: "2024-01-19T15:00:00Z", size: "1.2 MB", fileType: "image" },
  { id: "DOC003", name: "Prescription - 20-Jan-2024.pdf", type: "prescription", category: "Prescriptions", patientId: "PT002", patientName: "Priya Sharma", uploadedBy: "Dr. Sunita Rao", uploadedAt: "2024-01-20T11:00:00Z", size: "156 KB", fileType: "pdf" },
  { id: "DOC004", name: "Discharge Summary.pdf", type: "discharge", category: "Discharge Summaries", patientId: "PT003", patientName: "Amit Patel", uploadedBy: "Dr. Vikram Singh", uploadedAt: "2024-01-18T16:30:00Z", size: "320 KB", fileType: "pdf" },
  { id: "DOC005", name: "ECG Report.pdf", type: "lab_report", category: "Lab Reports", patientId: "PT001", patientName: "Rajesh Kumar", uploadedBy: "Cardiology Dept", uploadedAt: "2024-01-20T09:00:00Z", size: "180 KB", fileType: "pdf" },
  { id: "DOC006", name: "Insurance Claim Form.pdf", type: "insurance", category: "Insurance", patientId: "PT002", patientName: "Priya Sharma", uploadedBy: "Billing Dept", uploadedAt: "2024-01-17T14:00:00Z", size: "95 KB", fileType: "pdf" },
  { id: "DOC007", name: "MRI Brain Scan.jpg", type: "radiology", category: "Radiology", patientId: "PT004", patientName: "Suman Verma", uploadedBy: "Radiology Dept", uploadedAt: "2024-01-16T11:30:00Z", size: "2.5 MB", fileType: "image" },
  { id: "DOC008", name: "Consent Form - Surgery.pdf", type: "consent", category: "Consent Forms", patientId: "PT003", patientName: "Amit Patel", uploadedBy: "Reception", uploadedAt: "2024-01-15T10:00:00Z", size: "75 KB", fileType: "pdf" },
];
type DocumentRow = (typeof baseDocuments)[0];

// Document/folder type is an identity, not a state — always routed through
// getIdentityColor so the same type hashes to the same accent everywhere
// (stat tile, list badge, card badge, file icon chip).
function typeAccent(type: string): string {
  return getIdentityColor(type, getCurrentThemeMode());
}

export default function DocumentsPage() {
  const { referrals } = useHospitalOpsStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPatient, setSelectedPatient] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentRow | null>(null);

  // Upload form
  const [uploadData, setUploadData] = useState({
    file: null as File | null,
    patientId: "",
    category: "",
    description: "",
  });

  const referralDocuments: DocumentRow[] = referrals.flatMap((referral) =>
    (referral.attachments ?? []).map((name, index) => ({
      id: `REFDOC-${referral.id}-${index}`,
      name,
      type: "referral",
      category: "Referrals",
      patientId: referral.patientId,
      patientName: referral.patientName,
      uploadedBy: referral.fromDoctorName,
      uploadedAt: referral.requestedAt,
      size: "N/A",
      fileType: name.toLowerCase().endsWith(".jpg") || name.toLowerCase().endsWith(".png") ? "image" : "pdf",
    }))
  );

  const documents: DocumentRow[] = [...referralDocuments, ...baseDocuments];

  const categories = [
    { id: "all", name: "All Documents", icon: Folder, count: documents.length },
    { id: "lab_report", name: "Lab Reports", icon: FileText, count: documents.filter((d) => d.type === "lab_report").length },
    { id: "prescription", name: "Prescriptions", icon: File, count: documents.filter((d) => d.type === "prescription").length },
    { id: "radiology", name: "Radiology", icon: Image, count: documents.filter((d) => d.type === "radiology").length },
    { id: "discharge", name: "Discharge Summaries", icon: FileText, count: documents.filter((d) => d.type === "discharge").length },
    { id: "consent", name: "Consent Forms", icon: File, count: documents.filter((d) => d.type === "consent").length },
    { id: "insurance", name: "Insurance", icon: FileText, count: documents.filter((d) => d.type === "insurance").length },
    { id: "referral", name: "Referrals", icon: Tag, count: documents.filter((d) => d.type === "referral").length },
  ];

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.patientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || doc.type === selectedCategory;
    const matchesPatient = selectedPatient === "all" || doc.patientId === selectedPatient;
    return matchesSearch && matchesCategory && matchesPatient;
  });

  const handleUpload = () => {
    console.log("Uploading:", uploadData);
    setShowUploadModal(false);
  };

  const handleDownload = (doc: DocumentRow) => {
    console.log("Downloading:", doc.name);
  };

  const handleDelete = (doc: DocumentRow) => {
    console.log("Deleting:", doc.id);
  };

  // Stats
  const totalDocs = documents.length;
  const todayUploads = documents.filter(d => new Date(d.uploadedAt).toDateString() === new Date().toDateString()).length;
  const totalSize = "12.5 MB"; // Would calculate from actual files

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Documents</h1>
          <p className="text-ink-muted mt-1">Manage patient files, reports, and prescriptions</p>
        </div>
        <Button onClick={() => setShowUploadModal(true)}>
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="Total Documents" value={totalDocs} icon={<FileText className="h-5 w-5" />} />
        <KpiCard title="Today's Uploads" value={todayUploads} icon={<Upload className="h-5 w-5" />} />
        <KpiCard
          title="Lab Reports"
          value={documents.filter((d) => d.type === "lab_report").length}
          icon={<File className="h-5 w-5" />}
          iconColor="lab_report"
        />
        <KpiCard title="Total Size" value={totalSize} icon={<Folder className="h-5 w-5" />} />
      </div>

      <div className="flex gap-6">
        {/* Sidebar - Categories */}
        <div className="w-64 flex-shrink-0 hidden lg:block">
          <Card className="p-4">
            <h3 className="font-medium text-ink mb-4">Categories</h3>
            <nav className="space-y-1">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === cat.id
                        ? "bg-selected text-ink"
                        : "text-ink-muted hover:bg-hover"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span>{cat.name}</span>
                    </div>
                    <span className="text-xs bg-slate-200 text-ink-muted px-2 py-0.5 rounded-full">
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-4">
          {/* Filters Bar */}
          <Card className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                  <Input
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="w-48"
              >
                <option value="all">All Patients</option>
                {patients.slice(0, 5).map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </Select>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-40 lg:hidden"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </Select>
              <div className="flex border border-line rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${viewMode === "grid" ? "bg-selected text-primary-600" : "text-ink-muted hover:bg-hover"}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${viewMode === "list" ? "bg-selected text-primary-600" : "text-ink-muted hover:bg-hover"}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </Card>

          {/* Documents */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredDocs.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onView={() => setSelectedDoc(doc)}
                  onDownload={() => handleDownload(doc)}
                  onDelete={() => handleDelete(doc)}
                />
              ))}
            </div>
          ) : (
            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocs.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <FileIcon type={doc.fileType} />
                          <span className="font-medium text-ink">{doc.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-ink-muted">{doc.patientName}</TableCell>
                      <TableCell>
                        <Badge
                          style={{
                            backgroundColor: `${typeAccent(doc.type)}1f`,
                            color: typeAccent(doc.type),
                          }}
                        >
                          {doc.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-ink-muted">{formatDate(doc.uploadedAt)}</TableCell>
                      <TableCell className="text-ink-muted">{doc.size}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <button onClick={() => setSelectedDoc(doc)} className="p-1 hover:bg-hover rounded">
                            <Eye className="w-4 h-4 text-ink-muted" />
                          </button>
                          <button onClick={() => handleDownload(doc)} className="p-1 hover:bg-hover rounded">
                            <Download className="w-4 h-4 text-ink-muted" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}

          {filteredDocs.length === 0 && (
            <div className="text-center py-12">
              <Folder className="w-12 h-12 text-ink-muted mx-auto mb-4" />
              <p className="text-ink-muted">No documents found</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Document"
      >
        <div className="space-y-4">
          {/* Drop Zone */}
          <div className="border-2 border-dashed border-line rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={(e) => setUploadData({ ...uploadData, file: e.target.files?.[0] || null })}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="w-10 h-10 text-ink-muted mx-auto mb-3" />
              <p className="text-ink-muted">
                <span className="text-primary-600 font-medium">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-ink-muted mt-1">PDF, JPG, PNG up to 10MB</p>
            </label>
            {uploadData.file && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-ink-muted">
                <FileText className="w-4 h-4" />
                <span>{uploadData.file.name}</span>
              </div>
            )}
          </div>

          <Select
            label="Patient *"
            value={uploadData.patientId}
            onChange={(e) => setUploadData({ ...uploadData, patientId: e.target.value })}
          >
            <option value="">Select Patient</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
            ))}
          </Select>

          <Select
            label="Category *"
            value={uploadData.category}
            onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
          >
            <option value="">Select Category</option>
            <option value="lab_report">Lab Report</option>
            <option value="prescription">Prescription</option>
            <option value="radiology">Radiology</option>
            <option value="discharge">Discharge Summary</option>
            <option value="consent">Consent Form</option>
            <option value="insurance">Insurance</option>
            <option value="other">Other</option>
          </Select>

          <div>
            <label className="block text-sm font-medium text-ink-muted mb-1">Description</label>
            <textarea
              className="w-full px-3 py-2 border border-line bg-paper text-ink rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              rows={2}
              placeholder="Optional description..."
              value={uploadData.description}
              onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-line">
            <Button variant="outline" onClick={() => setShowUploadModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!uploadData.file || !uploadData.patientId}>
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Document Modal */}
      <Modal
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        title={selectedDoc?.name || "Document Details"}
      >
        {selectedDoc && (
          <div className="space-y-4">
            {/* Preview Area */}
            <div className="bg-bg rounded-lg p-8 flex items-center justify-center min-h-48">
              {selectedDoc.fileType === "image" ? (
                <div className="text-center">
                  <Image className="w-16 h-16 text-ink-muted mx-auto mb-2" />
                  <p className="text-sm text-ink-muted">Image Preview</p>
                </div>
              ) : (
                <div className="text-center">
                  <FileText className="w-16 h-16 text-ink-muted mx-auto mb-2" />
                  <p className="text-sm text-ink-muted">PDF Document</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-ink-muted">Patient</p>
                <p className="font-medium">{selectedDoc.patientName}</p>
              </div>
              <div>
                <p className="text-sm text-ink-muted">Category</p>
                <Badge
                  style={{
                    backgroundColor: `${typeAccent(selectedDoc.type)}1f`,
                    color: typeAccent(selectedDoc.type),
                  }}
                >
                  {selectedDoc.category}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-ink-muted">Uploaded By</p>
                <p className="font-medium">{selectedDoc.uploadedBy}</p>
              </div>
              <div>
                <p className="text-sm text-ink-muted">Upload Date</p>
                <p className="font-medium">{formatDate(selectedDoc.uploadedAt)}</p>
              </div>
              <div>
                <p className="text-sm text-ink-muted">File Size</p>
                <p className="font-medium">{selectedDoc.size}</p>
              </div>
              <div>
                <p className="text-sm text-ink-muted">Document ID</p>
                <p className="font-mono text-sm">{selectedDoc.id}</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-line">
              <Button variant="outline" onClick={() => setSelectedDoc(null)}>
                Close
              </Button>
              <Button onClick={() => handleDownload(selectedDoc)}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// Document Card Component
function DocumentCard({
  document,
  onView,
  onDownload,
  onDelete,
}: {
  document: DocumentRow;
  onView: () => void;
  onDownload: () => void;
  onDelete: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <FileIcon type={document.fileType} />
          <div className="min-w-0">
            <h3 className="font-medium text-ink truncate" title={document.name}>
              {document.name}
            </h3>
            <p className="text-sm text-ink-muted">{document.patientName}</p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-hover rounded"
          >
            <MoreVertical className="w-4 h-4 text-ink-muted" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-paper rounded-lg shadow-lg border border-line py-1 z-10 min-w-32">
              <button
                onClick={() => { onView(); setShowMenu(false); }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-hover flex items-center gap-2"
              >
                <Eye className="w-4 h-4" /> View
              </button>
              <button
                onClick={() => { onDownload(); setShowMenu(false); }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-hover flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download
              </button>
              <button
                onClick={() => { onDelete(); setShowMenu(false); }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-hover flex items-center gap-2 text-danger-600"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Badge
          style={{
            backgroundColor: `${typeAccent(document.type)}1f`,
            color: typeAccent(document.type),
          }}
        >
          {document.category}
        </Badge>
        <span className="text-xs text-ink-muted">{document.size}</span>
      </div>

      <div className="mt-3 pt-3 border-t border-line flex items-center justify-between text-xs text-ink-muted">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formatDate(document.uploadedAt)}
        </span>
        <span className="flex items-center gap-1">
          <User className="w-3 h-3" />
          {document.uploadedBy}
        </span>
      </div>
    </Card>
  );
}

// File Icon Component
function FileIcon({ type }: { type: string }) {
  const accent = typeAccent(type);
  const style = { backgroundColor: `${accent}1f`, color: accent };

  if (type === "image") {
    return (
      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={style}>
        <Image className="w-5 h-5" />
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={style}>
      <FileText className="w-5 h-5" />
    </div>
  );
}
