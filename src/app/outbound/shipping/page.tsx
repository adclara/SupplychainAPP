/**
 * Outbound - Enhanced Shipping Page
 * @description Complete shipping workflow with carrier integration and label generation
 */

'use client';

import React, { useState } from 'react';
import {
    Truck,
    Package,
    Printer,
    Scan,
    CheckCircle,
    Clock,
    MapPin,
    FileText,
    Download,
    ExternalLink,
    AlertCircle,
    Weight,
    QrCode,
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn, formatRelativeTime } from '@/lib/utils';

// Mock data - will be replaced with real Supabase queries
const packedShipments = [
    {
        id: '77777777-7777-7777-7777-777777777706',
        orderNumber: 'ORD-2026-0006',
        customer: 'Cloud Systems Inc',
        shippingAddress: '222 Data Center Way, Phoenix, AZ 85001',
        carrier: null,
        trackingNumber: null,
        weightKg: 5.7,
        totalItems: 4,
        totalValue: 4250.00,
        status: 'packed',
        packedAt: '2026-01-24T15:30:00Z',
        packedBy: 'Carlos Mendez',
        lineItems: [
            { sku: 'APL-MBP14-M3-512', product: 'MacBook Pro 14" M3', quantity: 2, location: 'A2101' },
            { sku: 'APL-AIRPM2-WH', product: 'AirPods Pro 2nd Gen', quantity: 2, location: 'B1202' },
        ],
    },
    {
        id: '77777777-7777-7777-7777-777777777707',
        orderNumber: 'ORD-2026-0007',
        customer: 'Mobile First Corp',
        shippingAddress: '444 App Street, New York, NY 10001',
        carrier: 'fedex',
        trackingNumber: '794612345671',
        weightKg: 1.2,
        totalItems: 2,
        totalValue: 1450.00,
        status: 'shipped',
        packedAt: '2026-01-24T14:00:00Z',
        packedBy: 'Maria Garcia',
        shippedAt: '2026-01-24T16:00:00Z',
        lineItems: [
            { sku: 'APL-IP15PM-256-BK', product: 'iPhone 15 Pro Max', quantity: 1, location: 'A1101' },
            { sku: 'APL-AIRPM2-WH', product: 'AirPods Pro', quantity: 1, location: 'B1202' },
        ],
    },
    {
        id: '77777777-7777-7777-7777-777777777708',
        orderNumber: 'ORD-2026-0008',
        customer: 'Tech Retail LLC',
        shippingAddress: '789 Commerce St, Los Angeles, CA 90001',
        carrier: null,
        trackingNumber: null,
        weightKg: 0.9,
        totalItems: 5,
        totalValue: 1000.00,
        status: 'packed',
        packedAt: '2026-01-24T15:45:00Z',
        packedBy: 'Carlos Mendez',
        lineItems: [
            { sku: 'APL-AIRPM2-WH', product: 'AirPods Pro 2nd Gen', quantity: 5, location: 'B1202' },
        ],
    },
];

const carrierInfo = {
    fedex: {
        name: 'FedEx',
        color: 'text-purple-400 bg-purple-400/10',
        trackingUrl: 'https://www.fedex.com/fedextrack/?trknbr=',
    },
    ups: {
        name: 'UPS',
        color: 'text-amber-400 bg-amber-400/10',
        trackingUrl: 'https://www.ups.com/track?tracknum=',
    },
    dhl: {
        name: 'DHL',
        color: 'text-red-400 bg-red-400/10',
        trackingUrl: 'https://www.dhl.com/track?trackingNumber=',
    },
    usps: {
        name: 'USPS',
        color: 'text-blue-400 bg-blue-400/10',
        trackingUrl: 'https://tools.usps.com/go/TrackConfirmAction?tLabels=',
    },
};

export default function ShippingPage(): React.JSX.Element {
    const [scanMode, setScanMode] = useState(false);
    const [selectedShipment, setSelectedShipment] = useState<string | null>(null);
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    const totalWeight = packedShipments.reduce((sum, s) => sum + s.weightKg, 0);
    const totalUnits = packedShipments.reduce((sum, s) => sum + s.totalItems, 0);
    const totalValue = packedShipments.reduce((sum, s) => sum + s.totalValue, 0);

    const stats = {
        readyToShip: packedShipments.filter(s => s.status === 'packed').length,
        shipped: packedShipments.filter(s => s.status === 'shipped').length,
        totalWeight,
        totalUnits,
        totalValue,
    };

    const handleGenerateLabel = (shipmentId: string) => {
        // TODO: Call API to generate ZPL label
        console.log('Generating label for:', shipmentId);
        alert('Label generation will be implemented with thermal printer support');
    };

    const handleConfirmShipment = (shipmentId: string, carrier: string) => {
        // TODO: Call API to confirm shipment
        console.log('Confirming shipment:', shipmentId, 'via', carrier);
        alert(`Shipment confirmed via ${carrier}. Tracking number will be generated.`);
    };

    return (
        <div className="min-h-screen bg-slate-950">
            <Sidebar />

            <main className="main-content">
                <div className="page-container animate-fade-in">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-100">Shipping</h1>
                            <p className="text-slate-400 mt-1">
                                Generate labels and hand-off to carriers
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="secondary"
                                size="sm"
                                leftIcon={<Download className="w-4 h-4" />}
                            >
                                End of Day Manifest
                            </Button>
                            <Button
                                variant={scanMode ? 'primary' : 'secondary'}
                                size="sm"
                                leftIcon={<Scan className="w-4 h-4" />}
                                onClick={() => setScanMode(!scanMode)}
                            >
                                {scanMode ? 'Scanning...' : 'Scan to Ship'}
                            </Button>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                        <Card variant="glass" className="border-blue-500/30">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-400">{stats.readyToShip}</div>
                                <div className="text-sm text-slate-400 mt-1">Ready to Ship</div>
                            </div>
                        </Card>

                        <Card variant="glass" className="border-emerald-500/30">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-emerald-400">{stats.shipped}</div>
                                <div className="text-sm text-slate-400 mt-1">Shipped Today</div>
                            </div>
                        </Card>

                        <Card variant="glass">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-slate-100">{stats.totalUnits}</div>
                                <div className="text-sm text-slate-400 mt-1">Total Units</div>
                            </div>
                        </Card>

                        <Card variant="glass">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-slate-100">{stats.totalWeight.toFixed(1)}</div>
                                <div className="text-sm text-slate-400 mt-1">kg Total</div>
                            </div>
                        </Card>

                        <Card variant="glass">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-slate-100">${(stats.totalValue / 1000).toFixed(1)}k</div>
                                <div className="text-sm text-slate-400 mt-1">Total Value</div>
                            </div>
                        </Card>
                    </div>

                    {/* Scan Mode */}
                    {scanMode && (
                        <Card variant="glass" className="mb-8 border-blue-500/30">
                            <div className="text-center py-6">
                                <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                                    <Scan className="w-8 h-8 text-blue-400 animate-pulse" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-100 mb-2">
                                    Scan Order Barcode or Tracking Number
                                </h3>
                                <p className="text-slate-400 mb-6">
                                    Scan to verify shipment before carrier hand-off
                                </p>
                                <div className="max-w-md mx-auto">
                                    <Input
                                        placeholder="Scan barcode..."
                                        leftIcon={<Scan className="w-5 h-5" />}
                                        autoFocus
                                    />
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Shipments Table */}
                    <Card variant="elevated" padded={false}>
                        <div className="p-6 border-b border-slate-700/50">
                            <CardHeader
                                title="Packed Shipments"
                                subtitle={`${packedShipments.length} shipments ready for carrier hand-off`}
                            />
                        </div>

                        <div className="divide-y divide-slate-700/30">
                            {packedShipments.map((shipment) => (
                                <div key={shipment.id}>
                                    {/* Main Row */}
                                    <div
                                        className={cn(
                                            'p-6 transition-colors cursor-pointer',
                                            selectedShipment === shipment.id ? 'bg-blue-500/5 border-l-4 border-blue-500' : 'hover:bg-slate-800/30',
                                            shipment.status === 'shipped' && 'bg-emerald-500/5'
                                        )}
                                        onClick={() => {
                                            setSelectedShipment(shipment.id);
                                            setExpandedRow(expandedRow === shipment.id ? null : shipment.id);
                                        }}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={cn(
                                                'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                                                shipment.status === 'shipped' ? 'bg-emerald-500/20' : 'bg-blue-500/20'
                                            )}>
                                                {shipment.status === 'shipped' ? (
                                                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                                                ) : (
                                                    <Package className="w-6 h-6 text-blue-400" />
                                                )}
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="font-mono font-semibold text-lg text-slate-100">
                                                                {shipment.orderNumber}
                                                            </h3>
                                                            {shipment.status === 'shipped' && (
                                                                <span className="px-2.5 py-1 rounded-full text-xs font-medium text-emerald-400 bg-emerald-400/10">
                                                                    Shipped
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm font-medium text-slate-200">{shipment.customer}</p>
                                                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" />
                                                            {shipment.shippingAddress}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm text-slate-400">Total Value</div>
                                                        <div className="text-xl font-bold text-slate-100">
                                                            ${shipment.totalValue.toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-4 gap-4 mb-4">
                                                    <div className="bg-slate-800/50 rounded-lg p-3">
                                                        <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                                                            <Package className="w-3 h-3" />
                                                            Units
                                                        </div>
                                                        <div className="text-lg font-semibold text-slate-100">{shipment.totalItems}</div>
                                                    </div>

                                                    <div className="bg-slate-800/50 rounded-lg p-3">
                                                        <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                                                            <Weight className="w-3 h-3" />
                                                            Weight
                                                        </div>
                                                        <div className="text-lg font-semibold text-slate-100">{shipment.weightKg} kg</div>
                                                    </div>

                                                    <div className="bg-slate-800/50 rounded-lg p-3 col-span-2">
                                                        <div className="text-xs text-slate-400 mb-1">
                                                            {shipment.carrier ? 'Tracking Number' : 'Carrier'}
                                                        </div>
                                                        {shipment.trackingNumber ? (
                                                            <div className="font-mono text-sm text-blue-400 flex items-center gap-2">
                                                                {shipment.trackingNumber}
                                                                <a
                                                                    href={`${carrierInfo[shipment.carrier as keyof typeof carrierInfo]?.trackingUrl}${shipment.trackingNumber}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="hover:text-blue-300"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <ExternalLink className="w-3 h-3" />
                                                                </a>
                                                            </div>
                                                        ) : (
                                                            <div className="text-sm text-slate-500">Not assigned</div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex gap-3">
                                                    {shipment.status === 'packed' && !shipment.carrier && (
                                                        <>
                                                            <select
                                                                className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                                                                onClick={(e) => e.stopPropagation()}
                                                                onChange={(e) => {
                                                                    if (e.target.value) {
                                                                        handleConfirmShipment(shipment.id, e.target.value);
                                                                    }
                                                                }}
                                                                defaultValue=""
                                                            >
                                                                <option value="" disabled>Select Carrier</option>
                                                                <option value="fedex">FedEx</option>
                                                                <option value="ups">UPS</option>
                                                                <option value="dhl">DHL</option>
                                                                <option value="usps">USPS</option>
                                                            </select>
                                                            <Button
                                                                variant="primary"
                                                                size="sm"
                                                                leftIcon={<Printer className="w-4 h-4" />}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleGenerateLabel(shipment.id);
                                                                }}
                                                            >
                                                                Generate Label
                                                            </Button>
                                                            <Button
                                                                variant="secondary"
                                                                size="sm"
                                                                leftIcon={<QrCode className="w-4 h-4" />}
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                QR Code
                                                            </Button>
                                                        </>
                                                    )}

                                                    {shipment.status === 'shipped' && (
                                                        <div className="flex items-center gap-2 text-emerald-400">
                                                            <CheckCircle className="w-4 h-4" />
                                                            <span className="text-sm font-medium">
                                                                Shipped via {carrierInfo[shipment.carrier as keyof typeof carrierInfo]?.name} • {formatRelativeTime(shipment.shippedAt!)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {expandedRow === shipment.id && (
                                        <div className="px-6 pb-6 bg-slate-800/20">
                                            <div className="pt-4 border-t border-slate-700/50">
                                                <h4 className="text-sm font-semibold text-slate-300 mb-3">Line Items</h4>
                                                <div className="space-y-2">
                                                    {shipment.lineItems.map((item, idx) => (
                                                        <div key={idx} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center text-xs text-slate-400">
                                                                    {idx + 1}
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-medium text-slate-200">{item.product}</div>
                                                                    <div className="text-xs text-slate-500">SKU: {item.sku}</div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-6">
                                                                <div className="text-sm text-slate-400">
                                                                    <MapPin className="w-3 h-3 inline mr-1" />
                                                                    {item.location}
                                                                </div>
                                                                <div className="text-sm font-semibold text-slate-100">
                                                                    Qty: {item.quantity}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Carrier Pickup Schedule */}
                    <Card variant="glass" className="mt-8">
                        <CardHeader
                            title="Today's Carrier Pickups"
                            subtitle="Scheduled pickup times and contact information"
                        />
                        <div className="mt-6 space-y-4">
                            {Object.entries(carrierInfo).map(([key, info]) => (
                                <div key={key} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                                            <Truck className="w-5 h-5 text-slate-300" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-slate-100">{info.name}</div>
                                            <div className="text-sm text-slate-400">
                                                Daily Pickup • {key === 'fedex' ? '4:00 PM' : key === 'ups' ? '5:00 PM' : key === 'dhl' ? '3:30 PM' : '2:00 PM'}
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="secondary" size="sm">
                                        Request Early Pickup
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    );
}
