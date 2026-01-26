/**
 * Inbound - Replenishment Page
 * @description Auto-triggered replenishment queue for PRIME locations
 */

'use client';

import React, { useState } from 'react';
import {
    RefreshCw,
    MapPin,
    Package,
    Scan,
    AlertTriangle,
    CheckCircle,
    TrendingUp,
    ArrowRight,
    Clock,
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn, formatRelativeTime } from '@/lib/utils';

// Mock replenishment requests - auto-generated when PRIME < 30%
const replenishmentQueue = [
    {
        id: '1',
        location: 'A1101',
        productName: 'iPhone 15 Pro Max 256GB Black',
        sku: 'APL-IP15PM-256-BK',
        currentUnits: 2,
        targetUnits: 10,
        capacityUnits: 10,
        priority: 'urgent', // 0-10% = urgent
        sourceLocation: 'A2103',
        sourceUnits: 40,
        status: 'pending',
        requestedAt: '2026-01-24T19:30:00Z',
    },
    {
        id: '2',
        location: 'B1202',
        productName: 'AirPods Pro 2nd Gen',
        sku: 'APL-AIRPM2-WH',
        currentUnits: 5,
        targetUnits: 20,
        capacityUnits: 20,
        priority: 'high', // 10-30% = high
        sourceLocation: 'B2204',
        sourceUnits: 80,
        status: 'pending',
        requestedAt: '2026-01-24T18:45:00Z',
    },
    {
        id: '3',
        location: 'C1301',
        productName: 'Samsung Galaxy S24 Ultra',
        sku: 'SAM-GS24U-512-BK',
        currentUnits: 8,
        targetUnits: 30,
        capacityUnits: 30,
        priority: 'medium',
        sourceLocation: 'C3204',
        sourceUnits: 50,
        status: 'in_progress',
        requestedAt: '2026-01-24T17:00:00Z',
    },
];

const priorityConfig = {
    urgent: {
        label: 'URGENT',
        color: 'text-red-400 bg-red-400/10 border-red-400/30',
        icon: AlertTriangle,
        description: '0-10% capacity - Immediate action required',
    },
    high: {
        label: 'HIGH',
        color: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
        icon: AlertTriangle,
        description: '10-30% capacity - Replenish soon',
    },
    medium: {
        label: 'MEDIUM',
        color: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
        icon: RefreshCw,
        description: '30-50% capacity - Schedule replenishment',
    },
    low: {
        label: 'LOW',
        color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
        icon: CheckCircle,
        description: '>50% capacity - Monitor',
    },
};

export default function ReplenishmentPage(): React.JSX.Element {
    const [scanMode, setScanMode] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
    const [step, setStep] = useState<'scan_source' | 'enter_qty' | 'scan_target'>('scan_source');
    const [quantityToMove, setQuantityToMove] = useState('');

    const stats = {
        pending: replenishmentQueue.filter(r => r.status === 'pending').length,
        inProgress: replenishmentQueue.filter(r => r.status === 'in_progress').length,
        urgent: replenishmentQueue.filter(r => r.priority === 'urgent').length,
        completed: 0,
    };

    const activeRequest = selectedRequest
        ? replenishmentQueue.find(r => r.id === selectedRequest)
        : null;

    const handleStartReplenishment = (requestId: string) => {
        setSelectedRequest(requestId);
        setScanMode(true);
        setStep('scan_source');
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />

            <main className="main-content">
                <div className="page-container animate-fade-in">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Replenishment</h1>
                            <p className="text-slate-600 mt-1">
                                Auto-triggered stock moves from RESERVE to PRIME
                            </p>
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={<RefreshCw className="w-4 h-4" />}
                        >
                            Refresh Queue
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-4 mb-8">
                        <Card variant="elevated" className="bg-white border border-red-200">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
                                    <div className="text-sm text-slate-600">Urgent</div>
                                </div>
                            </div>
                        </Card>

                        <Card variant="elevated" className="bg-white border border-amber-200">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-amber-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-amber-700">{stats.pending}</div>
                                    <div className="text-sm text-slate-600">Pending</div>
                                </div>
                            </div>
                        </Card>

                        <Card variant="elevated" className="bg-white border border-blue-200">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <RefreshCw className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-blue-700">{stats.inProgress}</div>
                                    <div className="text-sm text-slate-600">In Progress</div>
                                </div>
                            </div>
                        </Card>

                        <Card variant="elevated" className="bg-white border border-emerald-200">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-emerald-700">{stats.completed}</div>
                                    <div className="text-sm text-slate-600">Completed Today</div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Replenishment Workflow */}
                    {scanMode && activeRequest && (
                        <Card variant="elevated" className="mb-8 bg-white border border-blue-200">
                            <div className="text-center py-8">
                                {/* Step Indicator */}
                                <div className="flex items-center justify-center gap-4 mb-8">
                                    <div className={cn(
                                        'flex items-center gap-2 px-4 py-2 rounded-full',
                                        step === 'scan_source' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'
                                    )}>
                                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">1</div>
                                        <span className="text-sm font-medium">Scan Source</span>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-slate-600" />
                                    <div className={cn(
                                        'flex items-center gap-2 px-4 py-2 rounded-full',
                                        step === 'enter_qty' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'
                                    )}>
                                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">2</div>
                                        <span className="text-sm font-medium">Enter Qty</span>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-slate-600" />
                                    <div className={cn(
                                        'flex items-center gap-2 px-4 py-2 rounded-full',
                                        step === 'scan_target' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'
                                    )}>
                                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">3</div>
                                        <span className="text-sm font-medium">Scan Target</span>
                                    </div>
                                </div>

                                {/* Step 1: Scan Source */}
                                {step === 'scan_source' && (
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-100 mb-2">
                                            Scan RESERVE Location
                                        </h3>
                                        <div className="text-6xl font-mono font-bold text-blue-400 my-6">
                                            {activeRequest.sourceLocation}
                                        </div>
                                        <p className="text-slate-600 mb-6">
                                            {activeRequest.sourceUnits} units of {activeRequest.productName} available
                                        </p>
                                        <div className="max-w-md mx-auto">
                                            <Input
                                                placeholder="Scan source location..."
                                                leftIcon={<Scan className="w-5 h-5" />}
                                                autoFocus
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') setStep('enter_qty');
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Enter Quantity */}
                                {step === 'enter_qty' && (
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-100 mb-2">
                                            How Many Units to Move?
                                        </h3>
                                        <p className="text-slate-400 mb-6">
                                            Target location needs {activeRequest.targetUnits - activeRequest.currentUnits} units
                                        </p>
                                        <div className="max-w-md mx-auto space-y-4">
                                            <Input
                                                type="number"
                                                placeholder="Enter quantity..."
                                                value={quantityToMove}
                                                onChange={(e) => setQuantityToMove(e.target.value)}
                                                className="text-center text-4xl font-bold"
                                                autoFocus
                                            />
                                            <div className="flex gap-3">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => setQuantityToMove((activeRequest.targetUnits - activeRequest.currentUnits).toString())}
                                                >
                                                    Fill to Target ({activeRequest.targetUnits - activeRequest.currentUnits})
                                                </Button>
                                                <Button
                                                    variant="primary"
                                                    fullWidth
                                                    onClick={() => setStep('scan_target')}
                                                    disabled={!quantityToMove || parseInt(quantityToMove) <= 0}
                                                >
                                                    Continue
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Scan Target */}
                                {step === 'scan_target' && (
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-100 mb-2">
                                            Scan PRIME Location
                                        </h3>
                                        <div className="text-6xl font-mono font-bold text-emerald-400 my-6">
                                            {activeRequest.location}
                                        </div>
                                        <p className="text-slate-400 mb-2">
                                            Moving <span className="font-bold text-blue-400">{quantityToMove}</span> units
                                        </p>
                                        <p className="text-sm text-slate-500 mb-6">
                                            {activeRequest.location} will have {parseInt(activeRequest.currentUnits.toString()) + parseInt(quantityToMove)} / {activeRequest.capacityUnits} units
                                        </p>
                                        <div className="max-w-md mx-auto">
                                            <Input
                                                placeholder="Scan target location..."
                                                leftIcon={<Scan className="w-5 h-5" />}
                                                autoFocus
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        alert(`Replenishment completed! Moved ${quantityToMove} units from ${activeRequest.sourceLocation} to ${activeRequest.location}`);
                                                        setScanMode(false);
                                                        setSelectedRequest(null);
                                                        setStep('scan_source');
                                                        setQuantityToMove('');
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}

                    {/* Replenishment Queue */}
                    <Card variant="elevated" padded={false} className="bg-white border border-slate-200">
                        <div className="p-6 border-b border-slate-200">
                            <CardHeader
                                title="Replenishment Queue"
                                subtitle={`${replenishmentQueue.length} locations need replenishment`}
                            />
                        </div>

                        <div className="divide-y divide-slate-200">
                            {replenishmentQueue.map((request) => {
                                const config = priorityConfig[request.priority as keyof typeof priorityConfig];
                                const Icon = config.icon;
                                const fillPercentage = (request.currentUnits / request.capacityUnits) * 100;

                                return (
                                    <div
                                        key={request.id}
                                        className={cn(
                                            'p-6 transition-colors',
                                            request.priority === 'urgent' && 'bg-red-500/5 border-l-4 border-red-500',
                                            selectedRequest === request.id && 'bg-blue-500/5'
                                        )}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={cn(
                                                'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                                                request.priority === 'urgent' ? 'bg-red-500/20' :
                                                    request.priority === 'high' ? 'bg-amber-500/20' :
                                                        'bg-blue-500/20'
                                            )}>
                                                <Icon className={cn(
                                                    'w-6 h-6',
                                                    request.priority === 'urgent' ? 'text-red-400' :
                                                        request.priority === 'high' ? 'text-amber-400' :
                                                            'text-blue-400'
                                                )} />
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="font-mono font-bold text-lg text-slate-800">
                                                                {request.location}
                                                            </h3>
                                                            <span className={cn(
                                                                'px-2.5 py-1 rounded-full text-xs font-bold border',
                                                                config.color
                                                            )}>
                                                                {config.label}
                                                            </span>
                                                            {request.status === 'in_progress' && (
                                                                <span className="px-2.5 py-1 rounded-full text-xs font-medium text-blue-400 bg-blue-400/10">
                                                                    In Progress
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm font-medium text-slate-700">{request.productName}</p>
                                                        <p className="text-xs text-slate-500 mt-1">SKU: {request.sku}</p>
                                                    </div>
                                                </div>

                                                {/* Capacity Bar */}
                                                <div className="mb-4">
                                                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                                                        <span>Current Fill Level</span>
                                                        <span className={cn(
                                                            'font-semibold',
                                                            fillPercentage < 10 ? 'text-red-400' :
                                                                fillPercentage < 30 ? 'text-amber-400' :
                                                                    'text-emerald-400'
                                                        )}>
                                                            {fillPercentage.toFixed(0)}%
                                                        </span>
                                                    </div>
                                                    <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                                                        <div
                                                            className={cn(
                                                                'h-full rounded-full',
                                                                fillPercentage < 10 ? 'bg-red-500' :
                                                                    fillPercentage < 30 ? 'bg-amber-500' :
                                                                        'bg-emerald-500'
                                                            )}
                                                            style={{ width: `${fillPercentage}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Stock Info */}
                                                <div className="grid grid-cols-3 gap-3 mb-4">
                                                    <div className="bg-slate-800/50 rounded-lg p-3">
                                                        <div className="text-xs text-slate-400 mb-1">Current</div>
                                                        <div className="text-lg font-bold text-red-400">{request.currentUnits}</div>
                                                    </div>
                                                    <div className="bg-slate-800/50 rounded-lg p-3">
                                                        <div className="text-xs text-slate-400 mb-1">Target</div>
                                                        <div className="text-lg font-bold text-emerald-400">{request.targetUnits}</div>
                                                    </div>
                                                    <div className="bg-slate-800/50 rounded-lg p-3">
                                                        <div className="text-xs text-slate-400 mb-1">Need</div>
                                                        <div className="text-lg font-bold text-blue-400">{request.targetUnits - request.currentUnits}</div>
                                                    </div>
                                                </div>

                                                {/* Source Info */}
                                                <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="w-4 h-4 text-blue-400" />
                                                        <span>
                                                            Source: <span className="font-mono text-slate-300">{request.sourceLocation}</span>
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Package className="w-4 h-4" />
                                                        <span>{request.sourceUnits} units available</span>
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        <Clock className="w-3 h-3 inline mr-1" />
                                                        {formatRelativeTime(request.requestedAt)}
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                {request.status === 'pending' && (
                                                    <div className="flex gap-3">
                                                        <Button
                                                            variant="primary"
                                                            size="sm"
                                                            leftIcon={<RefreshCw className="w-4 h-4" />}
                                                            onClick={() => handleStartReplenishment(request.id)}
                                                        >
                                                            Start Replenishment
                                                        </Button>
                                                        <Button variant="secondary" size="sm">
                                                            Cancel Request
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    );
}
