# FinPilot: 5-Minute Demonstration Video Script

**Contest Track:** 2026 Shenzhen International FinTech Competition (FinTechathon)  
**Submission Requirement:** Demo Video ≤ 5 Minutes (English Audio / Subtitles)

---

## Video Timeline & On-Screen Demonstration Guide

### Minute 0:00 - 0:45: Introduction & Live Cockpit
- **Visual**: Screen recording of `http://localhost:8000` (FinPilot Dashboard).
- **Voiceover**:
  > "Welcome to FinPilot — the Autonomous AI SME Finance Copilot. We are looking at the live dashboard for Shenzhen Nebula Tech Co., Ltd., a growing technology SME.  
  > At a glance, the CEO can see their real cash balance of 842,500 CNY, monthly burn of 323,900 CNY, and a critical 2.6-month cash runway."

### Minute 0:45 - 1:45: Scenario A — 60-Day Forecasting & Day 45 Liquidity Alert
- **Action**: Click on the **Cash Flow & Runway** tab. Show the interactive Recharts forecast.
- **Visual**: Point cursor to the **Day 45 dip** breaching the red dashed ¥300,000 threshold line. Move the **Scenario Stress-Testing Slider** ("Client Payment Delay: 15 Days Late") to show real-time dynamic curve recalculation.
- **Voiceover**:
  > "Under the Cash Flow engine, FinPilot uses historical burn and invoice payment milestones to project liquidity with a 95% confidence interval.  
  > Notice the system has proactively flagged a Day 45 liquidity dip, caused by quarterly corporate income tax prepayments and payroll cycles.  
  > With our interactive stress simulator, the CFO can immediately test what happens if client payments are delayed by 15 days."

### Minute 1:45 - 2:45: Scenario B — Overdue Receivables & AI Payment Reminders
- **Action**: Click on **Invoices & Receivables** tab. Filter by "Overdue".
- **Visual**: Show Greater Bay Logistics (10 days overdue, ¥165,000) and Global Pioneer Electronics (5 days overdue, ¥88,000). Click the **PDF icon** to show the professional ReportLab invoice. Click the **AI Reminder button**, select "Firm" tone, and click "Generate & Dispatch AI Email".
- **Voiceover**:
  > "Next, let’s resolve uncollected cash. In the Invoices tab, FinPilot flags 268,180 CNY in overdue accounts receivable.  
  > With one click, we can download a verified PDF invoice or instruct the Copilot to draft a collection notice. Selecting a 'Firm' tone, the agent writes an assertive, legally sound reminder and queues it for dispatch."

### Minute 2:45 - 3:45: Scenario C — WeBank Weiyedai & Credit Matching
- **Action**: Click on **Financing Matcher** tab. Highlight **WeBank Weiyedai (微业贷)**.
- **Visual**: Point to the "92% Pre-Approval Odds" and "< 5 min approval speed". Click "Check Pre-Qualification" to show the modal with the pre-qualified ¥750,000 credit line.
- **Voiceover**:
  > "To bridge the Day 45 cash dip without giving away equity, we visit the Financing Matcher.  
  > FinPilot features **WeBank Weiyedai (微业贷)** — China’s premier 100% digital unsecured loan. Because FinPilot has continuous access to Nebula Tech's verified tax filings and invoice records, WeBank pre-qualifies them with a 92% likelihood for an instant unsecured revolving line."

### Minute 3:45 - 4:30: Scenario D — 1-Line Embeddable SDK in 3rd-Party ERP
- **Action**: Navigate to `http://localhost:8000/sdk/demo-host.html`.
- **Visual**: Show a simulated generic SME ERP portal. Point out the single `<script src="/sdk/loader.js">` tag. Click the floating blue bubble in the bottom right corner; the widget slides up. Type: *"Analyze our cash flow runway"* to show real-time grounded agent answers.
- **Voiceover**:
  > "What if an SME already uses an existing ERP system?  
  > FinPilot provides a universal 1-line embeddable SDK (`loader.js`). Here, we see a simulated third-party ERP. With just one script tag, the entire FinPilot multi-agent copilot is live in an isolated iframe, allowing any software vendor to offer AI finance to their customers immediately."

### Minute 4:30 - 5:00: Summary & Security Wrap-Up
- **Visual**: Show test suite passing with 21 tests and the audit log.
- **Voiceover**:
  > "FinPilot combines predictive forecasting, autonomous invoice chasing, WeBank digital lending, and an 8-layer enterprise security pipeline.  
  > Thank you for watching!"
