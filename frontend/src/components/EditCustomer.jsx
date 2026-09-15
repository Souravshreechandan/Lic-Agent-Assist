
import React from "react";
import CustomerForm from "./CustomerForm";

export default function EditCustomer({
  customer,
  onClose,
  onSuccess,
}) {
  if (!customer) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-black/40 p-3 pt-20 sm:items-center sm:p-4 sm:pt-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-xl bg-white p-4 shadow-xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full text-xl font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
        >
          ×
        </button>

        <div className="pr-10">
          <CustomerForm
            editData={customer}
            onSuccess={onSuccess}
          />
        </div>
      </div>
    </div>
  );
}
