import { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, TextInput, View, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import * as salesService from '@/src/services/sales';
import * as Sharing from 'expo-sharing';
import type { Invoice, Receipt } from '@/src/types/sales';

const PAYMENT_METHODS = [
  { key: 'cash', label: 'Cash', icon: 'cash-outline' as const },
  { key: 'mobile_money', label: 'Mobile Money', icon: 'phone-portrait-outline' as const },
  { key: 'bank', label: 'Bank', icon: 'business-outline' as const },
  { key: 'card', label: 'Card', icon: 'card-outline' as const },
  { key: 'cheque', label: 'Cheque', icon: 'document-outline' as const },
];

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentReference, setPaymentReference] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadInvoice();
  }, [id]);

  async function loadInvoice() {
    try {
      const res = await salesService.getInvoice(Number(id));
      setInvoice(res.data);
    } catch {
      Alert.alert('Error', 'Failed to load invoice');
      router.back();
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    if (!invoice) return;
    try {
      const res = await salesService.confirmInvoice(invoice.id);
      setInvoice(res.data);
      Alert.alert('Success', 'Stock deducted. Awaiting payment.');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Failed to confirm');
    }
  }

  async function handleRecordPayment() {
    if (!invoice) return;
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Error', 'Enter a valid payment amount');
      return;
    }
    if (amount > invoice.balance_due) {
      Alert.alert('Error', `Amount cannot exceed balance of RWF ${Number(invoice.balance_due).toLocaleString()}`);
      return;
    }
    setSubmitting(true);
    try {
      const res = await salesService.createReceipt({
        invoice_id: invoice.id,
        customer_id: invoice.customer_id ?? undefined,
        amount,
        payment_method: paymentMethod,
        reference: paymentReference || undefined,
        receipt_date: new Date().toISOString().split('T')[0],
      });
      Alert.alert('Success', `Payment recorded. Receipt ${res.data.receipt_number}`);
      setShowPayment(false);
      setPaymentAmount('');
      setPaymentMethod('cash');
      setPaymentReference('');
      loadInvoice();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? e?.message ?? 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDownloadPdf() {
    if (!invoice) return;
    try {
      const uri = await salesService.downloadInvoicePdf(invoice.id);
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Invoice ${invoice.invoice_number}`,
      });
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to download PDF');
    }
  }

  async function handleViewPdf() {
    if (!invoice) return;
    try {
      await salesService.viewInvoicePdf(invoice.id);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to open PDF');
    }
  }

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-950 items-center justify-center">
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  if (!invoice) return null;

  const receipts: Receipt[] = invoice.receipts ?? [];
  const receiptTotal = receipts.reduce((s, r) => s + Number(r.amount), 0);
  const isDraft = invoice.status === 'draft';
  const isPaid = invoice.payment_status === 'paid' || (receipts.length > 0 && receiptTotal >= invoice.total);
  const isPartial = !isPaid && receiptTotal > 0 && receiptTotal < invoice.total;
  const isConfirmed = invoice.status === 'confirmed' || invoice.status === 'partial';
  const isCredit = invoice.payment_method === 'credit';
  const isUnpaid = isCredit && !isPaid && !isPartial && isConfirmed;
  const paidPercent = invoice.total > 0 ? Math.round(((invoice.paid_amount || receiptTotal) / invoice.total) * 100) : 0;

  function formatMethod(method: string): string {
    return method.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-950" contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#064e3b', '#059669', '#06b884']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1.2 }} className="px-6 pt-12 pb-6 rounded-b-[32px]">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => router.back()} className="w-9 h-9 bg-white/15 rounded-xl items-center justify-center">
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <View className={`px-3 py-1 rounded-full ${isDraft ? 'bg-gray-500' : isPaid ? 'bg-green-500' : 'bg-blue-500'}`}>
            <ThemedText className="text-white text-xs font-bold capitalize">
              {isDraft ? 'Draft' : isPaid ? 'Paid' : isCredit ? 'Awaiting Payment' : 'Completed'}
            </ThemedText>
          </View>
        </View>
        <ThemedText className="text-white/50 text-xs font-medium tracking-widest uppercase">Invoice</ThemedText>
        <ThemedText className="text-white text-2xl font-bold mt-1">{invoice.invoice_number}</ThemedText>
        <View className="flex-row items-center gap-2 mt-3">
          <ThemedText className="text-white/80 text-lg font-bold">RWF {Number(invoice.total).toLocaleString()}</ThemedText>
          {isPaid && (
            <View className="bg-green-400/20 px-2 py-0.5 rounded-full">
              <ThemedText className="text-green-300 text-xs font-bold">PAID</ThemedText>
            </View>
          )}
        </View>
      </LinearGradient>

      <View className="-mt-4 px-4 gap-4">
        <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 flex-row justify-between items-center">
          <View className="flex-1">
            <ThemedText className="text-gray-400 text-xs">Customer</ThemedText>
            <ThemedText className="text-gray-900 dark:text-white font-bold text-sm mt-0.5">
              {invoice.customer?.name ?? 'Walk-in Customer'}
            </ThemedText>
          </View>
          <View className="items-end">
            <ThemedText className="text-gray-400 text-xs">Date</ThemedText>
            <ThemedText className="text-gray-900 dark:text-white text-sm mt-0.5">{invoice.issue_date}</ThemedText>
          </View>
        </View>

        {/* Payment Status Card */}
        <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
          <View className="flex-row items-center gap-3">
            <View className={`w-10 h-10 rounded-xl items-center justify-center ${isPaid ? 'bg-green-100' : isPartial ? 'bg-yellow-100' : isDraft ? 'bg-gray-100' : 'bg-blue-100'}`}>
              <Ionicons name={isPaid ? 'checkmark-circle' : isPartial ? 'time-outline' : isDraft ? 'time-outline' : 'wallet-outline'} size={20} color={isPaid ? '#059669' : isPartial ? '#d97706' : isDraft ? '#9CA3AF' : '#3b82f6'} />
            </View>
            <View className="flex-1">
              <ThemedText className="text-gray-900 dark:text-white font-semibold text-sm capitalize">
                {isPaid ? 'Paid in Full' : isPartial ? 'Partially Paid' : isDraft ? 'Pending Confirmation' : isCredit ? 'Credit - Awaiting Payment' : formatMethod(invoice.payment_method ?? '')}
              </ThemedText>
              <ThemedText className={`text-xs font-medium ${isPaid ? 'text-green-500' : isPartial ? 'text-yellow-500' : isDraft ? 'text-gray-400' : 'text-blue-500'}`}>
                {isPaid ? `RWF ${Number(invoice.paid_amount || receiptTotal).toLocaleString()} received` : isPartial ? `RWF ${Number(invoice.balance_due).toLocaleString()} remaining` : isDraft ? 'Confirm to deduct stock' : `Balance: RWF ${Number(invoice.balance_due).toLocaleString()}`}
              </ThemedText>
            </View>
            {isCredit && !isDraft && (
              <ThemedText className={`font-bold text-sm ${isPaid ? 'text-green-500' : isPartial ? 'text-yellow-500' : 'text-blue-500'}`}>
                {paidPercent}%
              </ThemedText>
            )}
          </View>

          {/* Payment Progress Bar */}
          {isCredit && !isDraft && (
            <View className="mt-3">
              <View className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <View className={`h-full rounded-full ${isPaid ? 'bg-green-500' : isPartial ? 'bg-yellow-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(paidPercent, 100)}%` }} />
              </View>
              <View className="flex-row justify-between mt-1.5">
                <ThemedText className="text-green-600 text-xs font-semibold">Paid: RWF {Number(invoice.paid_amount || receiptTotal).toLocaleString()}</ThemedText>
                <ThemedText className="text-red-500 text-xs font-semibold">Due: RWF {Number(invoice.balance_due).toLocaleString()}</ThemedText>
              </View>
            </View>
          )}
        </View>

        {/* Receipts Section */}
        {receipts.length > 0 && (
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
            <View className="flex-row items-center justify-between mb-3">
              <ThemedText className="text-gray-900 dark:text-white font-bold text-sm">Receipts</ThemedText>
              <ThemedText className="text-gray-400 text-xs">{receipts.length} receipt(s)</ThemedText>
            </View>
            {receipts.map((r, i) => (
              <View key={r.id} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3 mb-2 last:mb-0 flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-lg bg-green-100 items-center justify-center">
                  <Ionicons name="receipt-outline" size={16} color="#059669" />
                </View>
                <View className="flex-1">
                  <ThemedText className="text-gray-900 dark:text-white text-xs font-bold">{r.receipt_number}</ThemedText>
                  <ThemedText className="text-gray-400 text-[10px]">{r.receipt_date} · {formatMethod(r.payment_method)}</ThemedText>
                </View>
                <ThemedText className="text-green-600 font-bold text-xs">RWF {Number(r.amount).toLocaleString()}</ThemedText>
              </View>
            ))}
          </View>
        )}

        {/* Items */}
        <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
          <View className="flex-row items-center justify-between mb-3">
            <ThemedText className="text-gray-900 dark:text-white font-bold text-sm">Items</ThemedText>
            <ThemedText className="text-gray-400 text-xs">{invoice.items?.length ?? 0} item(s)</ThemedText>
          </View>
          {invoice.items?.map((item, i) => (
            <View key={i} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3 mb-2 last:mb-0">
              <View className="flex-row justify-between items-start">
                <View className="flex-1 mr-3">
                  <ThemedText className="text-gray-900 dark:text-white font-semibold text-sm" numberOfLines={2}>{item.description}</ThemedText>
                  <ThemedText className="text-gray-400 text-xs mt-1">
                    {item.quantity} × RWF {Number(item.unit_price).toLocaleString()}
                  </ThemedText>
                </View>
                <ThemedText className="text-gray-900 dark:text-white font-bold text-sm">RWF {Number(item.total).toLocaleString()}</ThemedText>
              </View>
              {(item.discount > 0 || item.tax > 0) && (
                <View className="flex-row gap-2 mt-2">
                  {item.discount > 0 && <ThemedText className="bg-red-50 dark:bg-red-900/20 text-red-500 text-[10px] px-2 py-0.5 rounded-full">-RWF {Number(item.discount).toLocaleString()}</ThemedText>}
                  {item.tax > 0 && <ThemedText className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 text-[10px] px-2 py-0.5 rounded-full">+RWF {Number(item.tax).toLocaleString()}</ThemedText>}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Totals */}
        <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
          <View className="gap-2">
            <View className="flex-row justify-between">
              <ThemedText className="text-gray-400 text-sm">Subtotal</ThemedText>
              <ThemedText className="text-gray-900 dark:text-white">RWF {Number(invoice.subtotal).toLocaleString()}</ThemedText>
            </View>
            {invoice.discount > 0 && (
              <View className="flex-row justify-between">
                <ThemedText className="text-gray-400 text-sm">Discount</ThemedText>
                <ThemedText className="text-red-500">-RWF {Number(invoice.discount).toLocaleString()}</ThemedText>
              </View>
            )}
            {invoice.tax > 0 && (
              <View className="flex-row justify-between">
                <ThemedText className="text-gray-400 text-sm">Tax</ThemedText>
                <ThemedText className="text-gray-900 dark:text-white">+RWF {Number(invoice.tax).toLocaleString()}</ThemedText>
              </View>
            )}
            <View className="border-t border-gray-100 dark:border-gray-700 pt-2 mt-1">
              <View className="flex-row justify-between">
                <ThemedText className="text-gray-900 dark:text-white font-bold text-base">Total</ThemedText>
                <ThemedText className="text-green-600 font-bold text-base">RWF {Number(invoice.total).toLocaleString()}</ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* PDF Actions */}
        <View className="flex-row gap-3">
          <TouchableOpacity onPress={handleViewPdf} className="flex-1 bg-white dark:bg-gray-800 py-4 rounded-2xl items-center active:opacity-80 flex-row justify-center gap-2 border border-gray-200 dark:border-gray-700">
            <Ionicons name="eye-outline" size={18} color="#059669" />
            <ThemedText className="text-emerald-600 font-bold text-base">View PDF</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDownloadPdf} className="flex-1 bg-white dark:bg-gray-800 py-4 rounded-2xl items-center active:opacity-80 flex-row justify-center gap-2 border border-gray-200 dark:border-gray-700">
            <Ionicons name="share-outline" size={18} color="#059669" />
            <ThemedText className="text-emerald-600 font-bold text-base">Share PDF</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Confirm Button — only for draft credit invoices */}
        {isDraft && isCredit && (
          <TouchableOpacity onPress={handleConfirm} className="bg-blue-600 py-4 rounded-2xl items-center active:opacity-80 flex-row justify-center gap-2 shadow-lg shadow-blue-600/30">
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <View>
              <ThemedText className="text-white font-bold text-base">Confirm & Deduct Stock</ThemedText>
              <ThemedText className="text-white/60 text-xs">Product quantities will be updated</ThemedText>
            </View>
          </TouchableOpacity>
        )}

        {/* Record Payment Button — for confirmed unpaid or partially paid credit */}
        {(isUnpaid || isPartial) && !showPayment && (
          <TouchableOpacity onPress={() => { setPaymentAmount(String(invoice.balance_due)); setShowPayment(true); }} className="bg-blue-600 py-4 rounded-2xl items-center active:opacity-80 flex-row justify-center gap-2 shadow-lg shadow-blue-600/30">
            <Ionicons name="wallet-outline" size={20} color="#fff" />
            <View>
              <ThemedText className="text-white font-bold text-base">Record Payment</ThemedText>
              <ThemedText className="text-white/60 text-xs">RWF {Number(invoice.balance_due).toLocaleString()} remaining</ThemedText>
            </View>
          </TouchableOpacity>
        )}

        {/* Payment Form */}
        {(isUnpaid || isPartial) && showPayment && (
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 gap-4">
            <View className="flex-row items-center justify-between">
              <View>
                <ThemedText className="text-gray-900 dark:text-white font-bold text-base">Record Payment</ThemedText>
                <ThemedText className="text-gray-400 text-xs">RWF {Number(invoice.balance_due).toLocaleString()} remaining</ThemedText>
              </View>
              <TouchableOpacity onPress={() => setShowPayment(false)} className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg items-center justify-center">
                <Ionicons name="close" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Quick Amount Buttons */}
            <View className="flex-row gap-2">
              <TouchableOpacity onPress={() => setPaymentAmount(String(invoice.balance_due))} className="flex-1 bg-blue-50 dark:bg-blue-900/20 rounded-xl py-2.5 items-center border border-blue-200 dark:border-blue-800">
                <ThemedText className="text-blue-700 dark:text-blue-400 text-xs font-bold">Full</ThemedText>
                <ThemedText className="text-blue-600 dark:text-blue-300 text-[10px]">RWF {Number(invoice.balance_due).toLocaleString()}</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setPaymentAmount(String(invoice.balance_due / 2))} className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-xl py-2.5 items-center border border-gray-100 dark:border-gray-700">
                <ThemedText className="text-gray-600 dark:text-gray-400 text-xs font-bold">Half</ThemedText>
                <ThemedText className="text-gray-500 dark:text-gray-500 text-[10px]">RWF {Number(invoice.balance_due / 2).toLocaleString()}</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setPaymentAmount('')} className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-xl py-2.5 items-center border border-gray-100 dark:border-gray-700">
                <ThemedText className="text-gray-600 dark:text-gray-400 text-xs font-bold">Custom</ThemedText>
                <ThemedText className="text-gray-500 dark:text-gray-500 text-[10px]">Enter amount</ThemedText>
              </TouchableOpacity>
            </View>

            {/* Amount Input */}
            <View>
              <ThemedText className="text-gray-400 text-xs mb-1.5 font-semibold uppercase tracking-wider">Amount</ThemedText>
              <View className="flex-row items-center bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-3 border border-gray-100 dark:border-gray-700">
                <ThemedText className="text-gray-900 dark:text-white font-bold mr-2">RWF</ThemedText>
                <TextInput
                  className="flex-1 text-gray-900 dark:text-white font-bold text-base"
                  value={paymentAmount}
                  onChangeText={setPaymentAmount}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Payment Method */}
            <View>
              <ThemedText className="text-gray-400 text-xs mb-1.5 font-semibold uppercase tracking-wider">Payment Method</ThemedText>
              <View className="flex-row flex-wrap gap-2">
                {PAYMENT_METHODS.map((m) => (
                  <TouchableOpacity
                    key={m.key}
                    onPress={() => setPaymentMethod(m.key)}
                    className={`flex-row items-center gap-1.5 px-3 py-2 rounded-xl border ${paymentMethod === m.key ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700'}`}
                  >
                    <Ionicons name={m.icon} size={16} color={paymentMethod === m.key ? '#059669' : '#9CA3AF'} />
                    <ThemedText className={`text-xs font-semibold ${paymentMethod === m.key ? 'text-green-700 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>{m.label}</ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Reference */}
            <View>
              <ThemedText className="text-gray-400 text-xs mb-1.5 font-semibold uppercase tracking-wider">Reference (optional)</ThemedText>
              <TextInput
                className="bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm border border-gray-100 dark:border-gray-700"
                value={paymentReference}
                onChangeText={setPaymentReference}
                placeholder="e.g. Transfer ref"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <TouchableOpacity onPress={handleRecordPayment} disabled={submitting} className="bg-green-600 py-3.5 rounded-xl items-center active:opacity-80 flex-row justify-center gap-2 shadow-lg shadow-green-600/30">
              {submitting ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="checkmark-circle" size={18} color="#fff" />}
              <ThemedText className="text-white font-bold text-sm">{submitting ? 'Processing...' : 'Confirm Payment'}</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function statusBadgeBg(status: string): string {
  switch (status) {
    case 'draft': return 'bg-gray-500';
    case 'confirmed': return 'bg-blue-500';
    case 'partial': return 'bg-yellow-500';
    case 'paid': return 'bg-green-500';
    case 'cancelled': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
}
