import React, { useState } from "react";
import { useFormContext } from "../contexts/FormContext";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ShoppingBasket,
  ChefHat,
  Sparkles,
  Loader2,
  CheckCircle2,
  Utensils,
  ChevronLeft,
  ChevronRight,
  Wallet,
  AlertCircle,
} from "lucide-react";
import { API_URL } from "../utils/config";

const ITEMS_PER_PAGE = 5;

export default function RecipeResultsPage() {
  const { form, updateForm } = useFormContext();
  const navigate = useNavigate();

  const recipe = form.RecipeData;
  const [ingredients, setIngredients] = useState(recipe?.ingredients || []);
  const [groceryList, setGroceryList] = useState([]);

  // Budget State & Validation
  const [budget, setBudget] = useState(recipe?.budget || "");
  const [budgetError, setBudgetError] = useState(false);

  // Custom Item State
  const [customLeft, setCustomLeft] = useState({ name: "", quantity: "" });
  const [showCustomLeft, setShowCustomLeft] = useState(false);

  // UI State
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  if (!recipe) {
    setTimeout(() => navigate("/"), 0);
    return null;
  }

  // --- Logic: Pagination ---
  const totalPages = Math.ceil(
    (ingredients.length + (showCustomLeft ? 1 : 1)) / ITEMS_PER_PAGE
  );
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentIngredients = ingredients.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const nextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
  const prevPage = () => setCurrentPage((p) => Math.max(1, p - 1));

  // --- Logic: List Management ---
  const addItemToGrocery = (item) => {
    if (groceryList.some((g) => g.name === item.name)) return;
    setGroceryList((prev) => [...prev, item]);
  };

  const removeItem = (index) =>
    setGroceryList((prev) => prev.filter((_, i) => i !== index));

  const handleAddCustomLeft = () => {
    if (!customLeft.name.trim() || !customLeft.quantity.trim()) return;
    setIngredients((prev) => [...prev, customLeft]);
    setCustomLeft({ name: "", quantity: "" });
    setShowCustomLeft(false);
  };

  // --- Logic: Submission ---
  const handleGenerateRecommendation = async () => {
    // 1. Validate Basket
    if (groceryList.length === 0) {
      alert("Please add at least one item to your basket.");
      return;
    }

    // 2. Validate Budget (REQUIRED NOW)
    if (!budget || isNaN(budget) || parseFloat(budget) <= 0) {
      setBudgetError(true);
      // Shake effect or focus could go here
      return;
    }
    setBudgetError(false);

    setIsGenerating(true);

    const payload = {
      people: recipe.people,
      budget: parseFloat(budget),
      ingredients: groceryList,
    };

    try {
      const res = await fetch(`${API_URL}generate/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        updateForm("Recommendation", data);
        navigate("/recommendation");
      } else {
        alert(data.error || "Error generating recommendation");
      }
    } catch (error) {
      console.error(error);
      alert("Network Error");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    // Main Container: Fixed height to fit in view (calc 100vh - nav/padding)
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 h-[calc(100vh-40px)] flex flex-col">
      {/* --- Header (Compact) --- */}
      <div className="shrink-0 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-full bg-gray-100 hover:bg-emerald-100 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wide">
              <ChefHat size={12} /> Recipe Found
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
              {recipe.dish}{" "}
              <span className="text-gray-400 font-medium text-lg ml-2">
                ({recipe.people} servings)
              </span>
            </h1>
          </div>
        </div>
      </div>

      {/* --- Main Content Grid (Fills remaining height) --- */}
      <div className="flex-1 grid lg:grid-cols-2 gap-6 min-h-0 pb-6">
        {/* --- LEFT: Ingredients (Paginated Card) --- */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl shadow-gray-100 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Utensils size={18} className="text-emerald-500" /> Select
                Ingredients
              </h2>
              <p className="text-xs text-gray-500">
                Page {currentPage} of {totalPages}
              </p>
            </div>

            {/* Pagination Controls */}
            <div className="flex gap-2">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Scrollable List Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {currentIngredients.map((item, i) => {
              const isAdded = groceryList.some((g) => g.name === item.name);
              return (
                <div
                  key={i}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isAdded
                      ? "bg-emerald-50 border-emerald-100 opacity-60"
                      : "bg-white border-gray-100 hover:shadow-md"
                  }`}
                >
                  <div>
                    <p
                      className={`font-bold ${
                        isAdded ? "text-emerald-800" : "text-gray-800"
                      }`}
                    >
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">{item.quantity}</p>
                  </div>
                  <button
                    onClick={() => addItemToGrocery(item)}
                    disabled={isAdded}
                    className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                      isAdded
                        ? "text-emerald-600 bg-emerald-100"
                        : "bg-gray-100 text-gray-400 hover:bg-emerald-500 hover:text-white"
                    }`}
                  >
                    {isAdded ? <CheckCircle2 size={16} /> : <Plus size={16} />}
                  </button>
                </div>
              );
            })}

            {/* Custom Item Input (Shows on last page or if toggled) */}
            {!showCustomLeft && currentPage === totalPages && (
              <button
                onClick={() => setShowCustomLeft(true)}
                className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-bold hover:border-emerald-400 hover:text-emerald-600 text-sm flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Add Custom Item
              </button>
            )}

            {showCustomLeft && (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 animate-in fade-in">
                <input
                  value={customLeft.name}
                  onChange={(e) =>
                    setCustomLeft({ ...customLeft, name: e.target.value })
                  }
                  placeholder="Ingredient Name"
                  className="w-full px-3 py-2 bg-white border rounded-lg text-sm mb-2 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                />
                <div className="flex gap-2">
                  <input
                    value={customLeft.quantity}
                    onChange={(e) =>
                      setCustomLeft({ ...customLeft, quantity: e.target.value })
                    }
                    placeholder="Qty"
                    className="flex-1 px-3 py-2 bg-white border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  />
                  <button
                    onClick={handleAddCustomLeft}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-bold"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowCustomLeft(false)}
                    className="px-3 text-xs text-gray-400 underline"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- RIGHT: Basket & Budget (Fixed Height) --- */}
        <div className="flex flex-col gap-4 h-full min-h-0">
          {/* 1. REQUIRED BUDGET CARD */}
          <div
            className={`shrink-0 bg-white p-5 rounded-3xl shadow-lg border-2 transition-colors ${
              budgetError ? "border-red-400 bg-red-50" : "border-emerald-100"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <label
                className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                  budgetError ? "text-red-600" : "text-emerald-800"
                }`}
              >
                <Wallet size={16} /> Required Budget
              </label>
              {budgetError && (
                <span className="text-xs text-red-600 font-bold flex items-center gap-1">
                  <AlertCircle size={12} /> Enter amount
                </span>
              )}
            </div>

            <div className="relative">
              <span
                className={`absolute left-0 top-1/2 -translate-y-1/2 text-3xl font-light ${
                  budgetError ? "text-red-400" : "text-emerald-500"
                }`}
              >
                ₱
              </span>
              <input
                type="number"
                value={budget}
                onChange={(e) => {
                  setBudget(e.target.value);
                  setBudgetError(false);
                }}
                placeholder="0.00"
                className={`w-full pl-8 bg-transparent text-4xl font-extrabold focus:outline-none placeholder-gray-300 ${
                  budgetError ? "text-red-600" : "text-gray-800"
                }`}
              />
            </div>
          </div>

          {/* 2. BASKET LIST (Fills remaining space) */}
          <div className="flex-1 bg-emerald-900/5 rounded-3xl border border-emerald-100/50 shadow-inner flex flex-col overflow-hidden">
            <div className="p-4 border-b border-emerald-100/50 flex justify-between items-center">
              <h3 className="font-bold text-emerald-900 flex items-center gap-2">
                <ShoppingBasket size={18} /> Basket
              </h3>
              <span className="bg-white text-emerald-800 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                {groceryList.length} items
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {groceryList.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                  <ShoppingBasket size={40} className="text-emerald-400 mb-2" />
                  <p className="text-sm text-emerald-800 font-medium">
                    Basket is empty
                  </p>
                </div>
              ) : (
                groceryList.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-emerald-50/50 animate-in slide-in-from-bottom-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-8 bg-emerald-400 rounded-full" />
                      <div>
                        <p className="font-bold text-gray-800 text-sm">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">{item.quantity}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(idx)}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* GENERATE BUTTON */}
            <div className="p-4 bg-white border-t border-emerald-100">
              <button
                onClick={handleGenerateRecommendation}
                disabled={isGenerating || groceryList.length === 0}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] ${
                  isGenerating || groceryList.length === 0
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200"
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin" /> Calculating...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} /> Shop Smart Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
