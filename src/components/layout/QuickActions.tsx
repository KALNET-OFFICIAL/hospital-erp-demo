import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  UserPlus,
  Calendar,
  FileText,
  Pill,
  X,
  BedDouble,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
  path?: string;
  action?: () => void;
  color: string;
}

export function QuickActions() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const actions: QuickAction[] = [
    {
      id: "patient",
      label: "New Patient",
      icon: <UserPlus className="w-5 h-5" />,
      shortcut: "P",
      path: "/patients/new",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      id: "appointment",
      label: "Book Appointment",
      icon: <Calendar className="w-5 h-5" />,
      shortcut: "A",
      path: "/appointments/new",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      id: "bill",
      label: "Create Bill",
      icon: <FileText className="w-5 h-5" />,
      shortcut: "B",
      path: "/billing/new",
      color: "bg-yellow-500 hover:bg-yellow-600",
    },
    {
      id: "consultation",
      label: "Start Consultation",
      icon: <Stethoscope className="w-5 h-5" />,
      shortcut: "C",
      path: "/opd",
      color: "bg-sky-500 hover:bg-sky-600",
    },
    {
      id: "admission",
      label: "New Admission",
      icon: <BedDouble className="w-5 h-5" />,
      shortcut: "I",
      path: "/ipd",
      color: "bg-orange-500 hover:bg-orange-600",
    },
    {
      id: "pharmacy",
      label: "Pharmacy Sale",
      icon: <Pill className="w-5 h-5" />,
      shortcut: "S",
      path: "/pharmacy/pos",
      color: "bg-teal-500 hover:bg-teal-600",
    },
  ];

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Toggle with Alt+N
      if (event.altKey && event.key.toLowerCase() === "n") {
        event.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }

      // Quick action shortcuts when menu is open
      if (isOpen && !event.ctrlKey && !event.metaKey) {
        const action = actions.find(
          (a) => a.shortcut?.toLowerCase() === event.key.toLowerCase()
        );
        if (action) {
          event.preventDefault();
          handleAction(action);
        }

        // Close with Escape
        if (event.key === "Escape") {
          setIsOpen(false);
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleAction = (action: QuickAction) => {
    if (action.path) {
      navigate(action.path);
    } else if (action.action) {
      action.action();
    }
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`rounded-full w-10 h-10 p-0 shadow-lg transition-all duration-200 ${
          isOpen
            ? "bg-red-500 hover:bg-red-600 rotate-45"
            : "bg-primary-600 hover:bg-primary-700"
        }`}
        title="Quick Actions (Alt+N)"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
      </Button>

      {/* Actions Menu */}
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden min-w-[220px]">
            <div className="px-4 py-2 bg-gray-50 border-b">
              <p className="text-xs font-medium text-gray-500">QUICK ACTIONS</p>
              <p className="text-xs text-gray-400">Press shortcut key to select</p>
            </div>
            <div className="p-2">
              {actions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleAction(action)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors text-left group"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white ${action.color}`}>
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{action.label}</p>
                  </div>
                  {action.shortcut && (
                    <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 text-gray-500 rounded group-hover:bg-gray-200">
                      {action.shortcut}
                    </kbd>
                  )}
                </button>
              ))}
            </div>
            <div className="px-4 py-2 bg-gray-50 border-t text-center">
              <p className="text-xs text-gray-400">Press Esc to close</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
