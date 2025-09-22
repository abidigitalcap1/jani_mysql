import React, { useState, useEffect, useCallback } from 'react';
import { Customer, MenuItem, OrderItemForm } from '../types';

const NewOrder: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddingNewCustomer, setIsAddingNewCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '' });
  const [orderItems, setOrderItems] = useState<OrderItemForm[]>([{ item_id: null, custom_item_name: '', quantity: 1, unit_price: 0 }]);
  
  const [orderType, setOrderType] = useState<'Online' | 'Local'>('Local');
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliveryTime, setDeliveryTime] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [advancePayment, setAdvancePayment] = useState(0);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMenuItems();
  }, []);
  
  const fetchCustomers = useCallback(async (search: string) => {
    if (search.length < 2) {
      setCustomers([]);
      return;
    }
    try {
        const response = await fetch(`/api.php?action=getCustomers&search=${encodeURIComponent(search)}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setCustomers(data);
    } catch (err: any) {
        console.error('Error fetching customers:', err.message);
    }
  }, []);

  const fetchMenuItems = async () => {
    try {
        const response = await fetch('/api.php?action=getMenuItems');
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setMenuItems(data);
    } catch (err: any) {
        console.error('Error fetching menu items:', err.message);
    }
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    setSelectedCustomer(null);
    fetchCustomers(term);
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setSearchTerm(customer.name);
    setCustomers([]);
    setDeliveryAddress(customer.address || '');
  };
  
  const handleItemChange = (index: number, field: keyof OrderItemForm, value: any) => {
    const newItems = [...orderItems];
    const currentItem = { ...newItems[index], [field]: value };
  
    if (field === 'item_id') {
      if (value === 'custom') {
        currentItem.custom_item_name = '';
        currentItem.unit_price = 0;
      } else {
        const selectedMenuItem = menuItems.find(mi => mi.item_id === parseInt(value));
        if (selectedMenuItem) {
          currentItem.custom_item_name = '';
          currentItem.unit_price = selectedMenuItem.price;
        }
      }
    }
    
    newItems[index] = currentItem;
    setOrderItems(newItems);
  };

  const addItemRow = () => {
    setOrderItems([...orderItems, { item_id: null, custom_item_name: '', quantity: 1, unit_price: 0 }]);
  };

  const removeItemRow = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const totalAmount = orderItems.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0);
  const remainingAmount = totalAmount - advancePayment;

  const resetForm = useCallback(() => {
    setSearchTerm('');
    setSelectedCustomer(null);
    setIsAddingNewCustomer(false);
    setNewCustomer({ name: '', phone: '' });
    setOrderItems([{ item_id: null, custom_item_name: '', quantity: 1, unit_price: 0 }]);
    setOrderType('Local');
    setDeliveryDate(new Date().toISOString().split('T')[0]);
    setDeliveryTime('');
    setDeliveryAddress('');
    setNotes('');
    setAdvancePayment(0);
    setError(null);
    setSuccess(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!selectedCustomer && !isAddingNewCustomer) {
      setError("Please select or add a customer.");
      setLoading(false);
      return;
    }

    if (isAddingNewCustomer && (!newCustomer.name || !newCustomer.phone)) {
        setError("New customer name and phone are required.");
        setLoading(false);
        return;
    }
    
    if (advancePayment > totalAmount) {
        setError("Advance payment cannot exceed the total amount.");
        setLoading(false);
        return;
    }

    const payload = {
        isAddingNewCustomer,
        newCustomer: isAddingNewCustomer ? newCustomer : null,
        customerId: selectedCustomer?.customer_id,
        order: {
            order_type: orderType,
            delivery_date: deliveryDate,
            delivery_time: deliveryTime || null,
            total_amount: totalAmount,
            advance_payment: advancePayment,
            delivery_address: deliveryAddress,
            notes: notes,
            status: advancePayment >= totalAmount ? 'Fulfilled' : advancePayment > 0 ? 'Partially_Paid' : 'Pending'
        },
        items: orderItems
            .filter(item => (item.item_id || item.custom_item_name) && item.quantity > 0 && item.unit_price >= 0)
            .map(item => ({
                item_id: item.item_id && item.item_id.toString() !== 'custom' ? item.item_id : null,
                custom_item_name: item.item_id?.toString() === 'custom' ? item.custom_item_name : null,
                quantity: item.quantity,
                unit_price: item.unit_price,
            })),
    };

    try {
        const response = await fetch('/api.php?action=createOrder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to create order');

        setSuccess(`Order #${data.orderId} created successfully!`);
    } catch (err: any) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  const handleStartNewOrder = () => {
      resetForm();
  };


  return (
    <div className="p-4 md:p-8">
        {success ? (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded text-center" role="alert">
                <p className="font-bold">{success}</p>
                <div className="mt-4 flex justify-center gap-4">
                    <button 
                        onClick={handleStartNewOrder}
                        className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700"
                    >
                        Create Another Order
                    </button>
                </div>
              </div>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-slate-700 mb-4 border-b pb-3">Create New Order</h2>
                    {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
                    
                    {/* Customer Details */}
                    <div className="border-b pb-6">
                        <h3 className="text-xl font-semibold text-slate-600 mb-4">Customer Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-lg font-medium text-slate-600">Search Existing Customer</label>
                            <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            placeholder="Search by name or phone..."
                            className="w-full p-3 text-lg border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
                            disabled={isAddingNewCustomer}
                            />
                            {searchTerm && !selectedCustomer && customers.length > 0 && (
                            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-60 overflow-auto">
                                {customers.map(c => (
                                <li key={c.customer_id} onClick={() => handleSelectCustomer(c)} className="p-3 hover:bg-indigo-100 cursor-pointer">
                                    {c.name} - {c.phone}
                                </li>
                                ))}
                            </ul>
                            )}
                        </div>
                        <div className="flex items-center">
                            <input type="checkbox" id="add-new-customer" checked={isAddingNewCustomer} onChange={(e) => { setIsAddingNewCustomer(e.target.checked); setSelectedCustomer(null); setSearchTerm(''); }} className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                            <label htmlFor="add-new-customer" className="ml-2 text-lg text-slate-700">Add New Customer</label>
                        </div>
                        </div>
                        {isAddingNewCustomer && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <div>
                                <label className="text-lg font-medium text-slate-600">Name</label>
                                <input type="text" value={newCustomer.name} onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})} className="w-full p-3 text-lg border-gray-300 rounded-md shadow-sm bg-slate-50" required />
                            </div>
                            <div>
                                <label className="text-lg font-medium text-slate-600">Phone</label>
                                <input type="text" value={newCustomer.phone} onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})} className="w-full p-3 text-lg border-gray-300 rounded-md shadow-sm bg-slate-50" required />
                            </div>
                        </div>
                        )}
                    </div>

                    {/* Order Details */}
                    <div className="border-b pb-6 pt-4">
                        <h3 className="text-xl font-semibold text-slate-600 mb-4">Order Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="text-lg font-medium text-slate-600">Order Type</label>
                                <select value={orderType} onChange={(e) => setOrderType(e.target.value as 'Online' | 'Local')} className="w-full p-3 text-lg border-gray-300 rounded-md shadow-sm bg-slate-50">
                                    <option value="Local">Local</option>
                                    <option value="Online">Online</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-lg font-medium text-slate-600">Delivery Date</label>
                                <input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} className="w-full p-3 text-lg border-gray-300 rounded-md shadow-sm bg-slate-50" />
                            </div>
                            <div>
                                <label className="text-lg font-medium text-slate-600">Delivery Time</label>
                                <input type="time" value={deliveryTime} onChange={e => setDeliveryTime(e.target.value)} className="w-full p-3 text-lg border-gray-300 rounded-md shadow-sm bg-slate-50" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="text-lg font-medium text-slate-600">Delivery Address</label>
                            <textarea value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} rows={2} className="w-full p-3 text-lg border-gray-300 rounded-md shadow-sm bg-slate-50"></textarea>
                        </div>
                        <div className="mt-4">
                            <label className="text-lg font-medium text-slate-600">Notes (optional)</label>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full p-3 text-lg border-gray-300 rounded-md shadow-sm bg-slate-50"></textarea>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="pt-4">
                        <h3 className="text-xl font-semibold text-slate-600 mb-4">Items</h3>
                        {orderItems.map((item, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-10 gap-4 mb-4 items-center">
                                <div className="md:col-span-4">
                                    <label className="text-md font-medium text-slate-600">Item</label>
                                    <select value={item.item_id || ''} onChange={e => handleItemChange(index, 'item_id', e.target.value)} className="w-full p-3 text-lg border-gray-300 rounded-md shadow-sm bg-slate-50">
                                        <option value="">Select Item</option>
                                        {menuItems.map(mi => <option key={mi.item_id} value={mi.item_id}>{mi.name}</option>)}
                                        <option value="custom">Custom Item</option>
                                    </select>
                                </div>
                                {item.item_id?.toString() === 'custom' && (
                                    <div className="md:col-span-2">
                                        <label className="text-md font-medium text-slate-600">Custom Name</label>
                                        <input type="text" value={item.custom_item_name} onChange={e => handleItemChange(index, 'custom_item_name', e.target.value)} className="w-full p-3 text-lg border-gray-300 rounded-md shadow-sm bg-slate-50" />
                                    </div>
                                )}
                                <div className="md:col-span-2">
                                    <label className="text-md font-medium text-slate-600">Quantity</label>
                                    <input type="number" value={item.quantity} min="1" onChange={e => handleItemChange(index, 'quantity', parseInt(e.target.value))} className="w-full p-3 text-lg border-gray-300 rounded-md shadow-sm bg-slate-50" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-md font-medium text-slate-600">Unit Price</label>
                                    <input type="number" value={item.unit_price} min="0" step="0.01" onChange={e => handleItemChange(index, 'unit_price', parseFloat(e.target.value))} className="w-full p-3 text-lg border-gray-300 rounded-md shadow-sm bg-slate-50" />
                                </div>
                                <div className="md:col-span-2 self-end">
                                    <button type="button" onClick={() => removeItemRow(index)} className="px-4 py-3 bg-red-500 text-white rounded-md hover:bg-red-600">Remove</button>
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={addItemRow} className="mt-2 px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600">Add Item</button>
                    </div>

                </div>

                {/* Payment and Submission */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-slate-600 mb-4">Payment</h3>
                    <div className="flex justify-end items-center mb-6 space-x-4">
                        <span className="text-2xl font-bold text-slate-700">Total Amount:</span>
                        <span className="text-2xl font-bold text-indigo-600">PKR {totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-end items-center mb-6 space-x-4">
                        <label className="text-xl font-medium text-slate-600">Advance:</label>
                        <input type="number" value={advancePayment} min="0" onChange={e => setAdvancePayment(parseFloat(e.target.value) || 0)} className="w-48 p-3 text-lg text-right border-gray-300 rounded-md shadow-sm bg-slate-50" />
                    </div>
                    <div className="flex justify-end items-center mb-6 space-x-4">
                        <span className="text-2xl font-bold text-slate-700">Remaining:</span>
                        <span className="text-2xl font-bold text-red-600">PKR {remainingAmount.toLocaleString()}</span>
                    </div>
                    {error && <div className="text-red-500 text-center mb-4">{error}</div>}
                    <button type="submit" disabled={loading} className="w-full py-4 px-6 bg-indigo-600 text-white font-bold text-xl rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition-all">
                        {loading ? 'Creating Order...' : 'Create Order'}
                    </button>
                </div>
            </form>
        )}
    </div>
  );
};

export default NewOrder;