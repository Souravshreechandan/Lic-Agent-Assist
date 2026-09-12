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
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/30
        p-4
      "
      onClick={onClose}
    >
      <div
        className="
          bg-white
          w-full
          max-w-2xl
          rounded-xl
          p-6
          relative
          max-h-[90vh]
          overflow-y-auto
        "
        onClick={(e) => e.stopPropagation()}
      >

        {/* CLOSE BUTTON */}
        <button
          type="button"
          onClick={onClose}
          className="
            absolute
            top-3
            right-3
            text-xl
            text-gray-500
            hover:text-gray-900
            z-10
          "
        >
          ✕
        </button>

        {/* EDIT CUSTOMER FORM */}
        <CustomerForm
          editData={customer}
          onSuccess={onSuccess}
        />

      </div>
    </div>
  );
}

