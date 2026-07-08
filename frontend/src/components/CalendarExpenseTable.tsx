/**
 * Calendar expense table component
 */

import React, { useState, useMemo } from "react";
import { Expense, ExpenseFormData } from "../types";
import { formatCurrency, formatDate } from "../utils/expenseUtils";
import { getCategoryEmoji } from "../constants/categoryEmojis";
import { COLORS } from "../constants/colors";
import { Button, Modal, Pagination } from "../vibes";
import { ExpenseForm } from "./ExpenseForm.tsx";
import { deleteExpense, updateExpense } from "../services/api";

interface CalendarExpenseTableProps {
  expenses: Expense[];
  onExpenseUpdated: () => void;
}

const ITEMS_PER_PAGE = 10;

export function CalendarExpenseTable({
  expenses,
  onExpenseUpdated,
}: CalendarExpenseTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [sortColumn, setSortColumn] = useState<'date' | 'description' | 'category' | 'amount' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

  const handleSort = (column: 'date' | 'description' | 'category' | 'amount') => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const sortedExpenses = useMemo(() => {
    if (!sortColumn || !sortDirection) {
      return expenses;
    }

    return [...expenses].sort((a, b) => {
      let comparison = 0;

      if (sortColumn === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortColumn === 'amount') {
        comparison = Number(a.amount) - Number(b.amount);
      } else if (sortColumn === 'description') {
        comparison = a.description.localeCompare(b.description);
      } else if (sortColumn === 'category') {
        comparison = a.category.localeCompare(b.category);
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [expenses, sortColumn, sortDirection]);

  const totalPages = Math.ceil(sortedExpenses.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentExpenses = sortedExpenses.slice(startIndex, endIndex);

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsEditModalOpen(true);
  };

  const handleDelete = (expense: Expense) => {
    setDeletingExpense(expense);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingExpense) return;
    try {
      await deleteExpense(deletingExpense.id);
      setIsDeleteModalOpen(false);
      setDeletingExpense(null);
      onExpenseUpdated();
    } catch (error) {
      console.error("Failed to delete expense:", error);
      alert("Failed to delete expense");
    }
  };

  const handleUpdate = async (data: ExpenseFormData) => {
    if (!editingExpense) return;
    try {
      await updateExpense(editingExpense.id, data);
      setIsEditModalOpen(false);
      setEditingExpense(null);
      onExpenseUpdated();
    } catch (error) {
      console.error("Failed to update expense:", error);
      throw error;
    }
  };

  const tableStyle: React.CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: COLORS.background.main,
    borderRadius: "0.5rem",
    overflow: "hidden",
    border: `1px solid ${COLORS.border}`,
  };

  const theadStyle: React.CSSProperties = {
    backgroundColor: COLORS.background.card,
  };

  const thStyle: React.CSSProperties = {
    padding: "0.75rem",
    textAlign: "left",
    fontWeight: 600,
    color: COLORS.text.primary,
    borderBottom: `2px solid ${COLORS.border}`,
  };

  const getHeaderStyle = (column: 'date' | 'description' | 'category' | 'amount'): React.CSSProperties => {
    return {
      ...thStyle,
      cursor: "pointer",
      userSelect: "none",
      backgroundColor: sortColumn === column ? COLORS.secondary.s02 : undefined,
      transition: "background-color 0.2s",
    };
  };

  const renderSortIndicator = (column: 'date' | 'description' | 'category' | 'amount') => {
    if (sortColumn !== column) {
      return <span style={{ color: COLORS.text.secondary, marginLeft: "0.25rem" }}>⇅</span>;
    }
    return sortDirection === 'asc' ? ' ▲' : ' ▼';
  };

  const tdStyle: React.CSSProperties = {
    padding: "0.75rem",
    borderBottom: `1px solid ${COLORS.border}`,
    color: COLORS.text.primary,
  };

  const emptyStyle: React.CSSProperties = {
    padding: "2rem",
    textAlign: "center",
    color: COLORS.text.secondary,
  };

  const actionButtonsStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.5rem",
  };

  if (expenses.length === 0) {
    return (
      <div style={tableStyle}>
        <div style={emptyStyle}>
          No expenses found. Add your first expense to get started!
        </div>
      </div>
    );
  }

  return (
    <>
      <table style={tableStyle}>
        <thead style={theadStyle}>
          <tr>
            <th style={getHeaderStyle('date')} onClick={() => handleSort('date')}>
              Date{renderSortIndicator('date')}
            </th>
            <th style={getHeaderStyle('description')} onClick={() => handleSort('description')}>
              Description{renderSortIndicator('description')}
            </th>
            <th style={getHeaderStyle('category')} onClick={() => handleSort('category')}>
              Category{renderSortIndicator('category')}
            </th>
            <th style={getHeaderStyle('amount')} onClick={() => handleSort('amount')}>
              Amount{renderSortIndicator('amount')}
            </th>
            <th style={{ ...thStyle, textAlign: "center" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentExpenses.map((expense) => (
            <tr key={expense.id}>
              <td style={tdStyle}>{formatDate(new Date(expense.date))}</td>
              <td style={tdStyle}>{expense.description}</td>
              <td style={tdStyle}>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span>{getCategoryEmoji(expense.category)}</span>
                  <span>{expense.category}</span>
                </span>
              </td>
              <td style={{ ...tdStyle, textAlign: "left", fontWeight: 600 }}>
                {formatCurrency(expense.amount)}
              </td>
              <td style={{ ...tdStyle, textAlign: "center" }}>
                <div style={actionButtonsStyle}>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => handleEdit(expense)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="small"
                    onClick={() => handleDelete(expense)}
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingExpense(null);
        }}
        title="Edit Expense"
      >
        {editingExpense && (
          <ExpenseForm
            initialData={{
              amount: editingExpense.amount.toString(),
              description: editingExpense.description,
              category: editingExpense.category,
              date: formatDate(new Date(editingExpense.date)),
            }}
            onSubmit={handleUpdate}
            onCancel={() => {
              setIsEditModalOpen(false);
              setEditingExpense(null);
            }}
            submitLabel="Update Expense"
          />
        )}
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingExpense(null);
        }}
        title="Delete Expense"
      >
        <div style={{ padding: "1rem 0" }}>
          <p style={{ marginBottom: "1.5rem", color: COLORS.text.primary }}>
            Are you sure you want to delete this expense?
          </p>
          {deletingExpense && (
            <p style={{ marginBottom: "1.5rem", color: COLORS.text.secondary }}>
              <strong>{deletingExpense.description}</strong> -{" "}
              {formatCurrency(deletingExpense.amount)}
            </p>
          )}
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="secondary"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeletingExpense(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
