<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Invoice {{ $invoice->invoice_number }}</title>
<style>
  @page { margin: 20px; }
  body { font-family: 'DejaVu Sans', sans-serif; font-size: 10px; color: #333; line-height: 1.4; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #059669; }
  .company-info h1 { font-size: 18px; color: #059669; margin: 0 0 4px; }
  .company-info p { margin: 1px 0; color: #666; font-size: 9px; }
  .invoice-title { text-align: right; }
  .invoice-title h2 { font-size: 22px; color: #059669; margin: 0; }
  .invoice-title p { margin: 2px 0; font-size: 9px; color: #666; }
  .info-row { display: flex; justify-content: space-between; margin-bottom: 15px; }
  .info-block { width: 48%; }
  .info-block h3 { font-size: 10px; color: #059669; margin: 0 0 5px; padding-bottom: 3px; border-bottom: 1px solid #ddd; text-transform: uppercase; }
  .info-block p { margin: 2px 0; font-size: 9px; color: #555; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
  th { background: #059669; color: #fff; padding: 6px 8px; text-align: left; font-size: 9px; text-transform: uppercase; }
  th:last-child { text-align: right; }
  th:nth-child(3) { text-align: right; }
  th:nth-child(4) { text-align: right; }
  td { padding: 5px 8px; border-bottom: 1px solid #eee; font-size: 9px; }
  td:last-child { text-align: right; }
  td:nth-child(3) { text-align: right; }
  td:nth-child(4) { text-align: right; }
  .totals { width: 280px; margin-left: auto; }
  .totals td { border: none; padding: 3px 8px; }
  .totals td:first-child { text-align: left; }
  .totals td:last-child { text-align: right; }
  .totals .grand td { font-weight: bold; font-size: 11px; border-top: 2px solid #059669; padding-top: 6px; color: #059669; }
  .footer { text-align: center; color: #999; font-size: 8px; margin-top: 25px; padding-top: 10px; border-top: 1px solid #ddd; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 3px; font-size: 8px; font-weight: bold; text-transform: uppercase; }
  .badge-paid { background: #059669; color: #fff; }
  .badge-unpaid { background: #dc2626; color: #fff; }
  .badge-partial { background: #d97706; color: #fff; }
  .status-row { margin-top: 5px; }
  .receipts-list { margin-top: 15px; }
  .receipts-list h3 { font-size: 10px; color: #059669; margin: 0 0 5px; padding-bottom: 3px; border-bottom: 1px solid #ddd; }
  .receipt-item { font-size: 9px; color: #555; margin: 2px 0; }
</style>
</head>
<body>
  <div class="header">
    <div class="company-info">
      <h1>{{ $tenant->name ?? 'Company Name' }}</h1>
      @if($tenant->address)<p>{{ $tenant->address }}</p>@endif
      @if($tenant->email)<p>{{ $tenant->email }}</p>@endif
      @if($tenant->phone)<p>{{ $tenant->phone }}</p>@endif
    </div>
    <div class="invoice-title">
      <h2>INVOICE</h2>
      <p><strong>{{ $invoice->invoice_number }}</strong></p>
      <div class="status-row">
        @php
          $badgeClass = 'badge-unpaid';
          if ($invoice->payment_status === 'paid') $badgeClass = 'badge-paid';
          elseif ($invoice->payment_status === 'partial') $badgeClass = 'badge-partial';
        @endphp
        <span class="badge {{ $badgeClass }}">{{ strtoupper($invoice->payment_status ?? 'unpaid') }}</span>
      </div>
    </div>
  </div>

  <div class="info-row">
    <div class="info-block">
      <h3>Bill To</h3>
      <p><strong>{{ $invoice->customer->name ?? 'Walk-in Customer' }}</strong></p>
      @if($invoice->customer?->address)<p>{{ $invoice->customer->address }}</p>@endif
      @if($invoice->customer?->email)<p>{{ $invoice->customer->email }}</p>@endif
      @if($invoice->customer?->phone)<p>{{ $invoice->customer->phone }}</p>@endif
      @if($invoice->customer?->tax_id)<p>Tax ID: {{ $invoice->customer->tax_id }}</p>@endif
    </div>
    <div class="info-block">
      <h3>Invoice Details</h3>
      <p><strong>Date:</strong> {{ $invoice->issue_date->format('d M Y') }}</p>
      @if($invoice->due_date)<p><strong>Due Date:</strong> {{ $invoice->due_date->format('d M Y') }}</p>@endif
      <p><strong>Status:</strong> {{ ucfirst($invoice->status) }}</p>
      @if($invoice->payment_method)
      <p><strong>Payment Method:</strong> {{ ucfirst(str_replace('_', ' ', $invoice->payment_method)) }}</p>
      @endif
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:50%">Description</th>
        <th style="width:12%;text-align:center">Qty</th>
        <th style="width:16%">Unit Price</th>
        <th style="width:22%">Amount</th>
      </tr>
    </thead>
    <tbody>
      @foreach($invoice->items as $item)
      <tr>
        <td>{{ $item->description }}</td>
        <td style="text-align:center">{{ number_format($item->quantity, 0) }}</td>
        <td>{{ number_format($item->unit_price, 0) }}</td>
        <td>{{ number_format($item->total, 0) }}</td>
      </tr>
      @endforeach
    </tbody>
  </table>

  <table class="totals">
    <tr>
      <td>Subtotal</td>
      <td>{{ number_format($invoice->subtotal, 0) }}</td>
    </tr>
    @if($invoice->discount > 0)
    <tr>
      <td>Discount</td>
      <td>({{ number_format($invoice->discount, 0) }})</td>
    </tr>
    @endif
    @if($invoice->tax > 0)
    <tr>
      <td>Tax</td>
      <td>{{ number_format($invoice->tax, 0) }}</td>
    </tr>
    @endif
    <tr class="grand">
      <td>Total</td>
      <td>{{ number_format($invoice->total, 0) }} {{ $invoice->currency ?? 'RWF' }}</td>
    </tr>
    @if($invoice->paid_amount > 0)
    <tr>
      <td>Paid</td>
      <td>({{ number_format($invoice->paid_amount, 0) }})</td>
    </tr>
    <tr>
      <td>Balance Due</td>
      <td>{{ number_format($invoice->balance_due, 0) }}</td>
    </tr>
    @endif
  </table>

  @if($invoice->receipts->count() > 0)
  <div class="receipts-list">
    <h3>Payment Receipts</h3>
    @foreach($invoice->receipts as $receipt)
    <div class="receipt-item">
      {{ $receipt->receipt_number }} &mdash; {{ number_format($receipt->amount, 0) }} {{ $invoice->currency ?? 'RWF' }}
      &mdash; {{ ucfirst(str_replace('_', ' ', $receipt->payment_method)) }}
      &mdash; {{ $receipt->receipt_date }}
    </div>
    @endforeach
  </div>
  @endif

  @if($invoice->notes)
  <div style="margin-top:15px;padding:8px;background:#f9f9f9;border-left:3px solid #059669;font-size:9px;color:#666;">
    <strong>Notes:</strong><br>{{ $invoice->notes }}
  </div>
  @endif

  <div class="footer">
    <p>Generated on {{ now()->format('d M Y H:i') }} | {{ $tenant->name ?? '' }}</p>
  </div>
</body>
</html>
