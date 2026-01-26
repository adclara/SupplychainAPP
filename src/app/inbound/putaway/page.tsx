/**
 * Inbound - Putaway Page with Pull System
 * @description Users can pull putaway tasks and complete them
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
    MoveRight,
    Package,
    MapPin,
    CheckCircle,
    User,
    AlertCircle,
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/store/userStore';
import {
    getAvailablePutawayTasks,
    pullPutawayTask,
    completePutawayTask,
    type PutawayTaskWithDetails,
} from '@/services/inboundService';
import { toast } from 'react-hot-toast';

export default function PutawayPage(): React.JSX.Element {
    const { user } = useUserStore();
    const [activeTab, setActiveTab] = useState<'available' | 'my_tasks'>('available');
    const [availableTasks, setAvailableTasks] = useState<PutawayTaskWithDetails[]>([]);
    const [myTasks, setMyTasks] = useState<PutawayTaskWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [actioningId, setActioningId] = useState<string | null>(null);

    useEffect(() => {
        if (user?.warehouse_id) {
            fetchTasks();
        }
    }, [user?.warehouse_id]);

    /**
     * Fetch available putaway tasks
     */
    async function fetchTasks() {
        if (!user?.warehouse_id) return;

        try {
            setLoading(true);
            const data = await getAvailablePutawayTasks(user.warehouse_id);

            // Separate into available and my tasks
            const available = data.filter(t => t.status === 'pending');
            const mine = data.filter(t => t.assigned_to === user.id && t.status === 'in_progress');

            setAvailableTasks(available);
            setMyTasks(mine);
        } catch (error) {
            toast.error('Failed to load putaway tasks');
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    }

    /**
     * Pull a putaway task (assign to user)
     */
    async function handlePullTask(taskId: string) {
        if (!user?.id) return;

        try {
            setActioningId(taskId);
            await pullPutawayTask(taskId, user.id);
            toast.success('Task assigned to you');
            await fetchTasks();
            setActiveTab('my_tasks'); // Switch to my tasks tab
        } catch (error) {
            toast.error('Failed to pull task');
            console.error('Error pulling task:', error);
        } finally {
            setActioningId(null);
        }
    }

    /**
     * Complete putaway task
     */
    async function handleCompleteTask(taskId: string) {
        if (!user?.id) return;

        try {
            setActioningId(taskId);
            await completePutawayTask(taskId, user.id);
            toast.success('Putaway completed');
            await fetchTasks();
        } catch (error) {
            toast.error('Failed to complete putaway');
            console.error('Error completing task:', error);
        } finally {
            setActioningId(null);
        }
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />

            <main className="main-content">
                <div className="page-container animate-fade-in">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Putaway</h1>
                            <p className="text-slate-600 mt-1">
                                Pull putaway tasks and move items to storage
                            </p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <Card variant="elevated" className="bg-white border border-blue-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                    <Package className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-blue-700">{availableTasks.length}</div>
                                    <div className="text-sm text-slate-600">Available Tasks</div>
                                </div>
                            </div>
                        </Card>

                        <Card variant="elevated" className="bg-white border border-emerald-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                                    <User className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-emerald-700">{myTasks.length}</div>
                                    <div className="text-sm text-slate-600">My Active Tasks</div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Tabs */}
                    <div className="mb-6 border-b border-slate-200">
                        <div className="flex gap-4">
                            <button
                                onClick={() => setActiveTab('available')}
                                className={cn(
                                    'px-4 py-2 font-medium border-b-2 transition-colors',
                                    activeTab === 'available'
                                        ? 'border-blue-500 text-blue-700'
                                        : 'border-transparent text-slate-600 hover:text-slate-800'
                                )}
                            >
                                Available Tasks ({availableTasks.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('my_tasks')}
                                className={cn(
                                    'px-4 py-2 font-medium border-b-2 transition-colors',
                                    activeTab === 'my_tasks'
                                        ? 'border-emerald-500 text-emerald-700'
                                        : 'border-transparent text-slate-600 hover:text-slate-800'
                                )}
                            >
                                My Tasks ({myTasks.length})
                            </button>
                        </div>
                    </div>

                    {/* Available Tasks Tab */}
                    {activeTab === 'available' && (
                        <Card variant="elevated" padded={false} className="bg-white border border-slate-200">
                            <div className="p-6 border-b border-slate-200">
                                <CardHeader
                                    title="Available Putaway Tasks"
                                    subtitle={`${availableTasks.length} tasks waiting to be assigned`}
                                />
                            </div>

                            {loading ? (
                                <div className="p-12 text-center">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                    <p className="text-slate-600 mt-4">Loading tasks...</p>
                                </div>
                            ) : availableTasks.length === 0 ? (
                                <div className="p-12 text-center">
                                    <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-slate-700 mb-2">No available tasks</h3>
                                    <p className="text-slate-500">All putaway tasks are currently assigned</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-200">
                                    {availableTasks.map((task) => (
                                        <div key={task.id} className="p-6 hover:bg-slate-50 transition-colors">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                    <MoveRight className="w-6 h-6 text-blue-600" />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-4 mb-2">
                                                        <div>
                                                            <h3 className="font-semibold text-slate-800 mb-1">
                                                                {task.product.name}
                                                            </h3>
                                                            <p className="text-sm text-slate-600">
                                                                SKU: {task.product.sku}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-2xl font-bold text-slate-800">
                                                                {task.quantity}
                                                            </div>
                                                            <div className="text-xs text-slate-500">units</div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="w-4 h-4 text-amber-500" />
                                                            <span className="font-mono">From: {task.from_location.barcode}</span>
                                                        </div>
                                                        <MoveRight className="w-4 h-4" />
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="w-4 h-4 text-emerald-500" />
                                                            <span className="font-mono">
                                                                To: {task.to_location?.barcode || 'TBD'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={() => handlePullTask(task.id)}
                                                        disabled={actioningId === task.id}
                                                    >
                                                        {actioningId === task.id ? 'Pulling...' : 'Pull Task'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    )}

                    {/* My Tasks Tab */}
                    {activeTab === 'my_tasks' && (
                        <Card variant="elevated" padded={false} className="bg-white border border-slate-200">
                            <div className="p-6 border-b border-slate-200">
                                <CardHeader
                                    title="My Active Tasks"
                                    subtitle={`${myTasks.length} tasks assigned to you`}
                                />
                            </div>

                            {loading ? (
                                <div className="p-12 text-center">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                                    <p className="text-slate-600 mt-4">Loading your tasks...</p>
                                </div>
                            ) : myTasks.length === 0 ? (
                                <div className="p-12 text-center">
                                    <User className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-slate-700 mb-2">No active tasks</h3>
                                    <p className="text-slate-500 mb-6">Pull a task from available tasks to get started</p>
                                    <Button
                                        variant="primary"
                                        onClick={() => setActiveTab('available')}
                                    >
                                        View Available Tasks
                                    </Button>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-200">
                                    {myTasks.map((task) => (
                                        <div key={task.id} className="p-6 hover:bg-slate-50 transition-colors">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                                    <MoveRight className="w-6 h-6 text-emerald-600" />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-4 mb-2">
                                                        <div>
                                                            <h3 className="font-semibold text-slate-800 mb-1">
                                                                {task.product.name}
                                                            </h3>
                                                            <p className="text-sm text-slate-600">
                                                                SKU: {task.product.sku}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-2xl font-bold text-slate-800">
                                                                {task.quantity}
                                                            </div>
                                                            <div className="text-xs text-slate-500">units</div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="w-4 h-4 text-amber-500" />
                                                            <span className="font-mono">From: {task.from_location.barcode}</span>
                                                        </div>
                                                        <MoveRight className="w-4 h-4" />
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="w-4 h-4 text-emerald-500" />
                                                            <span className="font-mono">
                                                                To: {task.to_location?.barcode || 'TBD'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        leftIcon={<CheckCircle className="w-4 h-4" />}
                                                        onClick={() => handleCompleteTask(task.id)}
                                                        disabled={actioningId === task.id}
                                                    >
                                                        {actioningId === task.id ? 'Completing...' : 'Complete Putaway'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    )}

                    {/* Info Card */}
                    <Card variant="elevated" className="mt-8 bg-blue-50 border border-blue-200">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-blue-900 mb-1">Putaway Tips</h4>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• Pull tasks from the available queue to start working</li>
                                    <li>• Verify destination location before completing</li>
                                    <li>• Complete putaway once items are in correct location</li>
                                </ul>
                            </div>
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    );
}
