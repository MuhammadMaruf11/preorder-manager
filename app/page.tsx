/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Preorder } from "@/types";

type SortOption = "name" | "created_at" | "startsAt" | "endsAt";
type FilterOption = "all" | "active" | "inactive";

function formatDate(dateStr: string | null) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function PreordersPage() {
  const router = useRouter();
  const [preorders, setPreorders] = useState<Preorder[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<FilterOption>("all");
  const [sortBy, setSortBy] = useState<SortOption>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchPreorders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        filter,
        sortBy,
        sortDir,
        page: String(page),
        pageSize: String(pageSize),
      });
      const res = await fetch(`/api/preorders?${params}`);
      const data = await res.json();
      setPreorders(data.data || []);
      setTotal(data.total || 0);
      setSelected(new Set());
    } finally {
      setLoading(false);
    }
  }, [filter, sortBy, sortDir, page, pageSize]);

  useEffect(() => {
    fetchPreorders();
  }, [fetchPreorders]);

  const totalPages = Math.ceil(total / pageSize);

  const toggleStatus = async (preorder: Preorder) => {
    setTogglingId(preorder.id);
    await fetch(`/api/preorders/${preorder.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: !preorder.status }), // boolean flip
    });
    await fetchPreorders();
    setTogglingId(null);
  };

  const deletePreorder = async (id: number) => {
    if (!confirm("Are you sure you want to delete this preorder?")) return;
    setDeletingId(id);
    await fetch(`/api/preorders/${id}`, { method: "DELETE" });
    await fetchPreorders();
    setDeletingId(null);
  };

  const allSelected =
    preorders.length > 0 && preorders.every((p) => selected.has(p.id));
  const someSelected = preorders.some((p) => selected.has(p.id));

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(preorders.map((p) => p.id)));
  };

  const toggleOne = (id: number) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Preorders</h1>
          <button
            onClick={() => router.push("/preorders/create")}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition"
          >
            Create Preorder
          </button>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Tabs + Sort */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <div className="flex gap-1">
              {(["all", "active", "inactive"] as FilterOption[]).map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setFilter(f);
                    setPage(1);
                  }}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition ${
                    filter === f
                      ? "bg-gray-200 text-gray-900"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            {/* Sort button */}
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition"
                title="Sort"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 6h18M6 12h12M9 18h6" />
                </svg>
              </button>
              {showSortMenu && (
                <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-xl shadow-lg z-20 w-52 p-3">
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    Sort by
                  </p>
                  {(
                    [
                      "name",
                      "created_at",
                      "startsAt",
                      "endsAt",
                    ] as SortOption[]
                  ).map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-2 py-1.5 cursor-pointer hover:text-gray-900"
                    >
                      <input
                        type="radio"
                        name="sortBy"
                        checked={sortBy === opt}
                        onChange={() => {
                          setSortBy(opt);
                          setPage(1);
                        }}
                        className="accent-gray-900"
                      />
                      <span className="text-sm text-gray-700 capitalize">
                        {opt
                          .replace("_", " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
                    </label>
                  ))}
                  <hr className="my-2 border-gray-200" />
                  {(["asc", "desc"] as const).map((d) => (
                    <label
                      key={d}
                      className="flex items-center gap-2 py-1.5 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="sortDir"
                        checked={sortDir === d}
                        onChange={() => {
                          setSortDir(d);
                          setPage(1);
                        }}
                        className="accent-gray-900"
                      />
                      <span className="text-sm text-gray-700 flex items-center gap-1">
                        {d === "asc" ? "↑ Ascending" : "↓ Descending"}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someSelected && !allSelected;
                      }}
                      onChange={toggleAll}
                      className="rounded accent-gray-900"
                    />
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Name
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Products
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Preorder when
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Starts at
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Ends at
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-400">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                        Loading...
                      </div>
                    </td>
                  </tr>
                ) : preorders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-400">
                      No preorders found.
                    </td>
                  </tr>
                ) : (
                  preorders.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(p.id)}
                          onChange={() => toggleOne(p.id)}
                          className="rounded accent-gray-900"
                        />
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {p.name}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{p.products}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {p.preorderWhen}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatDate(p.startsAt)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatDate(p.endsAt)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleStatus(p)}
                          disabled={togglingId === p.id}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                            p.status ? "bg-gray-900" : "bg-gray-300"
                          } ${togglingId === p.id ? "opacity-50" : ""}`}
                          title={p.status ? "Active" : "Inactive"}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                              p.status ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              router.push(`/preorders/${p.id}/edit`)
                            }
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                            title="Edit"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => deletePreorder(p.id)}
                            disabled={deletingId === p.id}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                            title="Delete"
                          >
                            {deletingId === p.id ? (
                              <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                            ) : (
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14H6L5 6" />
                                <path d="M10 11v6M14 11v6" />
                                <path d="M9 6V4h6v2" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-3 px-4 py-4 border-t border-gray-200">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              ‹
            </button>
            <span className="text-sm text-gray-600 font-medium">
              Showing {total === 0 ? 0 : (page - 1) * pageSize + 1} to{" "}
              {Math.min(page * pageSize, total)} from {total}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* Click outside to close sort menu */}
      {showSortMenu && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowSortMenu(false)}
        />
      )}
    </div>
  );
}
