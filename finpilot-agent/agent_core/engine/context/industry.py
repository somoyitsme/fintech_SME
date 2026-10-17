"""
Domain-specific financial intelligence and operational benchmarks for various SME verticals.
Enables FinPilot to 'self-train' and immediately understand the operational realities of any business.
"""

INDUSTRY_PROFILES = {
    "Computer Wholesale & Retail": {
        "sector": "Technology Hardware",
        "key_inventory_types": ["Graphics Cards (GPUs)", "Processors (CPUs)", "NVMe SSDs", "Motherboards", "RAM Modules"],
        "critical_cost_drivers": ["Port Customs Duties & AIT", "Showroom Leases", "Container Freight", "Warranty Buffers"],
        "working_capital_cycle": "45-60 days (sea shipment lead times + retail channel distribution)",
        "optimal_financing": "IT Supply Chain Invoice Factoring & Revolving Unsecured Credit (WeBank Weiyedai)",
        "tax_concerns": ["Mushak 9.1 VAT credits", "Advance Income Tax (AIT) customs clearance offsets", "5% ICT preferential rate"]
    },
    "Pharmacy & Healthcare": {
        "sector": "Pharmaceutical Retail & Distribution",
        "key_inventory_types": ["Prescription Antibiotics", "Chronic Care Medications", "Cold Chain Insulin/Biologics", "Surgical Supplies"],
        "critical_cost_drivers": ["Cold-Chain Refrigeration & Logistics", "Batch Expiration Write-offs", "DGDA Price Ceilings (MRP)", "Pharmacy Licensing Fees"],
        "working_capital_cycle": "15-30 days (rapid retail cash turnover, Net 45 hospital credit)",
        "optimal_financing": "Pharma Distributor Trade Credit & Healthcare Working Capital Lines",
        "tax_concerns": ["Essential medicine VAT exemptions", "Withholding tax on corporate hospital deliveries", "Health cess"]
    },
    "Restaurant & Food Service": {
        "sector": "Food & Beverage / Hospitality",
        "key_inventory_types": ["Perishable Meat & Dairy", "Dry Goods & Staples", "Beverages", "Packaging Supplies"],
        "critical_cost_drivers": ["Food Waste & Spoilage", "Kitchen Staff Shift Wages", "Prime Retail Foot-Traffic Lease", "Utility Bills (Gas & Power)"],
        "working_capital_cycle": "3-7 days (daily perishable purchases, immediate customer payment via Cash/MFS/Card)",
        "optimal_financing": "Merchant Cash Advance & Short-Term Seasonal Working Capital",
        "tax_concerns": ["Restaurant VAT (7.5% or 10%)", "MFS payment commission reconciliations", "City corporation trade license fees"]
    },
    "Textile & Garments": {
        "sector": "Apparel & Ready-Made Garments (RMG)",
        "key_inventory_types": ["Cotton & Synthetic Yarn", "Dyes & Finishing Chemicals", "Fabric Rolls", "Accessories & Trims"],
        "critical_cost_drivers": ["Factory Labor & Overtime", "Effluent Treatment Plant (ETP)", "L/C Issuance & Bank Commission", "Back-to-Back Container Freight"],
        "working_capital_cycle": "90-120 days (export Letter of Credit sight cycles)",
        "optimal_financing": "Export Packing Credit (EPC), Back-to-Back L/C, Foreign Currency Factoring",
        "tax_concerns": ["Source tax on export proceeds (0.5%-1.0%)", "Bonded warehouse duty exemptions", "Duty drawback claims"]
    },
    "General SME / Trading": {
        "sector": "Wholesale & Retail Trading",
        "key_inventory_types": ["Merchandise", "Consumer Goods", "Equipment", "Supplies"],
        "critical_cost_drivers": ["Warehouse Rent", "Logistics", "Marketing", "Employee Payroll"],
        "working_capital_cycle": "30-45 days",
        "optimal_financing": "WeBank Weiyedai Digital Revolving Line & Invoice Factoring",
        "tax_concerns": ["Corporate Income Tax", "General VAT", "Advance Tax Deductions"]
    }
}

def resolve_industry_profile(industry_query: str) -> dict:
    """Matches industry string to closest rich domain profile."""
    q = (industry_query or "").lower()
    if any(k in q for k in ["computer", "hardware", "electronic", "tech", "silicon", "gpu"]):
        return INDUSTRY_PROFILES["Computer Wholesale & Retail"]
    if any(k in q for k in ["pharm", "health", "med", "drug", "clinic"]):
        return INDUSTRY_PROFILES["Pharmacy & Healthcare"]
    if any(k in q for k in ["food", "restaurant", "cafe", "bakery", "dining", "beverage"]):
        return INDUSTRY_PROFILES["Restaurant & Food Service"]
    if any(k in q for k in ["textile", "garment", "apparel", "rmg", "fabric", "fashion"]):
        return INDUSTRY_PROFILES["Textile & Garments"]
    return INDUSTRY_PROFILES["General SME / Trading"]
