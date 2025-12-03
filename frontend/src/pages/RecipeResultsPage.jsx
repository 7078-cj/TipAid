import React, { useState, useCallback } from "react";
import { useFormContext } from "../contexts/FormContext";
import { useNavigate } from "react-router-dom";

const API_URL = `${import.meta.env.VITE_API_URL}generate/`;

export default function RecipeResultsPage() {
  const { form } = useFormContext();
  const navigate = useNavigate();

  const recipe = form.RecipeData; 

  const [groceryList, setGroceryList] = useState([]);
  const [customItem, setCustomItem] = useState({ name: "", quantity: "" });
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="p-8 bg-white shadow rounded-xl text-center">
          <h2 className="text-xl font-bold mb-4">No Recipe Loaded</h2>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-teal-600 text-white rounded-xl"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const addItemToGrocery = (item) => {
    if (groceryList.some((g) => g.name === item.name)) return;
    setGroceryList((prev) => [...prev, item]);
  };

  const removeItem = (index) =>
    setGroceryList((prev) => prev.filter((_, i) => i !== index));

  const handleGenerateRecommendation = async () => {
    if (groceryList.length === 0) {
      alert("Add ingredients first.");
      return;
    }

    setIsGenerating(true);

    const payload = {
      people: recipe.people,
      budget: recipe.budget,
      ingredients: groceryList,
    };

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.ok) {
      navigate("/recommendation", {
        state: { recommendation: data },
      });
    } else {
      alert("Error generating recommendation");
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex justify-center">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl">
        <div className="p-8 bg-teal-500 text-white rounded-t-3xl">
          <h1 className="text-4xl font-bold">{recipe.dish}</h1>
          <p>
            For {recipe.people} people • Budget ₱{recipe.budget}
          </p>
        </div>

        <div className="p-8 flex gap-6">
          {/* INGREDIENTS */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-4">Ingredients 🍳</h2>

            {recipe.ingredients.map((item, i) => (
              <div
                key={i}
                className="flex justify-between p-3 bg-gray-50 rounded-xl mb-2 border"
              >
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.quantity}</p>
                </div>

                <button
                  onClick={() => addItemToGrocery(item)}
                  className="px-3 py-1 bg-teal-600 text-white rounded"
                >
                  + Add
                </button>
              </div>
            ))}
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-4">
              Grocery List ({groceryList.length})
            </h2>

            <div className="min-h-[150px] p-3 bg-gray-50 border rounded-xl mb-4">
              {groceryList.length === 0 ? (
                <p className="text-gray-500 text-center py-10">No items yet.</p>
              ) : (
                groceryList.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between bg-white p-2 rounded mb-2 border"
                  >
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-600">{item.quantity}</p>
                    </div>

                    <button
                      onClick={() => removeItem(idx)}
                      className="px-3 py-1 bg-red-500 text-white rounded"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={handleGenerateRecommendation}
              disabled={isGenerating || groceryList.length === 0}
              className="w-full py-3 bg-teal-600 text-white rounded-xl"
            >
              {isGenerating ? "Generating..." : "✨ Generate Recommendation"}
            </button>

            <button
              onClick={() => navigate("/")}
              className="w-full mt-4 py-3 bg-gray-300 text-gray-800 rounded-xl"
            >
              ← Back to Form
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
