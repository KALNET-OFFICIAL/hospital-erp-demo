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
import { getIdentityColor, getCurrentThemeMode } from "@/lib/theme";

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
  path?: string;
  action?: () => void;
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
    },
    {
      id: "appointment",
      label: "Book Appointment",
      icon: <Calendar className="w-5 h-5" />,
      shortcut: "A",
      path: "/appointments/new",
    },
    {
      id: "bill",
      label: "Create Bill",
      icon: <FileText className="w-5 h-5" />,
      shortcut: "B",
      path: "/billing/new",
    },
    {
      id: "consultation",
      label: "Start Consultation",
      icon: <Stethoscope className="w-5 h-5" />,
      shortcut: "C",
      path: "/opd",
    },
    {
      id: "admission",
      label: "New Admission",
      icon: <BedDouble className="w-5 h-5" />,
      shortcut: "I",
      path: "/ipd",
    },
    {
      id: "pharmacy",
      label: "Pharmacy Sale",
      icon: <Pill className="w-5 h-5" />,
      shortcut: "S",
      path: "/pharmacy/pos",
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

  const mode = getCurrentThemeMode();

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button — pure chrome, stays monochrome ink regardless of
          which module the menu links to */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`rounded-full w-10 h-10 p-0 shadow-lg transition-all duration-200 bg-primary-600 hover:bg-primary-700 ${
          isOpen ? "rotate-45" : ""
        }`}
        title="Quick Actions (Alt+N)"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
      </Button>

      {/* Actions Menu */}
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="bg-paper rounded-xl shadow-xl border border-line overflow-hidden min-w-[220px]">
            <div className="px-4 py-2 bg-slate-50/60 border-b border-line">
              <p className="text-xs font-medium text-ink-muted">QUICK ACTIONS</p>
              <p className="text-xs text-slate-400">Press shortcut key to select</p>
            </div>
            <div className="p-2">
              {actions.map((action) => {
                const accent = getIdentityColor(action.path ?? action.id, mode);
                return (
                  <button
                    key={action.id}
                    onClick={() => handleAction(action)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-hover transition-colors text-left group"
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${accent}1f`, color: accent }}
                    >
                      {action.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink">{action.label}</p>
                    </div>
                    {action.shortcut && (
                      <kbd className="px-2 py-1 text-xs font-mono bg-slate-100 text-ink-muted rounded group-hover:bg-slate-200">
                        {action.shortcut}
                      </kbd>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="px-4 py-2 bg-slate-50/60 border-t border-line text-center">
              <p className="text-xs text-slate-400">Press Esc to close</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
