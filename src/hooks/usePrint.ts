import { useCallback, useRef } from "react";

export function usePrint() {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useCallback(() => {
    if (!printRef.current) return;

    const printContent = printRef.current.innerHTML;
    const printWindow = window.open("", "_blank");
    
    if (!printWindow) {
      alert("Please allow popups to print");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Document</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            @media print {
              @page {
                size: A4;
                margin: 10mm;
              }
              body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
            }
            body {
              font-family: Arial, sans-serif;
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);

    printWindow.document.close();
    
    // Wait for styles to load
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  }, []);

  return { printRef, handlePrint };
}

export default usePrint;
