'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Truck,
    Package,
    Printer,
    Scan,
    CheckCircle,
    XCircle,
    ChevronDown,
    ChevronUp,
    Search,
    History,
    Info,
    QrCode,
    ArrowRight,
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

interface ShipmentLine {
    id: string;
    product: {
        id: string;
        name: string;
        sku: string;
        weight: number;
    };
    quantity: number;
}

interface Shipment {
    id: string;
    order_number: string;
    customer_name: string;
    status: string;
    shipment_lines: ShipmentLine[];
    carrier?: string;
    tracking_number?: string;
}

interface Summary {
    count: number;
    weight: number;
}

interface HandOffLogEntry {
    id: string;
    shipment_id: string;
    carrier: string;
    tracking_number: string;
    shipped_at: string;
    weight_kg: number;
    shipment: {
        order_number: string;
        customer_name: string;
    };
    user: {
        full_name: string;
    };
}

export default function ShippingPage() {
    const [waves, setWaves] = useState<any[]>([]);
    const [selectedWaveId, setSelectedWaveId] = useState<string>('');
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [summary, setSummary] = useState<Summary>({ count: 0, weight: 0 });
    const [handOffLog, setHandOffLog] = useState<HandOffLogEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedShipmentId, setExpandedShipmentId] = useState<string | null>(null);
    const [scannedBarcode, setScannedBarcode] = useState('');
    const [selectedCarrier, setSelectedCarrier] = useState<'fedex' | 'ups' | 'dhl'>('fedex');
    const [isVerifying, setIsVerifying] = useState<string | null>(null);
    const [isConfirming, setIsConfirming] = useState<string | null>(null);

    // No need to initialize, using imported supabase

    // Load shippable waves
    useEffect(() => {
        async function fetchWaves() {
            const { data, error } = await supabase
                .from('waves')
                .select('id, wave_number')
                .eq('status', 'packing')
                .order('created_at', { ascending: false });

            if (error) {
                toast.error('Failed to load waves');
            } else {
                setWaves(data || []);
            }
        }
        fetchWaves();
    }, [supabase]);

    // Load data for selected wave
    const fetchWaveData = useCallback(async (waveId: string) => {
        if (!waveId) return;
        setLoading(true);
        try {
            const resp = await fetch(`/api/outbound/shipping/wave/${waveId}`);
            const data = await resp.json();
            if (data.error) throw new Error(data.error);

            setShipments(data.shipments);
            setSummary(data.summary);

            const logResp = await fetch(`/api/outbound/shipping/log/${waveId}`);
            const logData = await logResp.json();
            setHandOffLog(logData.handOffLog || []);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedWaveId) {
            fetchWaveData(selectedWaveId);
        }
    }, [selectedWaveId, fetchWaveData]);

    const handlePrintLabel = async (shipmentId: string) => {
        try {
            const resp = await fetch('/api/outbound/shipping/label', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shipmentId }),
            });
            const data = await resp.json();
            if (data.zplCode) {
                console.log('ZPL Code for Thermal Printer:', data.zplCode);
                toast.success('Label generated! Check console for ZPL code.');
                // In reality, send to print service
            }
        } catch (error) {
            toast.error('Failed to generate label');
        }
    };

    const handleVerify = async (shipmentId: string, barcode: string) => {
        if (!barcode) return;
        setIsVerifying(shipmentId);
        try {
            const resp = await fetch('/api/outbound/shipping/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shipmentId, scannedBarcode: barcode }),
            });
            const data = await resp.json();
            if (data.isValid) {
                toast.success(data.message, { icon: '✓', style: { background: '#D1FAE5', color: '#065F46' } });
                setScannedBarcode('');
            } else {
                toast.error(data.message, { icon: '✗', style: { background: '#FEE2E2', color: '#991B1B' } });
            }
        } catch (error) {
            toast.error('Verification failed');
        } finally {
            setIsVerifying(null);
        }
    };

    const handleConfirm = async (shipmentId: string) => {
        setIsConfirming(shipmentId);
        try {
            const resp = await fetch('/api/outbound/shipping/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shipmentId, carrier: selectedCarrier }),
            });
            const data = await resp.json();
            if (data.error) throw new Error(data.error);

            toast.success(data.message);
            fetchWaveData(selectedWaveId); // Refresh data
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsConfirming(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />
            <main className="main-content">
                <div className="page-container animate-fade-in space-y-6">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Shipping Module</h1>
                            <p className="text-slate-500 mt-1">Final order verification and carrier hand-off</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            <div className="relative min-w-[240px]">
                                <select
                                    value={selectedWaveId}
                                    onChange={(e) => setSelectedWaveId(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                                >
                                    <option value="">Select Packed Wave...</option>
                                    {waves.map((wave) => (
                                        <option key={wave.id} value={wave.id}>
                                            {wave.wave_number}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>

                            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                                <select
                                    value={selectedCarrier}
                                    onChange={(e) => setSelectedCarrier(e.target.value as any)}
                                    className="bg-transparent text-sm font-medium text-slate-700 px-3 py-1.5 outline-none"
                                >
                                    <option value="fedex">FedEx</option>
                                    <option value="ups">UPS</option>
                                    <option value="dhl">DHL</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {!selectedWaveId ? (
                        <Card className="flex flex-col items-center justify-center p-20 text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                                <Truck className="w-8 h-8 text-blue-500" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-800">No Wave Selected</h3>
                            <p className="text-slate-500 max-w-sm">
                                Select a wave with "Packed" status from the menu above to start the shipping process.
                            </p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            {/* Summary and List */}
                            <div className="lg:col-span-3 space-y-6">
                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Card className="p-5 border-l-4 border-l-blue-500 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Shipments</p>
                                            <p className="text-2xl font-bold text-slate-900 mt-1">{summary.count}</p>
                                        </div>
                                        <Package className="w-10 h-10 text-blue-100" />
                                    </Card>
                                    <Card className="p-5 border-l-4 border-l-emerald-500 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Weight</p>
                                            <p className="text-2xl font-bold text-slate-900 mt-1">{summary.weight} kg</p>
                                        </div>
                                        <Truck className="w-10 h-10 text-emerald-100" />
                                    </Card>
                                    <Card className="p-5 border-l-4 border-l-amber-500 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Estimated Revenue</p>
                                            <p className="text-2xl font-bold text-slate-900 mt-1">$4,250.00</p>
                                        </div>
                                        <History className="w-10 h-10 text-amber-100" />
                                    </Card>
                                </div>

                                {/* Shipment Table */}
                                <Card padded={false} className="overflow-hidden">
                                    <div className="p-6 border-b border-slate-100 bg-white flex items-center justify-between">
                                        <h2 className="text-lg font-bold text-slate-900">Packed Shipments</h2>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="Search orders..."
                                                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-slate-50 border-b border-slate-100">
                                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Order Details</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Units</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Weight</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {shipments.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                                                            No packed shipments found in this wave.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    shipments.map((shipment) => (
                                                        <React.Fragment key={shipment.id}>
                                                            <tr className={cn(
                                                                "hover:bg-blue-50/30 transition-colors cursor-pointer",
                                                                expandedShipmentId === shipment.id && "bg-blue-50/50"
                                                            )} onClick={() => setExpandedShipmentId(expandedShipmentId === shipment.id ? null : shipment.id)}>
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center">
                                                                            {expandedShipmentId === shipment.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-bold text-slate-900">{shipment.order_number}</p>
                                                                            <p className="text-sm text-slate-500">{shipment.customer_name}</p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <span className="font-medium text-slate-700">
                                                                        {shipment.shipment_lines.reduce((acc, curr) => acc + curr.quantity, 0)}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <span className="font-medium text-slate-700">
                                                                        {shipment.shipment_lines.reduce((acc, curr) => acc + (curr.product.weight * curr.quantity), 0).toFixed(2)} kg
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                                                        PACKED
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 text-right">
                                                                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                                        <Button size="sm" variant="secondary" onClick={() => handlePrintLabel(shipment.id)}>
                                                                            <Printer className="w-4 h-4 mr-2" />
                                                                            Print
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="primary"
                                                                            onClick={() => handleConfirm(shipment.id)}
                                                                            isLoading={isConfirming === shipment.id}
                                                                        >
                                                                            Confirm
                                                                        </Button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            {expandedShipmentId === shipment.id && (
                                                                <tr className="bg-slate-50/50">
                                                                    <td colSpan={5} className="px-6 py-6 border-b border-slate-100">
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-slide-up">
                                                                            <div className="space-y-4">
                                                                                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                                                                    <Package className="w-4 h-4" /> Package Contents
                                                                                </h4>
                                                                                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                                                                    <table className="w-full text-sm">
                                                                                        <thead>
                                                                                            <tr className="bg-slate-50 text-slate-500 font-medium">
                                                                                                <th className="px-4 py-2">SKU</th>
                                                                                                <th className="px-4 py-2 text-center">Qty</th>
                                                                                                <th className="px-4 py-2 text-right">Item</th>
                                                                                            </tr>
                                                                                        </thead>
                                                                                        <tbody className="divide-y divide-slate-100 text-slate-700">
                                                                                            {shipment.shipment_lines.map((line) => (
                                                                                                <tr key={line.id}>
                                                                                                    <td className="px-4 py-2 font-mono text-xs">{line.product.sku}</td>
                                                                                                    <td className="px-4 py-2 text-center font-bold">{line.quantity}</td>
                                                                                                    <td className="px-4 py-2 text-right">{line.product.name}</td>
                                                                                                </tr>
                                                                                            ))}
                                                                                        </tbody>
                                                                                    </table>
                                                                                </div>
                                                                            </div>

                                                                            <div className="space-y-4">
                                                                                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                                                                    <Scan className="w-4 h-4" /> Verify & Label
                                                                                </h4>
                                                                                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
                                                                                    <div className="flex gap-2">
                                                                                        <Input
                                                                                            placeholder="Scan shipment barcode..."
                                                                                            value={scannedBarcode}
                                                                                            onChange={(e) => setScannedBarcode(e.target.value)}
                                                                                            onKeyPress={(e) => e.key === 'Enter' && handleVerify(shipment.id, scannedBarcode)}
                                                                                            className="flex-1"
                                                                                        />
                                                                                        <Button
                                                                                            variant="secondary"
                                                                                            onClick={() => handleVerify(shipment.id, scannedBarcode)}
                                                                                            isLoading={isVerifying === shipment.id}
                                                                                        >
                                                                                            Verify
                                                                                        </Button>
                                                                                    </div>
                                                                                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg text-blue-700">
                                                                                        <div className="flex items-center gap-3">
                                                                                            <QrCode className="w-8 h-8" />
                                                                                            <div>
                                                                                                <p className="text-xs font-bold uppercase">Order QR Code</p>
                                                                                                <p className="text-[10px] opacity-70">Scan for external tracking app</p>
                                                                                            </div>
                                                                                        </div>
                                                                                        <ArrowRight className="w-4 h-4 opacity-50" />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </React.Fragment>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            </div>

                            {/* Hand-off Log Sidebar */}
                            <Card padded={false} className="lg:col-span-1 h-fit">
                                <div className="p-4 border-b border-slate-100 bg-white sticky top-0 z-10 flex items-center gap-2">
                                    <History className="w-4 h-4 text-slate-500" />
                                    <h2 className="text-sm font-bold text-slate-900">Hand-off Log</h2>
                                </div>
                                <div className="max-h-[600px] overflow-y-auto p-4 space-y-3">
                                    {handOffLog.length === 0 ? (
                                        <div className="text-center py-10 opacity-50">
                                            <History className="w-8 h-8 mx-auto mb-2" />
                                            <p className="text-xs">No shipments processed yet.</p>
                                        </div>
                                    ) : (
                                        handOffLog.map((log) => (
                                            <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 px-1.5 py-0.5 rounded">
                                                        {log.carrier}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400">
                                                        {new Date(log.shipped_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{log.shipment.order_number}</p>
                                                    <p className="text-[11px] text-slate-500 truncate">{log.tracking_number}</p>
                                                </div>
                                                <div className="pt-2 border-t border-slate-200/50 flex items-center justify-between">
                                                    <span className="text-[10px] text-slate-400">By {log.user.full_name}</span>
                                                    <span className="text-[10px] font-medium text-slate-600">{log.weight_kg} kg</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Quick Tips */}
                    <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                        <Info className="w-5 h-5 text-amber-600" />
                        <p className="text-sm text-amber-800">
                            <span className="font-bold">Pro Tip:</span> Print thermal labels before scanning to ensure barcodes are ready for verification. Use ZPL compatible printers for best results.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
