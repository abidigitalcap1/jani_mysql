import React, { useState, useEffect, useCallback } from 'react';
import { Expense } from '../types';

const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [category, setCategory] = useState('Ingredients');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api.php?action=getExpenses');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setExpenses(data);
    } catch (err: any) {
      console.error('Error fetching expenses:', err.message);
      setError('Failed to fetch expenses.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || amount === '' || !expenseDate) {
      setError('Please fill out all required fields.');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
        const response = await fetch('/api.php?action=addExpense', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description, amount, category, expense_date: expenseDate })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        setSuccess('Expense added successfully!');
        setDescription('');
        setAmount('');
        setCategory('Ingredients');
        setExpenseDate(new Date().toISOString().split('T')[0]);
        fetchExpenses(); // Refresh the list
    } catch(err: any) {
        setError(`Failed to add expense: ${err.message}`);
    } finally {
        setLoading(false);
    }
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Add Expense Form */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-slate-700 mb-4 border-b pb-3">Add Expense</h2>
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-2">
              <label htmlFor="description" className="block text-lg font-medium text-slate-600">Description</label>
              <input
                id="description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full p-3 text-lg border-gray-300 rounded-md shadow-sm bg-slate-50"
                placeholder="e.g., Chicken, Oil, etc."
              />
            </div>
            <div>
              <label htmlFor="amount" className="block text-lg font-medium text-slate-600">Amount (PKR)</label>
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className="mt-1 block w-full p-3 text-lg border-gray-300 rounded-md shadow-sm bg-slate-50"
                placeholder="2000"
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-lg font-medium text-slate-600">Category</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 block w-full p-3 text-lg border-gray-300 rounded-md shadow-sm bg-slate-50"
              >
                <option>Ingredients</option>
                <option>Utilities</option>
                <option>Salary</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="date" className="block text-lg font-medium text-slate-600">Date</label>
              <input
                id="date"
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="mt-1 block w-full p-3 text-lg border-gray-300 rounded-md shadow-sm bg-slate-50"
              />
            </div>
          </div>
          <div className="text-right">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-400"
            >
              {loading ? 'Adding...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>

      {/* Expense History Table */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-slate-700 mb-4">Expense History</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-slate-50">
              <tr>
                <th className="py-3 px-4 text-left font-semibold text-slate-600">Date</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-600">Description</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-600">Category</th>
                <th className="py-3 px-4 text-right font-semibold text-slate-600">Amount</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="text-center py-4">Loading...</td></tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense.expense_id} className="border-b hover:bg-slate-50">
                    <td className="py-3 px-4">{new Date(expense.expense_date).toLocaleDateString()}</td>
                    <td className="py-3 px-4">{expense.description}</td>
                    <td className="py-3 px-4">{expense.category}</td>
                    <td className="py-3 px-4 text-right font-medium">PKR {Number(expense.amount).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
             <tfoot className="bg-slate-100 font-bold">
                <tr>
                    <td colSpan={3} className="py-3 px-4 text-right">Total Expenses:</td>
                    <td className="py-3 px-4 text-right">PKR {totalExpenses.toLocaleString()}</td>
                </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Expenses;