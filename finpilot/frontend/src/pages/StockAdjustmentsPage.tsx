import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { TabGroup } from '../components/common/TabGroup';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { DataTable, TableHeader, TableHeadCell, TableBody, TableRow, TableCell } from '../components/common/DataTable';
import { PageHeader } from '../components/common/PageHeader';

interface StockAdjustmentsPageProps {
  initialTab?: 'list' | 'add';
}

export const StockAdjustmentsPage: React.FC<StockAdjustmentsPageProps> = ({ initialTab = 'list' }) => {
  const { products, stockAdjustments, createStockAdjustment } = useStore();
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const [prodId, setProdId] = useState(products[0]?.id || 'prod-1');
  const [location, setLocation] = useState('Banani Central Vault');
  const [adjType, setAdjType] = useState<'Damaged' | 'Audit Shortage' | 'Audit Surplus'>('Damaged');
  const [qty, setQty] = useState('2');
  const [reason, setReason] = useState('');

  const handleAdjSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = products.find(item => item.id === prodId) || products[0];
    const q = parseInt(qty) || 1;
    createStockAdjustment({
      location,
      productId: p.id,
      productName: p.name,
      adjustmentType: adjType,
      quantity: q,
      unitCost: p.costPrice,
      totalValue: p.costPrice * q,
      adjustmentDate: 'Today',
      reason: reason || 'Physical inventory audit adjustment'
    });
    setActiveTab('list');
  };

  const tabs = [
    { id: 'list', label: `Stock Adjustments (${stockAdjustments.length})` },
    { id: 'add', label: 'Record Inventory Variance' }
  ];

  const totalAdjustedVal = stockAdjustments.reduce((acc, curr) => acc + curr.totalValue, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inventory"
        title="Stock adjustments"
        description="Record approved stock variances, damage write-offs, and audit corrections."
        actions={<Button
          variant="brand"
          size="sm"
          onClick={() => setActiveTab('add')}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Record Adjustment
        </Button>}
      />

      <p className="text-xs text-content-secondary"><strong className="font-semibold text-content-primary">{stockAdjustments.length}</strong> audit adjustments · <strong className="font-semibold text-content-primary">৳ {totalAdjustedVal.toLocaleString()}</strong> adjusted value</p>

      {/* Tabs */}
      <TabGroup
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* ============================================================== */}
      {/* TAB 1: LIST ADJUSTMENTS */}
      {/* ============================================================== */}
      {activeTab === 'list' && (
        <DataTable isEmpty={stockAdjustments.length === 0} emptyMessage="No stock adjustments found.">
          <TableHeader>
            <tr>
              <TableHeadCell>Adjustment # & Date</TableHeadCell>
              <TableHeadCell>Location</TableHeadCell>
              <TableHeadCell>Product Name</TableHeadCell>
              <TableHeadCell>Type</TableHeadCell>
              <TableHeadCell align="center">Quantity</TableHeadCell>
              <TableHeadCell align="right">Adjusted Value (৳)</TableHeadCell>
              <TableHeadCell>Audit Reason</TableHeadCell>
            </tr>
          </TableHeader>
          <TableBody>
            {stockAdjustments.map((adj) => {
              const typeVariant = adj.adjustmentType === 'Damaged' ? 'danger' : adj.adjustmentType === 'Audit Shortage' ? 'warning' : 'success';

              return (
                <TableRow key={adj.id}>
                  <TableCell>
                    <div className="font-semibold text-content-primary">{adj.adjustmentNumber}</div>
                    <div className="text-[11px] text-content-muted font-mono">{adj.adjustmentDate}</div>
                  </TableCell>
                  <TableCell className="text-content-secondary text-xs">
                    {adj.location}
                  </TableCell>
                  <TableCell className="font-medium text-content-primary max-w-xs truncate">
                    {adj.productName}
                  </TableCell>
                  <TableCell>
                    <Badge variant={typeVariant} size="sm">
                      {adj.adjustmentType}
                    </Badge>
                  </TableCell>
                  <TableCell align="center" tabular className="font-bold text-content-primary">
                    {adj.adjustmentType === 'Audit Surplus' ? `+${adj.quantity}` : `-${adj.quantity}`} Units
                  </TableCell>
                  <TableCell align="right" tabular className="font-bold text-content-primary">
                    ৳ {adj.totalValue.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-content-muted text-xs max-w-xs truncate">
                    {adj.reason}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </DataTable>
      )}

      {/* ============================================================== */}
      {/* TAB 2: ADD ADJUSTMENT */}
      {/* ============================================================== */}
      {activeTab === 'add' && (
        <Card className="p-6 max-w-xl mx-auto space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-boundary-subtle">
            <div className="p-1.5 rounded-lg bg-brand-olive/20 text-brand-dark dark:text-brand-cream">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-content-primary">Record Inventory Adjustment</h3>
              <p className="text-xs text-content-muted">Reconcile physical showroom counts against system inventory balances</p>
            </div>
          </div>

          <form onSubmit={handleAdjSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1">Warehouse / Location</label>
              <Select
                value={location}
                onChange={e => setLocation(e.target.value)}
              >
                <option value="Banani Central Vault">Banani Central Vault</option>
                <option value="Elephant Road Multiplan Branch">Elephant Road Multiplan Branch</option>
                <option value="IDB Bhaban Agargaon Branch">IDB Bhaban Agargaon Branch</option>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1">Hardware Product</label>
              <Select
                value={prodId}
                onChange={e => setProdId(e.target.value)}
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Stock: {p.stockCount})
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-content-primary mb-1">Adjustment Type</label>
                <Select
                  value={adjType}
                  onChange={e => setAdjType(e.target.value as any)}
                >
                  <option value="Damaged">Damaged in Transit (-)</option>
                  <option value="Audit Shortage">Physical Audit Shortage (-)</option>
                  <option value="Audit Surplus">Audit Surplus (+)</option>
                </Select>
              </div>

              <Input
                label="Units Adjusted"
                type="number"
                min="1"
                required
                value={qty}
                onChange={e => setQty(e.target.value)}
              />
            </div>

            <Input
              label="Reason & Audit Reference"
              placeholder="e.g. Minor carton damage during Chittagong to Dhaka port transit"
              value={reason}
              onChange={e => setReason(e.target.value)}
            />

            <div className="pt-2 flex justify-end gap-2.5">
              <Button variant="outline" size="sm" type="button" onClick={() => setActiveTab('list')}>
                Cancel
              </Button>
              <Button variant="primary" size="md" type="submit">
                Commit Stock Adjustment
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};
