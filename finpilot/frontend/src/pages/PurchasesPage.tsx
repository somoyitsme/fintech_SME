import React, { useState } from 'react';
import { Plus, Search, CheckCircle2, PackageCheck, ArrowDownLeft, Ship, Truck, CalendarDays } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { TabGroup } from '../components/common/TabGroup';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { DataTable, TableHeader, TableHeadCell, TableBody, TableRow, TableCell } from '../components/common/DataTable';
import { PageHeader } from '../components/common/PageHeader';
import { Pagination } from '../components/common/Pagination';

interface PurchasesPageProps {
  initialTab?: 'list' | 'add' | 'returns';
  onNavigateTab?: (tab: string) => void;
}

export const PurchasesPage: React.FC<PurchasesPageProps> = ({ initialTab = 'list' }) => {
  const { purchaseOrders, suppliers, products, createPurchaseOrder, receivePurchaseOrder } = useStore();
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  React.useEffect(() => {
    setPage(1);
  }, [search]);

  // New PO State
  const [poSupplier, setPoSupplier] = useState(suppliers[0]?.name || 'ASUS Regional Distribution (Singapore)');
  const [poProduct, setPoProduct] = useState(products[0]?.id || 'prod-1');
  const [poQty, setPoQty] = useState('20');
  const [poCost, setPoCost] = useState('');
  const [poNotes, setPoNotes] = useState('');

  const filteredPOs = purchaseOrders.filter(po => 
    po.poNumber.toLowerCase().includes(search.toLowerCase()) ||
    po.supplierName.toLowerCase().includes(search.toLowerCase()) ||
    po.items.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedPOs = filteredPOs.slice((page - 1) * pageSize, page * pageSize);

  const handleCreatePOSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find(p => p.id === poProduct) || products[0];
    const qty = parseInt(poQty) || 10;
    const unitC = poCost ? parseFloat(poCost) : prod.costPrice;
    const totCost = unitC * qty;

    createPurchaseOrder({
      supplierName: poSupplier,
      productId: prod.id,
      quantity: qty,
      totalCost: totCost,
      itemsSummary: `${qty}x ${prod.name}`
    });

    setActiveTab('list');
  };

  // Metrics
  const totalPOValue = purchaseOrders.reduce((acc, po) => acc + po.totalCost, 0);
  const customsCount = purchaseOrders.filter(po => po.status === 'Port Customs').length;
  const receivedCount = purchaseOrders.filter(po => po.status === 'Received').length;
  const inTransitCount = purchaseOrders.filter(po => po.status === 'In Transit').length;

  const tabs = [
    { id: 'list', label: `Purchase Orders (${purchaseOrders.length})` },
    { id: 'add', label: 'Create Purchase' },
    { id: 'returns', label: 'Purchase Returns (RMA)' }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Commerce"
        title="Purchasing"
        description="Track supplier orders, inbound stock, and goods received."
        actions={<Button
          variant="brand"
          size="sm"
          onClick={() => setActiveTab('add')}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Purchase Requisition
        </Button>}
      />

      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-content-secondary">
        <span><strong className="font-semibold text-content-primary">৳ {totalPOValue.toLocaleString()}</strong> procurement value</span>
        <span><strong className="font-semibold text-content-primary">{customsCount}</strong> at customs</span>
        <span><strong className="font-semibold text-content-primary">{inTransitCount}</strong> in transit</span>
        <span><strong className="font-semibold text-content-primary">{receivedCount}</strong> received</span>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <TabGroup
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {activeTab === 'list' && (
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search PO #, vendor, item..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-content-muted" />}
            />
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* TAB 1: LIST PURCHASE ORDERS */}
      {/* ============================================================== */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          <DataTable isEmpty={filteredPOs.length === 0} emptyMessage="No purchase orders match your criteria.">
          <TableHeader>
            <tr>
              <TableHeadCell>PO # & Order Date</TableHeadCell>
              <TableHeadCell>Supplier / Vendor</TableHeadCell>
              <TableHeadCell>Hardware Items</TableHeadCell>
              <TableHeadCell align="center">Quantity</TableHeadCell>
              <TableHeadCell align="right">Grand Total (৳)</TableHeadCell>
              <TableHeadCell>Status / Expected arrival</TableHeadCell>
              <TableHeadCell align="center">Stock Action</TableHeadCell>
            </tr>
          </TableHeader>
          <TableBody>
            {paginatedPOs.map((po) => {
              const isReceived = po.status === 'Received';
              const isCustoms = po.status === 'Port Customs';
              const StatusIcon = isReceived ? CheckCircle2 : isCustoms ? Ship : Truck;

              return (
                <TableRow key={po.id}>
                  <TableCell>
                    <div className="font-semibold text-content-primary whitespace-nowrap">{po.poNumber}</div>
                    <div className="text-[11px] text-content-muted mt-0.5">{po.orderDate}</div>
                  </TableCell>
                  <TableCell className="font-medium text-content-primary">
                    {po.supplierName}
                  </TableCell>
                  <TableCell className="text-content-secondary max-w-xs">
                    <span className="block line-clamp-2 leading-5">{po.items}</span>
                  </TableCell>
                  <TableCell align="center" tabular className="font-semibold text-content-primary whitespace-nowrap">
                    {po.quantity} <span className="text-[11px] font-medium text-content-muted">units</span>
                  </TableCell>
                  <TableCell align="right" tabular className="font-semibold text-content-primary whitespace-nowrap">
                    ৳ {po.totalCost.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex min-w-[150px] flex-col items-start gap-1.5">
                      <Badge variant={isReceived ? 'success' : isCustoms ? 'warning' : 'info'} size="sm">
                        <span className="inline-flex items-center gap-1.5">
                          <StatusIcon className="h-3 w-3" aria-hidden="true" />
                          {po.status}
                        </span>
                      </Badge>
                      <span className="inline-flex items-center gap-1 text-[10px] leading-4 text-content-muted">
                        <CalendarDays className="h-3 w-3 shrink-0" aria-hidden="true" />
                        <span className="truncate">{isReceived ? po.expectedDelivery : `Expected ${po.expectedDelivery}`}</span>
                      </span>
                    </div>
                  </TableCell>
                  <TableCell align="center">
                    {!isReceived ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => receivePurchaseOrder(po.id)}
                        leftIcon={<PackageCheck className="h-3.5 w-3.5" aria-hidden="true" />}
                      >
                        Receive Stock
                      </Button>
                    ) : (
                      <Badge variant="neutral" size="sm">
                        Stock Added ✓
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </DataTable>

        <Pagination
          currentPage={page}
          totalItems={filteredPOs.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    )}

      {/* ============================================================== */}
      {/* TAB 2: ADD PURCHASE FORM */}
      {/* ============================================================== */}
      {activeTab === 'add' && (
        <Card className="p-6 max-w-2xl mx-auto space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-boundary-subtle">
            <div className="p-1.5 rounded-lg bg-brand-olive/20 text-brand-dark dark:text-brand-cream">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-content-primary">Create Supplier Purchase Order</h3>
              <p className="text-xs text-content-muted">Issue restock requisition to international vendor or local agency</p>
            </div>
          </div>

          <form onSubmit={handleCreatePOSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1">
                Select Hardware Vendor
              </label>
              <Select
                value={poSupplier}
                onChange={e => setPoSupplier(e.target.value)}
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.name}>
                    {s.name} ({s.country})
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1">
                Component to Restock
              </label>
              <Select
                value={poProduct}
                onChange={e => {
                  setPoProduct(e.target.value);
                  const p = products.find(prod => prod.id === e.target.value);
                  if (p) setPoCost(p.costPrice.toString());
                }}
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Current Inventory: {p.stockCount} units)
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Quantity to Procure"
                type="number"
                min="1"
                required
                value={poQty}
                onChange={e => setPoQty(e.target.value)}
              />
              <Input
                label="Agreed Unit Cost Price (৳)"
                type="number"
                placeholder="Leave blank for standard catalog cost"
                value={poCost}
                onChange={e => setPoCost(e.target.value)}
              />
            </div>

            <Input
              label="Import Notes & C&F Logistics Protocol"
              placeholder="e.g. Air freight transit via DHL Express directly to Banani Vault"
              value={poNotes}
              onChange={e => setPoNotes(e.target.value)}
            />

            <div className="pt-2 flex justify-end gap-2.5">
              <Button variant="outline" size="sm" type="button" onClick={() => setActiveTab('list')}>
                Cancel
              </Button>
              <Button variant="primary" size="md" type="submit">
                <PackageCheck className="w-4 h-4 mr-1.5" />
                Issue Purchase Order
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* ============================================================== */}
      {/* TAB 3: PURCHASE RETURNS */}
      {/* ============================================================== */}
      {activeTab === 'returns' && (
        <Card className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-boundary-subtle">
            <div>
              <h3 className="font-bold text-sm text-content-primary flex items-center gap-2">
                <ArrowDownLeft className="w-4 h-4 text-status-danger" />
                Supplier RMA Dispatches & Warranty Replacements
              </h3>
              <p className="text-xs text-content-muted mt-0.5">
                Defective component return consignments dispatched back to Singapore / HK distributor authorized service centers
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => alert("Recorded new RMA claim RMA-2026-089 for ASUS APAC warranty replacement.")}
            >
              <Plus className="w-4 h-4 mr-1" />
              Record RMA Return
            </Button>
          </div>

          <DataTable isEmpty={false}>
            <TableHeader>
              <tr>
                <TableHeadCell>RMA # & Date</TableHeadCell>
                <TableHeadCell>Supplier / Vendor</TableHeadCell>
                <TableHeadCell>Item Returned</TableHeadCell>
                <TableHeadCell>Defect Reason</TableHeadCell>
                <TableHeadCell align="right">Credit Value (৳)</TableHeadCell>
                <TableHeadCell align="center">RMA Status</TableHeadCell>
              </tr>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <div className="font-mono font-bold text-content-primary">RMA-2026-081</div>
                  <div className="text-[11px] text-content-muted">12/09/2026</div>
                </TableCell>
                <TableCell className="font-medium text-content-primary">
                  ASUS Regional Distribution (Singapore)
                </TableCell>
                <TableCell className="text-content-secondary">
                  2x ASUS ROG Strix GeForce RTX 4080 Super
                </TableCell>
                <TableCell className="text-status-danger text-xs">
                  Memory Artifacting on Cold Boot
                </TableCell>
                <TableCell align="right" tabular className="font-bold text-content-primary">
                  ৳ 290,000
                </TableCell>
                <TableCell align="center">
                  <Badge variant="success" size="sm">
                    Replacement Received ✓
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="font-mono font-bold text-content-primary">RMA-2026-082</div>
                  <div className="text-[11px] text-content-muted">28/09/2026</div>
                </TableCell>
                <TableCell className="font-medium text-content-primary">
                  Intel Authorized Distributor (BD Hub)
                </TableCell>
                <TableCell className="text-content-secondary">
                  1x Intel Core i9-14900K Processor
                </TableCell>
                <TableCell className="text-status-danger text-xs">
                  Vmin Instability / Crash under Prime95
                </TableCell>
                <TableCell align="right" tabular className="font-bold text-content-primary">
                  ৳ 62,000
                </TableCell>
                <TableCell align="center">
                  <Badge variant="info" size="sm">
                    Credit Note Reconciled
                  </Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </DataTable>
        </Card>
      )}
    </div>
  );
};
