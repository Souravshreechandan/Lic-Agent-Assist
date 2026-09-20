import React, { useState } from "react";
import api from "../services/api";

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-7 w-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M5 20h14" />
    </svg>
  );
}

function FileIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8" />
      <path d="M8 17h6" />
    </svg>
  );
}

function formatAmount(amount) {
  const value = Number(amount);

  if (!Number.isFinite(value)) return "₹0";

  return `₹${value.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

export default function Duedate() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const uploadFile = async () => {
    if (!file) {
      setError("Please select the Premium Due List PDF.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post(
        "/customers/import-due-list",
        formData
      );

      setResult(response.data);
    } catch (err) {
      console.error("Upload error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to process PDF."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0] || null;

    if (
      selectedFile &&
      selectedFile.type !== "application/pdf" &&
      !selectedFile.name.toLowerCase().endsWith(".pdf")
    ) {
      setFile(null);
      setError("Please select a PDF file.");
      setResult(null);
      e.target.value = "";
      return;
    }

    setFile(selectedFile);
    setResult(null);
    setError("");
  };

  const removeFile = () => {
    setFile(null);
    setError("");
    setResult(null);
  };

  const stats = [
    {
      label: "Total",
      value: result?.totalRecords || 0,
      color: "text-[#17213f]",
    },
    {
      label: "Updated",
      value: result?.updated || 0,
      color: "text-blue-600",
    },
    {
      label: "Corrected",
      value: result?.corrected || 0,
      color: "text-orange-600",
    },
    {
      label: "Created",
      value: result?.created || 0,
      color: "text-green-600",
    },
  ];

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f5f7fb] pt-[132px] lg:pt-[68px]">
      <main className="mx-auto w-full min-w-0">
        <div className="mx-auto w-full max-w-[1600px] px-3 py-5 sm:px-5 sm:py-6 md:px-7 lg:px-8 xl:px-10">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-[#17213f] sm:text-3xl">
                Due Date
              </h1>

              <p className="mt-1 text-sm text-gray-500 sm:text-base">
                Upload the LIC Premium Due List PDF to update customer due
                dates.
              </p>
            </div>

            <div className="flex w-fit max-w-full items-center gap-2 rounded-xl bg-indigo-50 px-4 py-3 text-indigo-700">
              <CalendarIcon />
              <span className="text-sm font-medium">Due Date Update</span>
            </div>
          </div>

          <div className="w-full min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
            <div className="rounded-xl border-2 border-dashed border-gray-300 p-5 text-center sm:p-8">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <UploadIcon />
              </div>

              <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
                Upload Premium Due List
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Select the LIC Premium Due List PDF
              </p>

              <label className="mt-5 inline-flex max-w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
                <FileIcon className="h-[18px] w-[18px]" />
                <span>Choose PDF</span>

                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>

              {file && (
                <div className="mx-auto mt-5 flex w-full max-w-lg min-w-0 items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-3 sm:px-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <FileIcon className="h-[22px] w-[22px] shrink-0 text-red-500" />

                    <span className="truncate text-left text-sm font-medium text-gray-700">
                      {file.name}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={removeFile}
                    className="shrink-0 text-sm font-medium text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              )}

              <div>
                <button
                  type="button"
                  onClick={uploadFile}
                  disabled={!file || loading}
                  className={`mt-5 w-full rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition active:scale-95 sm:w-auto sm:px-7 ${
                    !file || loading
                      ? "cursor-not-allowed bg-gray-400 opacity-70"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {loading ? "Uploading & Processing..." : "Upload & Update"}
                </button>
              </div>

              <p className="mt-3 text-xs text-gray-400">PDF files only</p>
            </div>

            {error && (
              <div className="mt-5 rounded-lg bg-red-50 p-4 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            {result && (
              <div className="mt-6">
                <div className="mb-5 rounded-xl bg-green-50 p-4 sm:p-5">
                  <p className="break-words font-semibold text-green-700">
                    {result.message}
                  </p>

                  <div className="mt-4 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => (
                      <div
                        key={stat.label}
                        className="min-w-0 rounded-lg bg-white p-4"
                      >
                        <p className="text-xs text-gray-500">{stat.label}</p>

                        <p
                          className={`mt-1 break-words text-xl font-bold ${stat.color}`}
                        >
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {result.results?.length > 0 && (
                  <div className="w-full min-w-0 overflow-hidden rounded-xl border border-gray-200">
                    <div className="border-b border-gray-100 px-4 py-4 sm:px-5">
                      <h2 className="font-semibold text-[#17213f]">
                        Import Results
                      </h2>
                    </div>

                    <div className="w-full overflow-x-auto">
                      <table className="w-full min-w-[700px] text-left text-sm">
                        <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                          <tr>
                            <th className="whitespace-nowrap border-b p-3 sm:p-4">
                              Action
                            </th>
                            <th className="whitespace-nowrap border-b p-3 sm:p-4">
                              Name
                            </th>
                            <th className="whitespace-nowrap border-b p-3 sm:p-4">
                              Policy Number
                            </th>
                            <th className="whitespace-nowrap border-b p-3 sm:p-4">
                              Old Due Date
                            </th>
                            <th className="whitespace-nowrap border-b p-3 sm:p-4">
                              New Due Date
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                          {result.results.map((item, index) => (
                            <tr
                              key={`${item.policyNumber}-${index}`}
                              className="transition hover:bg-gray-50"
                            >
                              <td className="whitespace-nowrap p-3 sm:p-4">
                                <span
                                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                    item.action === "created"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-blue-100 text-blue-700"
                                  }`}
                                >
                                  {item.action === "created"
                                    ? "Created"
                                    : "Updated"}
                                </span>
                              </td>

                              <td className="whitespace-nowrap p-3 font-medium text-gray-900 sm:p-4">
                                {item.name || "—"}
                              </td>

                              <td className="whitespace-nowrap p-3 text-gray-600 sm:p-4">
                                {item.policyNumber || "—"}
                              </td>

                              <td className="whitespace-nowrap p-3 text-gray-500 sm:p-4">
                                {item.oldDueDate || "—"}
                              </td>

                              <td className="whitespace-nowrap p-3 font-semibold text-gray-900 sm:p-4">
                                {item.dueDate || "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}