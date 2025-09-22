import React, { useState, useEffect, useCallback } from 'react';
import { Customer, OrderWithCustomer, OrderItemWithMenuItem, CustomerHistoryEntry } from '../types';

const CustomerHistory: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerHistoryEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<OrderWithCustomer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [orderItems, setOrderItems] = useState<Record<number, OrderItemWithMenuItem[]>>({});

  const fetchCustomerHistory = useCallback(async () => {
    setLoading(true);
    try {
        const response = await fetch(`/api.php?action=getCustomerHistory&search=${encodeURIComponent(searchTerm)}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setCustomers(data);
    } catch (err: any) {
        console.error('Error fetching customer history:', err.message);
    } finally {
        setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCustomerHistory();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchCustomerHistory]);
  
  const fetchCustomerOrders = async (customerId: number) => {
      try {
          const response = await fetch(`/api.php?action=getCustomerOrders&customerId=${customerId}`);
          const data = await response.json();
          if (!response.ok) throw new Error(data.error);
          setCustomerOrders(data);
      } catch (err: any) {
          console.error('Error fetching customer orders:', err.message);
      }
  };
  
  const handleViewOrders = (customer: CustomerHistoryEntry) => {
      setSelectedCustomer(customer);
      fetchCustomerOrders(customer.customer_id);
      setIsModalOpen(true);
  };
  
  const toggleOrderDetails = (orderId: number) => {
    const isCurrentlyExpanded = expandedOrderId === orderId;
    setExpandedOrderId(isCurrentlyExpanded ? null : orderId);
    
    if (!isCurrentlyExpanded && !orderItems[orderId]) {
        fetchOrderItems(orderId);
    }
  };

  const fetchOrderItems = async (orderId: number) => {
    try {
        const response = await fetch(`/api.php?action=getOrderItems&orderId=${orderId}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setOrderItems(prev => ({ ...prev, [orderId]: data }));
    } catch (err: any) {
        console.error('Error fetching order items:', err.message);
        setOrderItems(prev => ({ ...prev, [orderId]: [] }));
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-slate-700 mb-4">Customer History</h2>
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 p-3 mb-4 text-lg border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
        />
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-slate-50">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-slate-600 uppercase tracking-wider">Name</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-slate-600 uppercase tracking-wider">Phone</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-slate-600 uppercase tracking-wider">Total Orders</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-slate-600 uppercase tracking-wider">Total Spent</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-slate-600 uppercase tracking-wider">Total Pending</th>
                 <th className="py-3 px-4 text-left text-sm font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-4">Loading...</td></tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.customer_id} className="border-b border-gray-200 hover:bg-slate-50">
                    <td className="py-3 px-4">{customer.name}</td>
                    <td className="py-3 px-4">{customer.phone}</td>
                    <td className="py-3 px-4">{customer.total_orders}</td>
                    <td className="py-3 px-4">PKR {Number(customer.total_spent).toLocaleString()}</td>
                    <td className="py-3 px-4 text-red-600 font-medium">PKR {Number(customer.total_pending).toLocaleString()}</td>
                    <td className="py-3 px-4">
                        <button onClick={() => handleViewOrders(customer)} className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600">View Orders</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {isModalOpen && selectedCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                  <div className="p-4 border-b">
                      <h3 className="text-xl font-bold text-slate-800">Order History for {selectedCustomer.name}</h3>
                  </div>
                  <div className="p-4 overflow-y-auto">
                      {customerOrders.length > 0 ? (
                           <table className="min-w-full">
                               <thead className="bg-slate-50">
                                   <tr>
                                       <th className="py-2 px-3 text-left">Order ID</th>
                                       <th className="py-2 px-3 text-left">Date</th>
                                       <th className="py-2 px-3 text-left">Total</th>
                                       <th className="py-2 px-3 text-left">Pending</th>
                                       <th className="py-2 px-3 text-left">Status</th>
                                   </tr>
                               </thead>
                               <tbody>
                                   {customerOrders.map(order => (
                                       <React.Fragment key={order.order_id}>
                                           <tr className="border-b cursor-pointer hover:bg-slate-100" onClick={() => toggleOrderDetails(order.order_id)}>
                                                <td className="py-2 px-3 font-medium">#{order.order_id}</td>
                                                <td className="py-2 px-3">{new Date(order.delivery_date).toLocaleDateString()}</td>
                                                <td className="py-2 px-3">PKR {Number(order.total_amount).toLocaleString()}</td>
                                                <td className="py-2 px-3 font-semibold text-red-500">PKR {Number(order.remaining_amount).toLocaleString()}</td>
                                                <td className="py-2 px-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${order.status === 'Fulfilled' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{order.status}</span></td>
                                           </tr>
                                           {expandedOrderId === order.order_id && (
                                               <tr>
                                                   <td colSpan={5} className="p-4 bg-slate-50">
                                                        <h4 className="font-bold mb-2 text-slate-600">Order Details:</h4>
                                                        {orderItems[order.order_id] ? (
                                                            orderItems[order.order_id].length > 0 ? (
                                                                <div className="overflow-x-auto">
                                                                    <table className="min-w-full text-sm mb-4">
                                                                        <thead className="bg-slate-200">
                                                                            <tr>
                                                                                <th className="py-2 px-3 text-left font-semibold text-slate-700">Item</th>
                                                                                <th className="py-2 px-3 text-center font-semibold text-slate-700">Quantity</th>
                                                                                <th className="py-2 px-3 text-right font-semibold text-slate-700">Unit Price</th>
                                                                                <th className="py-2 px-3 text-right font-semibold text-slate-700">Subtotal</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {orderItems[order.order_id].map(item => (
                                                                                <tr key={item.order_item_id} className="border-b border-slate-200">
                                                                                    <td className="py-2 px-3">{item.menu_item_name || item.custom_item_name}</td>
                                                                                    <td className="py-2 px-3 text-center">{item.quantity}</td>
                                                                                    <td className="py-2 px-3 text-right">PKR {Number(item.unit_price).toLocaleString()}</td>
                                                                                    <td className="py-2 px-3 text-right font-medium">PKR {(item.quantity * Number(item.unit_price)).toLocaleString()}</td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            ) : <p>No items found for this order.</p>
                                                        ) : <p>Loading items...</p>}
                                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                            <div>
                                                                <strong className="text-slate-600">Delivery Address:</strong>
                                                                <p className="text-slate-800 whitespace-pre-wrap">{order.delivery_address || 'N/A'}</p>
                                                            </div>
                                                            <div>
                                                                <strong className="text-slate-600">Notes:</strong>
                                                                <p className="text-slate-800 whitespace-pre-wrap">{order.notes || 'No notes provided.'}</p>
                                                            </div>
                                                        </div>
                                                   </td>
                                               </tr>
                                           )}
                                       </React.Fragment>
                                   ))}
                               </tbody>
                           </table>
                      ) : (
                          <p>No orders found for this customer.</p>
                      )}
                  </div>
                  <div className="p-4 border-t text-right">
                       <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700">Close</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default CustomerHistory;