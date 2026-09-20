import React, { useState } from "react";
import api from "../services/api";

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

  return (
    <div className="min-h-screen bg-gray-100 px-4 pb-8 pt-[90px] lg:pl-[230px]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#17213f]">
            Due Date
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Upload the LIC Premium Due List PDF to update customer due dates.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-md sm:p-6">
          <div className="rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
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
            </div>

            <h2 className="text-lg font-semibold text-gray-900">
              Upload Premium Due List
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Select the LIC Premium Due List PDF
            </p>

            <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
                <path d="M12 18V11" />
                <path d="m9 14 3-3 3 3" />
              </svg>

              Choose PDF

              <input
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0] || null;

                  if (
                    selectedFile &&
                    selectedFile.type !== "application/pdf" &&
                    !selectedFile.name.toLowerCase().endsWith(".pdf")
                  ) {
                    setFile(null);
                    setError("Please select a PDF file.");
                    return;
                  }

                  setFile(selectedFile);
                  setResult(null);
                  setError("");
                }}
              />
            </label>

            {file && (
              <div className="mx-auto mt-5 flex max-w-lg items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0 text-red-500"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                    <path d="M8 13h8" />
                    <path d="M8 17h6" />
                  </svg>

                  <span className="truncate text-sm font-medium text-gray-700">
                    {file.name}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setError("");
                    setResult(null);
                  }}
                  className="ml-4 shrink-0 text-sm font-medium text-red-500 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={uploadFile}
              disabled={!file || loading}
              className="mt-5 rounded-lg bg-blue-600 px-7 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Uploading & Processing..." : "Upload & Update"}
            </button>

            <p className="mt-3 text-xs text-gray-400">
              PDF files only
            </p>
          </div>

          {error && (
            <div className="mt-5 rounded-lg bg-red-50 p-4 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-6">
              <div className="mb-5 rounded-xl bg-green-50 p-4">
                <p className="font-semibold text-green-700">
                  {result.message}
                </p>

                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-lg bg-white p-3">
                    <p className="text-xs text-gray-500">
                      Total
                    </p>
                    <p className="mt-1 text-xl font-bold">
                      {result.totalRecords || 0}
                    </p>
                  </div>

                  <div className="rounded-lg bg-white p-3">
                    <p className="text-xs text-gray-500">
                      Updated
                    </p>
                    <p className="mt-1 text-xl font-bold text-blue-600">
                      {result.updated || 0}
                    </p>
                  </div>

                  <div className="rounded-lg bg-white p-3">
                    <p className="text-xs text-gray-500">
                      Corrected
                    </p>
                    <p className="mt-1 text-xl font-bold text-orange-600">
                      {result.corrected || 0}
                    </p>
                  </div>

                  <div className="rounded-lg bg-white p-3">
                    <p className="text-xs text-gray-500">
                      Created
                    </p>
                    <p className="mt-1 text-xl font-bold text-green-600">
                      {result.created || 0}
                    </p>
                  </div>
                </div>
              </div>

              {result.results?.length > 0 && (
                <div className="overflow-x-auto rounded-xl border">
                  <table className="w-full min-w-[700px] text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-left text-gray-600">
                        <th className="border-b p-3">
                          Action
                        </th>

                        <th className="border-b p-3">
                          Name
                        </th>

                        <th className="border-b p-3">
                          Policy Number
                        </th>

                        <th className="border-b p-3">
                          Old Due Date
                        </th>

                        <th className="border-b p-3">
                          New Due Date
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {result.results.map((item, index) => (
                        <tr
                          key={`${item.policyNumber}-${index}`}
                          className="hover:bg-gray-50"
                        >
                          <td className="border-b p-3">
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

                          <td className="border-b p-3 font-medium">
                            {item.name}
                          </td>

                          <td className="border-b p-3">
                            {item.policyNumber}
                          </td>

                          <td className="border-b p-3 text-gray-500">
                            {item.oldDueDate || "-"}
                          </td>

                          <td className="border-b p-3 font-semibold">
                            {item.dueDate}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}