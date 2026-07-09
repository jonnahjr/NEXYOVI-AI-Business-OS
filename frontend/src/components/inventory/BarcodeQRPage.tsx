"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Search, Printer, Camera, Download, X, QrCode,
  Barcode, RefreshCw, Trash2, ScanLine, ShoppingCart,
  Package, AlertTriangle, CheckCircle, Eye
} from "lucide-react";
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";
import { useToast } from "@/components/ui/Toast";

// ── Types ────────────────────────────────────────────────
interface Product {
  id: string;
  sku: string;
  name: string;
  barcode: string;
  category: string;
  stock: number;
  sellPrice: number;
  unit: string;
  isActive: string;
}

// ── Helper: format currency ──────────────────────────────
const fmtCurrency = (val: number) =>
  val.toLocaleString("en-US", { style: "currency", currency: "ETB", minimumFractionDigits: 0 });

// ── Helper: status badge ─────────────────────────────────
const StatusBadge = ({ active }: { active: string }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
    active === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
  }`}>
    {active}
  </span>
);

// ── Barcode SVG Component ────────────────────────────────
function BarcodeSVG({ value, width = 180, height = 40 }: { value: string; width?: number; height?: number }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (svgRef.current && value && !error) {
      try {
        JsBarcode(svgRef.current, value, {
          format: value.length >= 12 ? "EAN13" : "CODE128",
          width: 1.5,
          height: 28,
          displayValue: true,
          fontSize: 10,
          margin: 4,
          background: "transparent",
          valid: (valid: boolean) => {
            if (!valid) setError(true);
          },
        });
      } catch {
        setError(true);
      }
    }
  }, [value, error]);

  if (!value || error) {
    return (
      <div className="flex items-center justify-center text-[10px] text-slate-400 h-full italic">
        No barcode
      </div>
    );
  }

  return <svg ref={svgRef} className="w-full" style={{ maxWidth: width }} />;
}

// ── QR Code Canvas Component ─────────────────────────────
function QRCanvas({ value, size = 80 }: { value: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 1,
        color: { dark: "#0f172a", light: "transparent" },
      });
    }
  }, [value, size]);

  if (!value) {
    return (
      <div className="flex items-center justify-center text-[10px] text-slate-400" style={{ width: size, height: size }}>
        No data
      </div>
    );
  }

  return <canvas ref={canvasRef} className="rounded-lg" />;
}

// ── Product Card ─────────────────────────────────────────
function ProductCard({
  product,
  onDelete,
  onSelect,
  isSelected,
}: {
  product: Product;
  onDelete: (id: string) => void;
  onSelect: (product: Product) => void;
  isSelected: boolean;
}) {
  const qrData = JSON.stringify({
    sku: product.sku,
    name: product.name,
    barcode: product.barcode,
    price: product.sellPrice,
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-white border rounded-xl overflow-hidden transition-all duration-200 ${
        isSelected
          ? "border-slate-900 ring-1 ring-slate-900 shadow-lg"
          : "border-slate-100 hover:border-slate-200 hover:shadow-md"
      }`}
    >
      {/* Top Section: QR + Info */}
      <div className="p-4 flex gap-3">
        {/* QR Code */}
        <div className="shrink-0 bg-white rounded-lg border border-slate-100 p-1.5 flex items-center justify-center">
          <QRCanvas value={qrData} size={72} />
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-sm text-slate-900 truncate">{product.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] font-mono text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded">
                  {product.sku}
                </span>
                <StatusBadge active={product.isActive} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Package size={11} className="text-slate-400" />
              {product.category || "N/A"}
            </span>
            <span className="flex items-center gap-1">
              <ShoppingCart size={11} className="text-slate-400" />
              <span className={product.stock <= 0 ? "text-red-500 font-semibold" : ""}>
                {product.stock} {product.unit || "pcs"}
              </span>
            </span>
            <span className="font-mono font-semibold text-slate-800">{fmtCurrency(product.sellPrice)}</span>
          </div>
        </div>
      </div>

      {/* Barcode Section */}
      <div className="px-4 pb-2">
        <div className="bg-slate-50 rounded-lg p-2 flex items-center justify-center min-h-[48px]">
          <BarcodeSVG value={product.barcode} width={200} height={40} />
        </div>
      </div>

      {/* Actions */}
      <div className="px-3 py-2 border-t border-slate-50 flex items-center justify-between bg-slate-50/50">
        <div className="flex gap-1">
          <button
            onClick={() => onSelect(product)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium text-slate-600 hover:bg-white hover:text-slate-900 transition-colors"
          >
            <Eye size={11} /> View QR
          </button>
          <button
            onClick={() => printLabel(product)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium text-slate-600 hover:bg-white hover:text-slate-900 transition-colors"
          >
            <Printer size={11} /> Label
          </button>
        </div>
        <button
          onClick={() => onDelete(product.id)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <Trash2 size={11} />
        </button>
      </div>
    </motion.div>
  );
}

// ── Print Label Helper ───────────────────────────────────
function printLabel(product: Product) {
  const qrData = JSON.stringify({ sku: product.sku, name: product.name, price: product.sellPrice });
  
  // Generate QR as data URL
  QRCode.toDataURL(qrData, { width: 200, margin: 1 }).then((qrUrl: string) => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html>
      <head>
        <title>Print Label - ${product.name}</title>
        <style>
          @page { margin: 0; size: 100mm 75mm; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Courier New', monospace;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 10px;
          }
          .label {
            width: 90mm;
            padding: 8mm;
            border: 1px dashed #ccc;
            text-align: center;
          }
          .name { font-size: 14px; font-weight: bold; margin-bottom: 4px; }
          .sku { font-size: 11px; color: #666; margin-bottom: 4px; }
          .price { font-size: 16px; font-weight: bold; margin: 6px 0; }
          .barcode { margin: 6px 0; }
          .qr-section { display: inline-block; }
          @media print {
            body { -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="label">
          <div class="name">${product.name}</div>
          <div class="sku">SKU: ${product.sku}</div>
          ${product.barcode ? `<div class="barcode"><img src="https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(product.barcode)}&code=${product.barcode.length >= 12 ? 'EAN13' : 'Code128'}&dpi=96&imagetype=png" style="height:40px" /></div>` : ''}
          <div class="price">ETB ${product.sellPrice.toLocaleString()}</div>
          <div class="qr-section"><img src="${qrUrl}" style="width:60px;height:60px" /></div>
          <div style="font-size:8px;color:#999;margin-top:4px">${product.category || ''}</div>
        </div>
        <script>window.onload = setTimeout(() => window.print(), 500);</script>
      </body>
      </html>
    `);
    win.document.close();
  });
}

// ── Print batch labels ───────────────────────────────────
function printBatchLabels(products: Product[]) {
  const labels = products.filter(p => p.barcode);
  if (labels.length === 0) return;

  const win = window.open("", "_blank");
  if (!win) return;

  let labelHtml = labels.map((p, i) => `
    <div class="label${i % 2 === 0 ? '' : ' even'}">
      <div class="name">${p.name}</div>
      <div class="sku">SKU: ${p.sku}</div>
      <div class="price">ETB ${p.sellPrice.toLocaleString()}</div>
    </div>
  `).join("");

  win.document.write(`
    <html>
    <head>
      <title>Print All Labels</title>
      <style>
        @page { margin: 0; size: 100mm 75mm; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Courier New', monospace; padding: 5mm; }
        .label {
          width: 95mm;
          height: 70mm;
          padding: 5mm;
          border: 1px dashed #ccc;
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          page-break-inside: avoid;
          page-break-after: always;
        }
        .name { font-size: 16px; font-weight: bold; margin-bottom: 4px; }
        .sku { font-size: 12px; color: #666; margin-bottom: 6px; }
        .price { font-size: 20px; font-weight: bold; margin: 8px 0; }
      </style>
    </head>
    <body>${labelHtml}</body>
    </html>
  `);
  win.document.close();
}

// ── Barcode Scanner Component ────────────────────────────
function BarcodeScanner({
  onDetected,
  onClose,
}: {
  onDetected: (code: string) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(true);
  const [lastCode, setLastCode] = useState("");

  useEffect(() => {
    let active = true;

    const startCamera = async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } },
        });
        if (!active) { s.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = s;
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      } catch {
        setError("Camera access denied or not available");
      }
    };

    startCamera();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Auto-scan with BarcodeDetector API
  useEffect(() => {
    if (!stream || !scanning) return;

    let interval: NodeJS.Timeout;

    const tryDetect = async () => {
      if (!("BarcodeDetector" in window)) {
        setScanning(false);
        return;
      }

      try {
        const detector = new (window as any).BarcodeDetector({
          formats: ["qr_code", "ean_13", "ean_8", "code_128", "code_39", "upc_a", "upc_e", "data_matrix", "pdf417"],
        });

        interval = setInterval(async () => {
          if (!videoRef.current) return;
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const code = barcodes[0].rawValue;
              if (code !== lastCode) {
                setLastCode(code);
                onDetected(code);
              }
            }
          } catch {}
        }, 500);
      } catch {
        setScanning(false);
      }
    };

    tryDetect();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [stream, scanning, lastCode, onDetected]);

  return (
    <div className="fixed inset-0 bg-slate-900/90 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ScanLine size={16} className="text-slate-900" />
            <h2 className="text-lg font-bold text-slate-900">Barcode / QR Scanner</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <div className="p-4">
          {error ? (
            <div className="text-center py-8">
              <AlertTriangle size={32} className="mx-auto text-amber-500 mb-3" />
              <p className="text-sm text-slate-600">{error}</p>
              <p className="text-xs text-slate-400 mt-1">
                Try using the search bar to find products by barcode instead.
              </p>
            </div>
          ) : (
            <>
              <div className="relative bg-black rounded-xl overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full aspect-[4/3] object-cover"
                />
                {/* Scanning overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-3/4 h-1/3 border-2 border-emerald-400 rounded-lg opacity-60">
                    <div className="w-full h-0.5 bg-emerald-400 animate-pulse" style={{ marginTop: "calc(50% - 1px)" }} />
                  </div>
                </div>
                {!scanning && (
                  <div className="absolute bottom-3 left-3 right-3 text-center">
                    <span className="bg-amber-500 text-white text-[10px] px-2 py-1 rounded-full">
                      Barcode detection not fully supported. Point at a code and use search.
                    </span>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-500 text-center mt-3">
                Point your camera at a barcode or QR code to automatically detect it
              </p>
            </>
          )}

          {/* Manual input fallback */}
          <div className="mt-4">
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Or enter barcode manually:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type barcode number..."
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.target as HTMLInputElement).value.trim()) {
                    onDetected((e.target as HTMLInputElement).value.trim());
                    (e.target as HTMLInputElement).value = "";
                  }
                }}
                autoFocus
              />
              <button
                onClick={() => onClose()}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Full-Screen QR Viewer ────────────────────────────────
function QRViewer({ product, onClose }: { product: Product; onClose: () => void }) {
  const [qrUrl, setQrUrl] = useState("");
  const qrData = JSON.stringify({
    sku: product.sku,
    name: product.name,
    barcode: product.barcode,
    price: product.sellPrice,
  });

  useEffect(() => {
    QRCode.toDataURL(qrData, { width: 400, margin: 2, color: { dark: "#0f172a", light: "#ffffff" } })
      .then(setQrUrl);
  }, [qrData]);

  return (
    <div className="fixed inset-0 bg-slate-900/90 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-sm w-full">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">{product.name}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 text-center">
          {qrUrl && (
            <img src={qrUrl} alt={`QR for ${product.name}`} className="mx-auto w-52 h-52 rounded-xl shadow-sm" />
          )}
          <div className="mt-4 space-y-1">
            <p className="text-sm font-mono text-slate-600">SKU: {product.sku}</p>
            <p className="text-sm text-slate-500">Barcode: {product.barcode || "—"}</p>
            <p className="text-lg font-bold text-slate-900">{fmtCurrency(product.sellPrice)}</p>
          </div>
          <div className="mt-5 flex gap-2 justify-center">
            {qrUrl && (
              <a
                href={qrUrl}
                download={`QR-${product.sku}.png`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
              >
                <Download size={14} /> Download QR
              </a>
            )}
            <button
              onClick={() => printLabel(product)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Printer size={14} /> Print Label
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Category Filter ──────────────────────────────────────
const CATEGORIES = [
  "All", "Food", "Beverage", "Electronics", "Construction", "Furniture",
  "Export", "Hardware", "Office Supplies", "Raw Materials", "Packaging",
  "Pharmaceutical", "Textile",
];

// ── Main Component ───────────────────────────────────────
export default function BarcodeQRPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [viewingQR, setViewingQR] = useState<Product | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState({ total: 0, withBarcode: 0, lowStock: 0 });
  const { toast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(
        `http://localhost:3002/api/v1/modules/inventory-warehouse/barcode-qr`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data?.data && Array.isArray(data.data)) {
        setProducts(data.data as Product[]);
        setStats({
          total: data.data.length,
          withBarcode: data.data.filter((p: Product) => p.barcode).length,
          lowStock: data.data.filter((p: Product) => p.stock <= 10).length,
        });
      }
    } catch {
      toast("Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // ── Filtering ─────────────────────────────────────────
  const filtered = products.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode && p.barcode.includes(search));
    const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // ── Toggle Select ─────────────────────────────────────
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((p) => p.id)));
    }
  };

  // ── Delete product ────────────────────────────────────
  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(
        `http://localhost:3002/api/v1/modules/inventory-warehouse/barcode-qr/${id}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        toast("Product removed", "success");
      }
    } catch {
      toast("Failed to delete", "error");
    }
  };

  // ── Handle scan detected ──────────────────────────────
  const handleScanResult = useCallback((code: string) => {
    setSearch(code);
    setShowScanner(false);
    toast(`Barcode detected: ${code}`, "info");
  }, [toast]);

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center">
              <QrCode size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Barcode / QR</h1>
              <p className="text-sm text-slate-500">Generate, scan, and print barcodes & QR codes for products</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowScanner(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all"
          >
            <Camera size={14} /> Scan
          </button>
          {selectedIds.size > 0 && (
            <button
              onClick={() => {
                const selected = products.filter((p) => selectedIds.has(p.id));
                printBatchLabels(selected);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all"
            >
              <Printer size={14} /> Print {selectedIds.size} Label(s)
            </button>
          )}
          <button
            onClick={() => {
              if (filtered.length === 0) return;
              printBatchLabels(filtered);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-all"
          >
            <Printer size={14} /> Print All
          </button>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-all"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm">
          <p className="text-xs text-slate-400 font-medium">Total Products</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm">
          <p className="text-xs text-slate-400 font-medium">With Barcode</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.withBarcode}</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm">
          <p className="text-xs text-slate-400 font-medium">Low Stock (≤10)</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{stats.lowStock}</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex gap-3 mb-5">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search by product name, SKU, or barcode...`}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent placeholder:text-slate-400"
            autoFocus
          />
        </div>
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-slate-900 bg-white text-slate-700 appearance-none cursor-pointer pl-3 pr-8 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_8px_center]"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat === "All" ? "All Categories" : cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 text-sm">
          <div className="flex flex-col items-center gap-3">
            <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
            Loading products...
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Barcode size={40} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-600 mb-1">No products found</h3>
          <p className="text-sm text-slate-400">
            {search
              ? `No products match "${search}". Try a different search term.`
              : "Add products with barcodes to get started."}
          </p>
        </div>
      ) : (
        <>
          {/* Select All bar */}
          <div className="flex items-center justify-between mb-3 px-1">
            <button
              onClick={selectAll}
              className="flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                selectedIds.size === filtered.length
                  ? "bg-slate-900 border-slate-900"
                  : "border-slate-300"
              }`}>
                {selectedIds.size === filtered.length && (
                  <CheckCircle size={10} className="text-white" />
                )}
              </div>
              {selectedIds.size === filtered.length ? "Deselect All" : "Select All"} ({filtered.length})
            </button>
            <span className="text-xs text-slate-400">
              {selectedIds.size} selected
            </span>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((product) => (
              <div key={product.id} className="relative">
                {/* Selection checkbox */}
                <button
                  onClick={() => toggleSelect(product.id)}
                  className={`absolute top-2 right-2 z-10 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    selectedIds.has(product.id)
                      ? "bg-slate-900 border-slate-900"
                      : "border-slate-300 bg-white opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {selectedIds.has(product.id) && (
                    <CheckCircle size={12} className="text-white" />
                  )}
                </button>
                <ProductCard
                  product={product}
                  onDelete={handleDelete}
                  onSelect={setViewingQR}
                  isSelected={selectedIds.has(product.id)}
                />
              </div>
            ))}
          </div>

          {/* Pagination / count footer */}

        </>
      )}

      {/* Scanner Modal */}
      {showScanner && (
        <BarcodeScanner
          onDetected={handleScanResult}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* QR Viewer Modal */}
      {viewingQR && (
        <QRViewer
          product={viewingQR}
          onClose={() => setViewingQR(null)}
        />
      )}
    </div>
  );
}
