# InventOS Rwanda
# Step-by-Step Production Execution Guide

Version: 2.0
Architecture: Multi-Tenant SaaS
Strategy: Phase-Based Development
Goal: Prevent Logic Mixing & Simplify Scaling

---

# IMPORTANT DEVELOPMENT STRATEGY

This project MUST NOT be developed randomly.

The project MUST follow:
- isolated phases
- isolated responsibilities
- isolated logic
- isolated modules
- isolated testing
- isolated deployment validation

This prevents:
- code chaos
- mixed logic
- scaling problems
- debugging complexity
- broken architecture
- technical debt

---

# CORE DEVELOPMENT RULES

```rules
- Never start a new phase before stabilizing the current phase
- Never mix accounting logic with inventory logic
- Never mix UI logic with backend logic
- Never connect AI before business logic is stable
- Never implement analytics before data integrity exists
- Every phase must pass testing before continuing
- Every module must have isolated APIs
- Every module must have isolated services
- Every module must have isolated database responsibilities
- Every feature requires audit logging
MASTER PROJECT STRUCTURE
Backend Structure
app/
modules/
    auth/
    inventory/
    accounting/
    invoices/
    sales/
    suppliers/
    reports/
    ai/
services/
repositories/
dto/
jobs/
events/
listeners/
Mobile Structure
src/
features/
    auth/
    inventory/
    accounting/
    invoices/
    sales/
    suppliers/
    reports/
    ai/
components/
storage/
sync/
services/
navigation/
hooks/
DEVELOPMENT FLOW

Each phase MUST follow:

Requirements
Database Design
Backend APIs
Business Logic
Mobile UI
Offline Logic
Testing
Error Handling
Security Validation
Performance Optimization
Deployment Validation

Never skip order.

PHASE 0 — PROJECT FOUNDATION

Duration:
1–2 Weeks

Goal:
Create stable architecture foundation.

IMPORTANT:
No business features allowed in this phase.

PHASE 0 TASKS
Infrastructure Setup

Tasks:

create repositories
configure git strategy
setup Laravel backend
setup React Native app
setup PostgreSQL
setup Redis
setup Docker
setup CI/CD
setup environments

Deliverables:

running backend
running mobile app
connected database
deployment pipeline
PHASE 0 DATABASE TASKS

Only create:

users
tenants
roles
permissions
audit_logs

DO NOT CREATE:

inventory
accounting
invoices
sales
PHASE 0 AUTH TASKS

Features:

login
logout
password reset
OTP verification
RBAC
session management
PHASE 0 AI AGENT PROMPT
Act as a senior enterprise system architect.

Your responsibility is ONLY infrastructure foundation.

Tasks:
- Laravel project setup
- React Native setup
- PostgreSQL configuration
- Multi-tenant foundation
- Authentication system
- RBAC
- Audit logging
- Docker configuration
- CI/CD setup

STRICT RULES:
- Do NOT build inventory logic
- Do NOT build accounting logic
- Do NOT build invoice logic
- Do NOT generate analytics
- Focus ONLY on stable architecture foundation
PHASE 1 — INVENTORY CORE

Duration:
3–5 Weeks

Goal:
Build isolated inventory engine.

IMPORTANT:
No accounting allowed in this phase.

PHASE 1 MODULES

Allowed:

products
categories
warehouses
stock movements
barcode scanning
stock adjustments

Forbidden:

accounting
invoices
AI analytics
customer debts
PHASE 1 DATABASE TABLES

Create:

products
categories
warehouses
stock_movements
inventory_adjustments

Do NOT create:

journal_entries
invoices
expenses
PHASE 1 BACKEND TASKS

Tasks:

inventory APIs
stock services
warehouse services
barcode support
inventory logs
stock validation
PHASE 1 MOBILE TASKS

Screens:

products list
product details
stock movement
warehouse management
barcode scanner
PHASE 1 OFFLINE TASKS

Tasks:

SQLite setup
offline stock cache
sync queue
retry engine
PHASE 1 ERROR HANDLING

Handle:

duplicate products
invalid stock
sync conflicts
offline conflicts
negative stock
PHASE 1 TESTING

Required:

API tests
inventory movement tests
offline sync tests
barcode tests
PHASE 1 AI AGENT PROMPT
Act as a senior inventory SaaS architect.

Build ONLY the inventory core system.

Allowed Features:
- products
- categories
- warehouses
- stock movements
- barcode scanning
- offline synchronization

STRICT RULES:
- Do NOT implement accounting
- Do NOT implement invoices
- Do NOT implement AI analytics
- Do NOT implement customer debts
- Keep inventory isolated
- Use transactional integrity
- Every stock movement requires audit logs
PHASE 2 — SALES SYSTEM

Duration:
3–5 Weeks

Goal:
Build isolated sales engine.

IMPORTANT:
Still no accounting engine.

PHASE 2 MODULES

Allowed:

invoices
quotations
receipts
returns
discounts
customer sales

Forbidden:

bookkeeping
AI analytics
financial reports
PHASE 2 DATABASE TABLES

Create:

invoices
invoice_items
quotations
receipts
customers

Do NOT create:

journal_entries
balance_sheets
profit_loss
PHASE 2 BACKEND TASKS

Tasks:

invoice APIs
quotation APIs
receipt generation
PDF exports
customer sales history
PHASE 2 MOBILE TASKS

Screens:

create invoice
invoice history
customer details
quotations
receipts
PHASE 2 ERROR HANDLING

Handle:

duplicate invoices
invalid totals
invoice sync conflicts
invalid discounts
PHASE 2 TESTING

Required:

invoice calculations
receipt generation
PDF generation
offline sales
PHASE 2 AI AGENT PROMPT
Act as a senior SaaS sales system architect.

Build ONLY the sales engine.

Allowed Features:
- invoices
- quotations
- receipts
- customer sales

STRICT RULES:
- Do NOT implement accounting
- Do NOT implement AI analytics
- Do NOT implement financial reports
- Do NOT mix inventory and accounting logic
PHASE 3 — ACCOUNTING ENGINE

Duration:
4–6 Weeks

Goal:
Build isolated accounting infrastructure.

IMPORTANT:
Accounting must remain independent.

PHASE 3 MODULES

Allowed:

chart of accounts
journal entries
expenses
bookkeeping
reconciliation
financial reports

Forbidden:

AI analytics
stock predictions
PHASE 3 DATABASE TABLES

Create:

accounts
journal_entries
transactions
expenses
ledgers
PHASE 3 BACKEND TASKS

Tasks:

accounting APIs
journal services
reconciliation services
financial calculations
PHASE 3 MOBILE TASKS

Screens:

expenses
ledgers
reports
transactions
PHASE 3 ERROR HANDLING

Handle:

unbalanced journals
duplicate transactions
reconciliation mismatches
invalid reports
PHASE 3 TESTING

Required:

journal balancing
accounting integrity
financial calculations
reconciliation tests
PHASE 3 AI AGENT PROMPT
Act as a senior accounting SaaS architect.

Build ONLY the accounting engine.

Allowed Features:
- chart of accounts
- journal entries
- bookkeeping
- expenses
- reconciliation

STRICT RULES:
- Do NOT build AI analytics
- Do NOT build stock forecasting
- Do NOT mix accounting with UI logic
- Maintain transactional integrity
- Every financial action must be auditable
PHASE 4 — INVOICE VAULT

Duration:
2–4 Weeks

Goal:
Build secure invoice storage system.

PHASE 4 MODULES

Allowed:

OCR
document uploads
PDF storage
invoice indexing
search
PHASE 4 TASKS

Tasks:

OCR integration
invoice scanning
claudinary
invoice categorization
document search
PHASE 4 ERROR HANDLING

Handle:

OCR failures
corrupted uploads
duplicate files
storage sync issues
PHASE 4 AI AGENT PROMPT
Act as a senior document management architect.

Build ONLY the invoice vault system.

Allowed Features:
- OCR
- PDF storage
- invoice uploads
- searchable documents

STRICT RULES:
- Do NOT implement accounting analytics
- Do NOT implement AI forecasting
- Focus ONLY on secure document management
PHASE 5 — MOBILE MONEY INTEGRATION

Duration:
2–3 Weeks

Goal:
Integrate Rwanda payment systems.

PHASE 5 TASKS

Tasks:

MTN MoMo
Airtel Money
reconciliation
transaction tracking
PHASE 5 ERROR HANDLING

Handle:

failed payments
duplicate callbacks
timeout handling
reconciliation conflicts
PHASE 5 AI AGENT PROMPT
Act as a fintech integration architect.

Build ONLY Rwanda payment integrations.

Allowed Features:
- MTN MoMo
- Airtel Money
- reconciliation
- transaction validation

STRICT RULES:
- Never expose sensitive financial data
- Validate all payment callbacks
- Prevent duplicate transactions
PHASE 6 — REPORTING ENGINE

Duration:
3–4 Weeks

Goal:
Build centralized reporting.

PHASE 6 TASKS

Tasks:

inventory reports
accounting reports
sales reports
export system
dashboard summaries
PHASE 6 ERROR HANDLING

Handle:

incorrect report calculations
export failures
large query optimization
PHASE 6 AI AGENT PROMPT
Act as a senior reporting architect.

Build ONLY the reporting engine.

Allowed Features:
- reports
- exports
- summaries
- dashboards

STRICT RULES:
- Use optimized queries
- Prevent calculation inconsistencies
- Maintain reporting accuracy
PHASE 7 — AI INTELLIGENCE

Duration:
4–8 Weeks

Goal:
Build AI business intelligence.

IMPORTANT:
AI comes LAST.

Never before stable data integrity.

PHASE 7 TASKS

Tasks:

fraud detection
stock prediction
smart insights
sales forecasting
dead stock analysis
PHASE 7 ERROR HANDLING

Handle:

incorrect predictions
false fraud alerts
incomplete analytics
PHASE 7 AI AGENT PROMPT
Act as an AI business intelligence architect.

Build ONLY the AI intelligence layer.

Allowed Features:
- fraud detection
- stock prediction
- smart recommendations
- sales forecasting

STRICT RULES:
- Use existing validated data only
- Never modify financial records
- AI must remain advisory only
PHASE 8 — COOPERATIVE SYSTEM

Duration:
4–6 Weeks

Goal:
Build Rwanda cooperative workflows.

PHASE 8 TASKS

Tasks:

member inventory
contribution tracking
cooperative reporting
warehouse pooling
FINAL STABILIZATION PHASE

Duration:
2–4 Weeks

Goal:
Production hardening.

Tasks:

penetration testing
load testing
backup validation
scaling optimization
monitoring setup
production deployment
security audits
FINAL RULES
- Never skip testing
- Never skip audit logs
- Never mix module responsibilities
- Never allow direct DB access from frontend
- Never deploy untested financial logic
- Never implement AI before stable data
- Every phase must stabilize before next phase