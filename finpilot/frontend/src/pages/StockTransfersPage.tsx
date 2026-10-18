import React, { useState } from 'react';
import { Plus, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { TabGroup } from '../components/common/TabGroup';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { DataTable, TableHeader, TableHeadCell, TableBody, TableRow, TableCell } from '../components/common/DataTable';
import { PageHeader } from '../components/common/PageHeader';

interface StockTransfersPageProps {
  initialTab?: 'list' | 'add';
}

export const StockTransfersPage: React.FC<StockTransfersPageProps> = ({ initialTab = 'list' }) => {
  const { products, stockTransfers, createStockTransfer } = useStore();
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const [fromLoc, setFromLoc] = useState('Banani Central Vault #B4');
  const [toLoc, setToLoc] = useState('Elephant Road Multiplan Branch');
  const [prodId, setProdId] = useState(products[0]?.id || 'prod-1');
  const [qty, setQty] = useState('5');
  const [notes, setNotes] = useState('');

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = products.find(item => item.id === prodId) || products[0];
    createStockTransfer({
      fromLocation: fromLoc,
      toLocation: toLoc,
      productId: p.id,
      productName: p.name,
      quantity: parseInt(qty) || 1,
      transferDate: 'Today',
      status: 'Completed',
      notes: notes || 'Showroom replenishment transfer'
    });
    setActiveTab('list');
  };

  const tabs = [
    { id: 'list', label: `Transfers Log (${stockTransfers.length})` },
    { id: 'add', label: 'Create Inter-Branch Transfer' }
  ];

  const totalTransferredUnits = stockTransfers.reduce((acc, t) => acc + t.quantity, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inventory"
        title="Stock transfers"
        description="Move stock between locations with a clear transfer ledger."
        actions={<Button
          variant="brand"
          size="sm"
          onClick={() => setActiveTab('add')}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          New Stock Transfer
        </Button>}
      />

      <p className="text-xs text-content-secondary"><strong className="font-semibold text-content-primary">{stockTransfers.length}</strong> recorded transfers · <strong className="font-semibold text-content-primary">{totalTransferredUnits.toLocaleString()}</strong> units relocated</p>

      {/* Tabs */}
      <TabGroup
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* ============================================================== */}
      {/* TAB 1: LIST TRANSFERS */}
      {/* ============================================================== */}
      {activeTab === 'list' && (
        <DataTable isEmpty={stockTransfers.length === 0} emptyMessage="No stock transfers recorded.">
          <TableHeader>
            <tr>
              <TableHeadCell>Transfer # & Date</TableHeadCell>
              <TableHeadCell>Hardware Product</TableHeadCell>
              <TableHeadCell>Source Warehouse</TableHeadCell>
              <TableHeadCell align="center"><span aria-label="Transfer direction">→</span></TableHeadCell>
              <TableHeadCell>Destination Branch</TableHeadCell>
              <TableHeadCell align="center">Quantity</TableHeadCell>
              <TableHeadCell align="center">Status</TableHeadCell>
            </tr>
          </TableHeader>
          <TableBody>
            {stockTransfers.map((tr) => (
              <TableRow key={tr.id}>
                <TableCell>
                  <div className="font-semibold text-content-primary">{tr.transferNumber}</div>
                  <div className="text-[11px] text-content-muted font-mono">{tr.transferDate}</div>
                </TableCell>
                <TableCell className="font-medium text-content-primary max-w-xs truncate">
                  {tr.productName}
                </TableCell>
                <TableCell className="text-content-secondary text-xs">
                  {tr.fromLocation}
                </TableCell>
                <TableCell align="center">
                  <ArrowRight className="w-4 h-4 text-brand-ochre mx-auto" />
                </TableCell>
                <TableCell className="text-content-secondary text-xs">
                  {tr.toLocation}
                </TableCell>
                <TableCell align="center" tabular className="font-bold text-content-primary">
                  {tr.quantity} Units
                </TableCell>
                <TableCell align="center">
                  <Badge variant="success" size="sm">
                    ● {tr.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </DataTable>
      )}

      {/* ============================================================== */}
      {/* TAB 2: ADD TRANSFER */}
      {/* ============================================================== */}
      {activeTab === 'add' && (
        <Card className="p-6 max-w-xl mx-auto space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-boundary-subtle">
            <div className="p-1.5 rounded-lg bg-brand-olive/20 text-brand-dark dark:text-brand-cream">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-content-primary">Create Inter-Branch Stock Transfer</h3>
              <p className="text-xs text-content-muted">Issue gate-pass challan to relocate inventory between showroom branches</p>
            </div>
          </div>

          <form onSubmit={handleTransferSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1">Source Warehouse</label>
              <Select
                value={fromLoc}
                onChange={e => setFromLoc(e.target.value)}
              >
                <option value="Banani Central Vault #B4">Banani Central Vault #B4</option>
                <option value="Elephant Road Multiplan Branch">Elephant Road Multiplan Branch</option>
                <option value="IDB Bhaban Agargaon Branch">IDB Bhaban Agargaon Branch</option>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1">Destination Showroom</label>
              <Select
                value={toLoc}
                onChange={e => setToLoc(e.target.value)}
              >
                <option value="Elephant Road Multiplan Branch">Elephant Road Multiplan Branch</option>
                <option value="Banani Central Vault #B4">Banani Central Vault #B4</option>
                <option value="IDB Bhaban Agargaon Branch">IDB Bhaban Agargaon Branch</option>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1">Product to Transfer</label>
              <Select
                value={prodId}
                onChange={e => setProdId(e.target.value)}
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Available: {p.stockCount} units)
                  </option>
                ))}
              </Select>
            </div>

            <Input
              label="Units to Relocate"
              type="number"
              min="1"
              required
              value={qty}
              onChange={e => setQty(e.target.value)}
            />

            <Input
              label="Transit Challan Notes"
              placeholder="e.g. Replenish weekend showroom display counter"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />

            <div className="pt-2 flex justify-end gap-2.5">
              <Button variant="outline" size="sm" type="button" onClick={() => setActiveTab('list')}>
                Cancel
              </Button>
              <Button variant="primary" size="md" type="submit">
                Dispatch Stock Transfer
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};
