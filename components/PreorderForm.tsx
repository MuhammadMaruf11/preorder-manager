/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Preorder } from "@/types";

type Props = {
  initial?: Preorder;
  mode: "create" | "edit";
};

function toDatetimeLocal(dateStr: string | null | undefined) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  // Format: YYYY-MM-DDTHH:mm
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function PreorderForm({ initial, mode }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    products: initial?.products ?? 1,
    preorderWhen: initial?.preorderWhen ?? "regardless-of-stock",
    startsAt:
      toDatetimeLocal(initial?.startsAt) ||
      toDatetimeLocal(new Date().toISOString()),
    endsAt: toDatetimeLocal(initial?.endsAt),
    status: initial ? initial.status === true : true,
  });
  const [error, setError] = useState("");

  const set = (key: string, value: any) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!form.startsAt) {
      setError("Start date is required.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const body = {
        name: form.name,
        products: Number(form.products),
        preorderWhen: form.preorderWhen,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
        status: form.status ? 1 : 0,
      };
      if (mode === "edit" && initial) {
        await fetch(`/api/preorders/${initial.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        await fetch("/api/preorders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
      router.push("/");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Top Nav */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-60 transition flex items-center gap-2"
            >
              {saving && (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              )}
              Save changes
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-base font-semibold text-gray-900">
              Preorder details
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              These values appear in the preorders list.
            </p>
          </div>

          {error && (
            <div className="mx-6 mt-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="divide-y divide-gray-100">
            {/* Name */}
            <div className="grid grid-cols-3 gap-4 px-6 py-5 items-start">
              <div>
                <label className="block text-sm font-semibold text-gray-800">
                  Name <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 mt-0.5">
                  A label to recognize this preorder by.
                </p>
              </div>
              <div className="col-span-2">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  className="w-full border text-black placeholder:text-black border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                  placeholder="e.g. Summer Launch"
                />
              </div>
            </div>

            {/* Products */}
            <div className="grid grid-cols-3 gap-4 px-6 py-5 items-start">
              <div>
                <label className="block text-sm font-semibold text-gray-800">
                  Products
                </label>
                <p className="text-xs text-gray-500 mt-0.5">
                  Number of products covered by this preorder.
                </p>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={form.products}
                  onChange={(e) => set("products", Number(e.target.value))}
                  className="w-24 border text-black placeholder:text-black border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
                <span className="text-sm text-gray-500">product(s)</span>
              </div>
            </div>

            {/* Preorder when */}
            <div className="grid grid-cols-3 gap-4 px-6 py-5 items-start">
              <div>
                <label className="block text-sm font-semibold text-gray-800">
                  Preorder when
                </label>
                <p className="text-xs text-gray-500 mt-0.5">
                  When customers are allowed to preorder.
                </p>
              </div>
              <div className="col-span-2">
                <select
                  value={form.preorderWhen}
                  onChange={(e) => set("preorderWhen", e.target.value)}
                  className="w-full border text-black placeholder:text-black border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
                >
                  <option value="regardless-of-stock">
                    regardless-of-stock
                  </option>
                  <option value="out-of-stock">out-of-stock</option>
                </select>
              </div>
            </div>

            {/* Starts at */}
            <div className="grid grid-cols-3 gap-4 px-6 py-5 items-start">
              <div>
                <label className="block text-sm font-semibold text-gray-800">
                  Starts at
                </label>
                <p className="text-xs text-gray-500 mt-0.5">
                  When the preorder window opens.
                </p>
              </div>
              <div className="col-span-2">
                <input
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(e) => set("startsAt", e.target.value)}
                  className="w-full border text-black placeholder:text-black border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>
            </div>

            {/* Ends at */}
            <div className="grid grid-cols-3 gap-4 px-6 py-5 items-start">
              <div>
                <label className="block text-sm font-semibold text-gray-800">
                  Ends at
                </label>
                <p className="text-xs text-gray-500 mt-0.5">
                  Leave empty for no end date.
                </p>
              </div>
              <div className="col-span-2">
                <input
                  type="datetime-local"
                  value={form.endsAt}
                  onChange={(e) => set("endsAt", e.target.value)}
                  className="w-full border text-black placeholder:text-black border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>
            </div>

            {/* Status */}
            <div className="grid grid-cols-3 gap-4 px-6 py-5 items-start">
              <div>
                <label className="block text-sm font-semibold text-gray-800">
                  Status
                </label>
                <p className="text-xs text-gray-500 mt-0.5">
                  Active preorders are visible to customers.
                </p>
              </div>
              <div className="col-span-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => set("status", !form.status)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    form.status ? "bg-gray-900" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      form.status ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <span className="text-sm text-gray-700">
                  {form.status ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-60 transition flex items-center gap-2"
          >
            {saving && (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
