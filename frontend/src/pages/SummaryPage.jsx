import React, { useState } from "react";
import { useFormContext } from "../contexts/FormContext";
import { useNavigate } from "react-router-dom";

const API_URL = `${import.meta.env.VITE_API_URL}generate/ingredients/`;

export default function SummaryPage() {
  const { form, updateForm } = useFormContext();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const dataPoints = [
    { label: "Recipe for", value: form.Recipe },
    { label: "Number of People", value: form.People, unit: "people" },
    { label: "Budget", value: form.Budget, unit: "₱" },
    { label: "Selected Address", value: form.Address },
    {
      label: "Latitude",
      value: form.AddressLat ? form.AddressLat.toFixed(4) : null,
      unit: "°",
    },
    {
      label: "Longitude",
      value: form.AddressLng ? form.AddressLng.toFixed(4) : null,
      unit: "°",
    },
  ];

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const payload = {
      dish: form.Recipe,
      people: form.People,
      budget: form.Budget,
      address: form.Address,
      lat: form.AddressLat,
      lng: form.AddressLng,
    };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Unknown backend error");
        setIsSubmitting(false);
        return;
      }

      updateForm("RecipeData", {
        dish: form.Recipe,
        people: form.People,
        budget: form.Budget,
        ingredients: data.ingredients,
      });

      navigate("/recipe-results");
    } catch (error) {
      console.error(error);
      alert("Failed to connect to backend");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="h-2 w-full bg-teal-500"></div>

        <div className="p-8 flex flex-col gap-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-4">
            Submission Summary
          </h1>

          <dl className="space-y-5">
            {dataPoints.map(
              (item, index) =>
                item.value && (
                  <div key={index} className="flex flex-col">
                    <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      {item.label}:
                    </dt>
                    <dd className="text-xl font-bold text-gray-900 mt-1 flex items-baseline">
                      {item.unit === "₱" && <span className="mr-1">₱</span>}
                      {item.value}
                      {item.unit && item.unit !== "₱" && (
                        <span className="ml-1 text-base text-gray-500">
                          {item.unit}
                        </span>
                      )}
                    </dd>
                  </div>
                )
            )}
          </dl>

          <div className="mt-6 flex justify-between gap-4">
            <button
              onClick={() => navigate("/form")}
              disabled={isSubmitting}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
            >
              Edit Details
            </button>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700"
            >
              {isSubmitting ? "Generating..." : "Confirm Submission"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
