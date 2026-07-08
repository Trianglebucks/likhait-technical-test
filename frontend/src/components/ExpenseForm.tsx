/**
 * Form component for adding/editing expenses
 */

import React, { useState, useEffect } from "react";
import { ExpenseFormData } from "../types";
import { TextField, SelectBox, Button, Modal } from "../vibes";
import { useExpenseForm } from "../hooks/useExpenseForm";
import { fetchCategories, createCategory } from "../services/api";

interface ExpenseFormProps {
  initialData?: Partial<ExpenseFormData>;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function ExpenseForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Add Expense",
}: ExpenseFormProps) {
  const { formData, errors, isSubmitting, handleChange, handleSubmit } =
    useExpenseForm({
      initialData,
      onSubmit,
    });

  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    }
    loadCategories();
  }, []);

  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      setCategoryError("Category name is required");
      return;
    }
    setIsSubmittingCategory(true);
    setCategoryError("");
    try {
      const newCat = await createCategory(newCategoryName.trim());
      setCategories((prev) =>
        [...prev, newCat].sort((a, b) => a.name.localeCompare(b.name))
      );
      handleChange("category", newCat.name);
      setIsCategoryModalOpen(false);
      setNewCategoryName("");
    } catch (err: any) {
      setCategoryError(err.message || "Failed to create category");
    } finally {
      setIsSubmittingCategory(false);
    }
  };

  const formStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  };

  const buttonGroupStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.5rem",
    marginTop: "0.5rem",
  };

  const categoryOptions = categories.map((category) => ({
    value: category.name,
    label: category.name,
  }));

  return (
    <>
      <form onSubmit={handleSubmit} style={formStyle}>
        <TextField
          label="Amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.amount}
          onChange={(e) => handleChange("amount", e.target.value)}
          error={errors.amount}
          fullWidth
          required
        />

        <TextField
          label="Description"
          type="text"
          placeholder="Enter description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          error={errors.description}
          fullWidth
          required
        />

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <SelectBox
              label="Category"
              options={categoryOptions}
              value={formData.category}
              onChange={(e) => handleChange("category", e.target.value)}
              error={errors.category}
              fullWidth
              required
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsCategoryModalOpen(true)}
            style={{ height: "42px", flexShrink: 0 }}
          >
            + New
          </Button>
        </div>

        <TextField
          label="Date"
          type="date"
          value={formData.date}
          onChange={(e) => handleChange("date", e.target.value)}
          error={errors.date}
          max={new Date().toISOString().split("T")[0]}
          fullWidth
          required
        />

        <div style={buttonGroupStyle}>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            fullWidth
          >
            {isSubmitting ? "Submitting..." : submitLabel}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>

      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setNewCategoryName("");
          setCategoryError("");
        }}
        title="Add New Category"
      >
        <form onSubmit={handleAddCategorySubmit} style={formStyle}>
          <TextField
            label="Category Name"
            type="text"
            placeholder="e.g. Subscriptions"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            error={categoryError}
            fullWidth
            required
            autoFocus
          />
          <div style={buttonGroupStyle}>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmittingCategory}
              fullWidth
            >
              {isSubmittingCategory ? "Adding..." : "Add Category"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsCategoryModalOpen(false);
                setNewCategoryName("");
                setCategoryError("");
              }}
              disabled={isSubmittingCategory}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
