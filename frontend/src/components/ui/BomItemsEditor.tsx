"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Plus, Trash2, Package } from "lucide-react";
import ProductAutocomplete from "./ProductAutocomplete";

export interface BomItemData {
  id?: string;
  product: string;
  productId: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

interface BomItemsEditorProps {
  items: BomItemData[];
  onChange: (items: BomItemData[]) => void;
  onTotalCostChange: (totalCost: number) => void;
  disabled?: boolean;
}

export default function BomItemsEditor({
  items,
  onChange,
  onTotalCostChange,
  disabled = false,
}: BomItemsEditorProps) {
  const addItem = () => {
    const newItems = [
      ...items,
      { product: "", productId: "", quantity: 1, unitCost: 0, totalCost: 0 },
    ];
    onChange(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = items.map((item, i) => {
      if (i !== index) return item;
      const updated = { ...item, [field]: value };
      // Auto-calculate totalCost when qty or unitCost changes
      if (field === "quantity" || field === "unitCost") {
        const qty = field === "quantity" ? Number(value) || 0 : item.quantity;
        const cost = field === "unitCost" ? Number(value) || 0 : item.unitCost;
        updated.totalCost = Math.round(qty * cost * 100) / 100;
      }
      return updated;
    });
    onChange(newItems);
  };

  // Use a ref to store the callback so it doesn't trigger re-renders
  const onTotalCostRef = useRef(onTotalCostChange);
  onTotalCostRef.current = onTotalCostChange;

  // Update parent totalCost whenever items change (but NOT when callback ref changes)
  useEffect(() => {
    const total = items.reduce((sum, item) => sum + (item.totalCost || 0), 0);
    onTotalCostRef.current(Math.round(total * 100) / 100);
  }, [items]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700">BOM Items</label>
        {!disabled && (
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-xs font-semibold text-primary transition-colors"
          >
            <Plus size={12} /> Add Item
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-xs text-slate-400 py-4 text-center border border-dashed border-slate-200 rounded-lg">
          <Package size={20} className="mx-auto mb-1 text-slate-300" />
          No items yet. Click "Add Item" to add BOM components.
        </div>
      ) : (
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <div className="col-span-5">Product / Resource</div>
            <div className="col-span-2 text-right">Qty</div>
            <div className="col-span-2 text-right">Unit Cost</div>
            <div className="col-span-2 text-right">Total</div>
            {!disabled && <div className="col-span-1" />}
          </div>

          {/* Items */}
          {items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-2 px-3 py-2 border-b border-slate-50 last:border-b-0 items-center"
            >
              <div className="col-span-5">
                {disabled ? (
                  <span className="text-sm text-slate-700">{item.product || "—"}</span>
                ) : (
                  <ProductAutocomplete
                    value={item.product}
                    onChange={(name, productId) => {
                      updateItem(index, "product", name);
                      updateItem(index, "productId", productId || "");
                    }}
                    placeholder="Search product..."
                  />
                )}
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  value={item.quantity || ""}
                  onChange={(e) => updateItem(index, "quantity", parseFloat(e.target.value) || 0)}
                  disabled={disabled}
                  className="w-full text-right border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-slate-900 bg-white text-slate-900 disabled:bg-slate-50 disabled:text-slate-500"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  value={item.unitCost || ""}
                  onChange={(e) => updateItem(index, "unitCost", parseFloat(e.target.value) || 0)}
                  disabled={disabled}
                  className="w-full text-right border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-slate-900 bg-white text-slate-900 disabled:bg-slate-50 disabled:text-slate-500"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="col-span-2 text-right font-mono text-sm font-semibold text-slate-800">
                {item.totalCost.toLocaleString()}
              </div>
              {!disabled && (
                <div className="col-span-1 flex justify-center">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
