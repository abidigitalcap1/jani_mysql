import React, { useState, useEffect, useCallback } from 'react';
import { SupplyParty, PartyPayment, Party, LedgerEntry } from '../types';

// Modal for adding a new supply bill for either a new or existing party
const AddSupplyModal = ({ partyNames, onClose, onSave, loading }: { partyNames: string[], onClose: () => void, onSave: (party: any) => void, loading: boolean }) => {
    const [partyName, setPartyName] = useState('');
    const [supplyDate, setSupplyDate] = useState(new Date().toISOString().split('T')[0]);
    const [totalAmount, setTotalAmount] = useState<number | ''>('');
    const [details, setDetails] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ party_name: partyName, supply_date: supplyDate, total_amount: totalAmount, details });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-2xl font-bold text-slate-800 mb-4">Add Supply Bill</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-lg font-medium text-slate-600">Party Name</label>
                        <input 
                            type="text" 
                            list="party-names"
                            value={partyName} 
                            onChange={e => setPartyName(e.target.value)} 
                            className="w-full p-3 text-lg border-gray-300 rounded-md shadow-sm bg-slate-50" 
                            placeholder="Type or select an existing party"
                            required 
                        />
                         <datalist id="party-names">
                            {partyNames.map(name => <option key={name} value={name} />)}
                        </datalist>
                    </div>
                     <div>
                        <label className="block text-lg font-medium text-slate-600">Supply Date</label>
                        <input type="date" value={supplyDate} onChange={e => setSupplyDate(e.target.value)} className="w-full p-3 text-lg border-gray-300 rounded-md shadow-sm bg-slate-50" required />
                    </div>
                     <div>
                        <label className="block text-lg font-medium text-slate-600">Total Amount</label>
                        <input type="number" value={totalAmount} onChange={e => setTotalAmount(e.target.value === '' ? '' : parseFloat(e.target.value))} className="w-full p-3 text-lg border-gray-300 rounded-md shadow-sm bg-slate-50" required />
                    </div>
                     <div>
                        <label className="block text-lg font-medium text-slate-600">Details (optional)</label>
                        <textarea value={details} onChange={e => setDetails(e.target.value)} rows={3} className="w-full p-3 text-lg border-gray-300 rounded-md shadow-sm bg-slate-50" placeholder="e.g., Invoice #123, 10kg Chicken"></textarea>
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-300 rounded-md hover:bg-slate-400">Cancel</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">{loading ? 'Saving...' : 'Add Bill'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const SupplyParties: React.FC = () => {
    const [parties, setParties] = useState<SupplyParty[]>([]);
    const [partyNames, setPartyNames] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedParty, setSelectedParty] = useState<SupplyParty | null>(null);
    const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
    const [newTransactionAmount, setNewTransactionAmount] = useState<number | ''>('');
    const [transactionNote, setTransactionNote] = useState('');
    const [transactionType, setTransactionType] = useState<'Payment' | 'Charge'>('Payment');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const fetchPartiesAndNames = useCallback(async () => {
        setLoading(true);
        try {
            const [partiesRes, namesRes] = await Promise.all([
                fetch('/api.php?action=getSupplyParties'),
                fetch('/api.php?action=getPartyNames'),
            ]);
            const partiesData = await partiesRes.json();
            const namesData = await namesRes.json();

            if (!partiesRes.ok) throw new Error(partiesData.error || 'Failed to fetch parties');
            if (!namesRes.ok) throw new Error(namesData.error || 'Failed to fetch names');
            
            setParties(partiesData);
            setPartyNames(namesData);

        } catch (err: any) {
            console.error('Error fetching supply party data:', err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPartiesAndNames();
    }, [fetchPartiesAndNames]);

    const handleSaveSupplyBill = async (party: any) => {
        setLoading(true);
        try {
            const response = await fetch('/api.php?action=addSupplyBill', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(party)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            setIsModalOpen(false);
            fetchPartiesAndNames();
        } catch (err: any) {
            console.error('Error saving party:', err.message);
        } finally {
            setLoading(false);
        }
    };
    
    const openPaymentModal = async (party: SupplyParty) => {
        setSelectedParty(party);
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch(`/api.php?action=getPartyLedger&partyName=${encodeURIComponent(party.party_name)}`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            const { supplies, payments } = data;

            const combinedTransactions: any[] = [
                ...supplies.map((s: Party) => ({ type: 'debit', date: s.supply_date, data: s })),
                ...payments.map((p: PartyPayment) => ({ type: 'credit', date: p.payment_date, data: p }))
            ];
            
            combinedTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

            let balance = 0;
            const entries: LedgerEntry[] = combinedTransactions.map(item => {
                if (item.type === 'debit') {
                    balance += Number(item.data.total_amount);
                    return {
                        date: item.data.supply_date,
                        description: `Supply #${item.data.id} - ${item.data.details || 'Goods/Services'}`,
                        debit: Number(item.data.total_amount),
                        credit: 0,
                        balance: balance,
                    };
                } else { // credit
                    const payment = item.data;
                    balance -= Number(payment.amount_paid);
                    return {
                        date: payment.payment_date,
                        description: `Payment - ${payment.note || `Towards Invoice #${payment.party_id}`}`,
                        debit: 0,
                        credit: Number(payment.amount_paid),
                        balance: balance,
                    };
                }
            });
            
            setLedgerEntries(entries);
            setIsPaymentModalOpen(true);
        } catch (err: any) {
            console.error('Error fetching ledger:', err.message);
        } finally {
            setLoading(false);
        }
    };


    const handleAddTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedParty || newTransactionAmount === '' || Number(newTransactionAmount) <= 0) {
            setError('Please enter a valid positive amount.');
            return;
        }
    
        const transactionAmount = Number(newTransactionAmount);
        
        setLoading(true);
        setError(null);
        setSuccess(null);
    
        try {
            const payload = {
                type: transactionType,
                party_name: selectedParty.party_name,
                party_id: selectedParty.id,
                amount: transactionAmount,
                note: transactionNote
            };
            
            const response = await fetch('/api.php?action=addPartyTransaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            setSuccess('Transaction added successfully!');
            setNewTransactionAmount('');
            setTransactionNote('');
            setTransactionType('Payment');
            
            // Refresh data
            const partiesRes = await fetch('/api.php?action=getSupplyParties');
            const refreshedParties = await partiesRes.json();
            if (refreshedParties) {
                setParties(refreshedParties);
                const partyForModal = refreshedParties.find((p: SupplyParty) => p.party_name === selectedParty.party_name);
                if (partyForModal) {
                    await openPaymentModal(partyForModal);
                } else {
                    setIsPaymentModalOpen(false);
                    await fetchPartiesAndNames();
                }
            } else {
                 await fetchPartiesAndNames();
            }

        } catch (err: any) {
            setError(`Error adding transaction: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-slate-700">Supply Parties</h2>
                    <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Add Supply Bill</button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="py-3 px-4 text-left font-semibold text-slate-600">Date</th>
                                <th className="py-3 px-4 text-left font-semibold text-slate-600">Party Name</th>
                                <th className="py-3 px-4 text-right font-semibold text-slate-600">Total Amount</th>
                                <th className="py-3 px-4 text-right font-semibold text-slate-600">Paid</th>
                                <th className="py-3 px-4 text-right font-semibold text-slate-600">Pending</th>
                                <th className="py-3 px-4 text-center font-semibold text-slate-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className="text-center py-4">Loading...</td></tr>
                        ) : (
                            parties.map(party => (
                                <tr key={party.id} className="border-b hover:bg-slate-50">
                                    <td className="py-3 px-4">{new Date(party.supply_date).toLocaleDateString()}</td>
                                    <td className="py-3 px-4">{party.party_name}</td>
                                    <td className="py-3 px-4 text-right font-medium">PKR {Number(party.total_amount).toLocaleString()}</td>
                                    <td className="py-3 px-4 text-right text-green-600">PKR {Number(party.amount_paid).toLocaleString()}</td>
                                    <td className="py-3 px-4 text-right text-red-600">PKR {Number(party.pending_amount).toLocaleString()}</td>
                                    <td className="py-3 px-4 text-center">
                                        <button onClick={() => openPaymentModal(party)} className="px-3 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 text-sm">View Ledger / Pay</button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && <AddSupplyModal partyNames={partyNames} onClose={() => setIsModalOpen(false)} onSave={handleSaveSupplyBill} loading={loading} />}
            {isPaymentModalOpen && selectedParty && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                         <h3 className="text-2xl font-bold text-slate-800 mb-4">Ledger for {selectedParty.party_name}</h3>
                         <div className="grid grid-cols-1 md:grid-cols-5 gap-6 flex-grow overflow-y-auto pr-2">
                            {/* Ledger History */}
                            <div className="md:col-span-3 space-y-2">
                                <h4 className="font-semibold text-lg text-slate-700 border-b pb-2">Transaction History</h4>
                                 <div className="overflow-auto">
                                    <table className="min-w-full text-sm">
                                        <thead className="bg-slate-100">
                                            <tr>
                                                <th className="py-2 px-2 text-left font-semibold text-slate-600">Date</th>
                                                <th className="py-2 px-2 text-left font-semibold text-slate-600">Description</th>
                                                <th className="py-2 px-2 text-right font-semibold text-slate-600">Debit</th>
                                                <th className="py-2 px-2 text-right font-semibold text-slate-600">Credit</th>
                                                <th className="py-2 px-2 text-right font-semibold text-slate-600">Balance</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        {ledgerEntries.map((entry, idx) => (
                                            <tr key={idx} className="border-b hover:bg-slate-50">
                                                <td className="py-2 px-2">{new Date(entry.date).toLocaleDateString()}</td>
                                                <td className="py-2 px-2">{entry.description}</td>
                                                <td className="py-2 px-2 text-right text-red-600">{entry.debit > 0 ? entry.debit.toLocaleString() : '-'}</td>
                                                <td className="py-2 px-2 text-right text-green-600">{entry.credit > 0 ? entry.credit.toLocaleString() : '-'}</td>
                                                <td className="py-2 px-2 text-right font-bold">{entry.balance.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                 </div>
                            </div>
                            {/* Add Transaction */}
                            <div className="md:col-span-2 space-y-4 md:border-l md:pl-6">
                                <h4 className="font-semibold text-lg text-slate-700">Add New Transaction</h4>
                                {error && <div className="text-red-600 bg-red-100 p-2 rounded text-sm">{error}</div>}
                                {success && <div className="text-green-600 bg-green-100 p-2 rounded text-sm">{success}</div>}
                                <form onSubmit={handleAddTransaction} className="space-y-4">
                                     <div>
                                        <label className="block font-medium text-slate-600">Transaction Type</label>
                                        <select value={transactionType} onChange={e => setTransactionType(e.target.value as 'Payment' | 'Charge')} className="w-full p-2 border-gray-300 rounded-md bg-slate-50">
                                            <option value="Payment">Payment (Credit)</option>
                                            <option value="Charge">New Charge (Debit)</option>
                                        </select>
                                    </div>
                                     <div>
                                        <label className="block font-medium text-slate-600">Amount</label>
                                        <input type="number" value={newTransactionAmount} onChange={e => setNewTransactionAmount(e.target.value === '' ? '' : parseFloat(e.target.value))} className="w-full p-2 border-gray-300 rounded-md bg-slate-50" required />
                                    </div>
                                    <div>
                                        <label className="block font-medium text-slate-600">Note (optional)</label>
                                        <textarea value={transactionNote} onChange={e => setTransactionNote(e.target.value)} rows={2} className="w-full p-2 border-gray-300 rounded-md bg-slate-50"></textarea>
                                    </div>
                                    <button type="submit" disabled={loading || (transactionType === 'Payment' && Number(selectedParty.pending_amount) === 0)} className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed">{loading ? 'Saving...' : 'Add Transaction'}</button>
                                </form>
                            </div>
                         </div>
                         <div className="pt-4 border-t text-right">
                             <button onClick={() => setIsPaymentModalOpen(false)} className="px-4 py-2 bg-slate-300 rounded-md hover:bg-slate-400">Close</button>
                         </div>
                    </div>
                 </div>
            )}
        </div>
    );
};

export default SupplyParties;