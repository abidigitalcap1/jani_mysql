import React, { useState, useEffect, useCallback } from 'react';
import { OrderWithCustomer, Payment } from '../types';

const Income: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [orders, setOrders] = useState<OrderWithCustomer[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<OrderWithCustomer | null>(null);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [newPaymentAmount, setNewPaymentAmount] = useState<number | ''>('');
    const [paymentNotes, setPaymentNotes] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const fetchOrders = useCallback(async (search: string) => {
        if (search.length < 1) {
            setOrders([]);
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`/api.php?action=getPendingOrders&search=${encodeURIComponent(search)}`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            setOrders(data);
        } catch (err: any) {
            console.error('Error fetching orders:', err.message);
            setError('Failed to fetch orders.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchOrders(searchTerm);
        }, 300);
        return () => clearTimeout(debounce);
    }, [searchTerm, fetchOrders]);
    
    const fetchPayments = async (orderId: number) => {
        try {
            const response = await fetch(`/api.php?action=getOrderPayments&orderId=${orderId}`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            setPayments(data);
        } catch (err: any) {
            console.error('Error fetching payments:', err.message);
        }
    };

    const handleSelectOrder = (order: OrderWithCustomer) => {
        setSelectedOrder(order);
        setSearchTerm('');
        setOrders([]);
        fetchPayments(order.order_id);
    };

    const handleAddPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrder || newPaymentAmount === '' || newPaymentAmount <= 0) {
            setError("Please enter a valid payment amount.");
            return;
        }

        const paymentAmount = Number(newPaymentAmount);
        
        const remainingAmount = Number(selectedOrder.remaining_amount);
        if (paymentAmount > remainingAmount) {
            setError(`Payment cannot exceed the remaining balance of PKR ${remainingAmount}.`);
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch('/api.php?action=addPayment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    order_id: selectedOrder.order_id,
                    amount: paymentAmount,
                    notes: paymentNotes
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            setSuccess(`Payment of PKR ${paymentAmount} added successfully!`);
            setSelectedOrder(data.updatedOrder);
            setNewPaymentAmount('');
            setPaymentNotes('');
            fetchPayments(selectedOrder.order_id);
        } catch (err: any) {
            setError(`Failed to add payment: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-slate-700 mb-4">Manage Income & Payments</h2>
                <div className="space-y-2 relative">
                    <label className="text-lg font-medium text-slate-600">Search Pending Orders</label>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Enter Order ID or Customer Name..."
                        className="w-full p-3 text-lg border-gray-300 rounded-md shadow-sm bg-slate-50"
                    />
                    {searchTerm && orders.length > 0 && (
                        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-60 overflow-auto">
                            {orders.map(order => (
                                <li key={order.order_id} onClick={() => handleSelectOrder(order)} className="p-3 hover:bg-indigo-100 cursor-pointer">
                                    #{order.order_id} - {order.customer_name || 'Unknown Customer'} (Pending: PKR {Number(order.remaining_amount).toLocaleString()})
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {selectedOrder && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">Payment for Order #{selectedOrder.order_id}</h3>
                    {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
                    {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}
                    
                    <div className="grid grid-cols-3 gap-4 text-center mb-6">
                        <div>
                            <p className="text-lg text-slate-500">Total Amount</p>
                            <p className="text-2xl font-bold text-slate-800">PKR {Number(selectedOrder.total_amount).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-lg text-slate-500">Amount Paid</p>
                            <p className="text-2xl font-bold text-green-600">PKR {Number(selectedOrder.advance_payment).toLocaleString()}</p>
                        </div>
                         <div>
                            <p className="text-lg text-slate-500">Remaining Balance</p>
                            <p className="text-2xl font-bold text-red-600">PKR {Number(selectedOrder.remaining_amount).toLocaleString()}</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Payment History */}
                        <div className="border-t pt-4">
                            <h4 className="text-lg font-semibold text-slate-700 mb-2">Payment History</h4>
                            {payments.length > 0 ? (
                                <ul className="space-y-2 max-h-48 overflow-y-auto">
                                    {payments.map(p => (
                                        <li key={p.payment_id} className="p-2 bg-slate-50 rounded">
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium">PKR {Number(p.amount).toLocaleString()}</span>
                                                <span className="text-sm text-slate-500">{new Date(p.payment_date).toLocaleString()}</span>
                                            </div>
                                            {p.notes && <p className="text-sm text-slate-600 mt-1 pl-1"><em>Note: {p.notes}</em></p>}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-slate-500">No payments recorded yet.</p>
                            )}
                        </div>

                        {/* Add Payment Form */}
                        {selectedOrder.status !== 'Fulfilled' && (
                             <form onSubmit={handleAddPayment} className="space-y-4 border-t pt-4">
                                <h4 className="text-lg font-semibold text-slate-700 mb-2">Add New Payment</h4>
                                <div>
                                    <label className="block text-lg font-medium text-slate-600">New Payment Amount</label>
                                    <input
                                        type="number"
                                        value={newPaymentAmount}
                                        onChange={e => setNewPaymentAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                                        placeholder="Enter amount"
                                        max={Number(selectedOrder.remaining_amount)}
                                        step="0.01"
                                        className="w-full p-3 text-lg border-gray-300 rounded-md shadow-sm bg-slate-50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-lg font-medium text-slate-600">Notes (optional)</label>
                                    <textarea
                                        value={paymentNotes}
                                        onChange={e => setPaymentNotes(e.target.value)}
                                        rows={2}
                                        placeholder="e.g., Paid by cash"
                                        className="w-full p-3 text-lg border-gray-300 rounded-md shadow-sm bg-slate-50"
                                    ></textarea>
                                </div>
                                <button type="submit" disabled={loading} className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-400">
                                    {loading ? 'Adding...' : 'Add Payment'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Income;