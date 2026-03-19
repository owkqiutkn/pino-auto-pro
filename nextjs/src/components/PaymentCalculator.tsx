"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

const TERM_OPTIONS = [24, 36, 48, 60, 72, 84, 96];
const PAYMENT_FREQUENCIES = ["monthly", "bi-weekly", "weekly"] as const;
type PaymentFrequency = (typeof PAYMENT_FREQUENCIES)[number];

interface PaymentCalculatorProps {
    vehiclePrice: number;
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("en-CA", {
        style: "currency",
        currency: "CAD",
        maximumFractionDigits: 0,
    }).format(value);
}

function parseCurrencyInput(val: string): number {
    const cleaned = val.replace(/[^0-9.]/g, "");
    return Math.max(0, parseFloat(cleaned) || 0);
}

function parsePercentInput(val: string): number {
    const cleaned = val.replace(/[^0-9.]/g, "");
    return Math.max(0, Math.min(100, parseFloat(cleaned) || 0));
}

function calculatePayment(
    principal: number,
    annualRate: number,
    termMonths: number,
    frequency: PaymentFrequency
): number {
    if (principal <= 0) return 0;
    const paymentsPerYear = frequency === "monthly" ? 12 : frequency === "bi-weekly" ? 26 : 52;
    const n = (termMonths / 12) * paymentsPerYear;
    const r = annualRate / 100 / paymentsPerYear;
    if (r === 0) return principal / n;
    return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export default function PaymentCalculator({ vehiclePrice }: PaymentCalculatorProps) {
    const t = useTranslations("Inventory.carDetail.paymentCalculator");
    const [collapsed, setCollapsed] = useState(false);
    const [tradeIn, setTradeIn] = useState("");
    const [salesTax, setSalesTax] = useState("0");
    const [downPayment, setDownPayment] = useState("");
    const [term, setTerm] = useState(96);
    const [frequency, setFrequency] = useState<PaymentFrequency>("bi-weekly");
    const [interestRate, setInterestRate] = useState("9.99");

    const balanceToFinance = useMemo(() => {
        const tradeInVal = parseCurrencyInput(tradeIn);
        const downVal = parseCurrencyInput(downPayment);
        const taxPct = parsePercentInput(salesTax);
        const taxable = vehiclePrice - tradeInVal;
        const taxAmount = taxable * (taxPct / 100);
        const balance = vehiclePrice - tradeInVal - downVal + taxAmount;
        return Math.max(0, balance);
    }, [vehiclePrice, tradeIn, downPayment, salesTax]);

    const paymentAmount = useMemo(() => {
        const rate = parsePercentInput(interestRate);
        return calculatePayment(balanceToFinance, rate, term, frequency);
    }, [balanceToFinance, interestRate, term, frequency]);

    const frequencyLabel =
        frequency === "monthly"
            ? t("monthly")
            : frequency === "bi-weekly"
            ? t("biWeekly")
            : t("weekly");

    return (
        <div className="rounded-lg border border-gray-200 bg-white">
            {/* Collapsible header */}
            <button
                type="button"
                onClick={() => setCollapsed((c) => !c)}
                className="flex w-full items-center justify-between rounded-t-lg border-b border-gray-200 bg-white px-4 py-3 text-left transition-colors hover:bg-gray-50"
            >
                <span className="flex items-center gap-2 font-bold text-[#dc2626]">
                    <span className="text-lg">$</span>
                    {t("title")}
                </span>
                <svg
                    className={`h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200 ${
                        collapsed ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 15l7-7 7 7"
                    />
                </svg>
            </button>

            {!collapsed && (
                <div className="space-y-4 p-4">
                    {/* Vehicle Price (read-only) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            {t("vehiclePrice")}
                        </label>
                        <div className="mt-1 text-lg font-bold text-[#dc2626]">
                            {formatCurrency(vehiclePrice)}
                        </div>
                    </div>

                    {/* Trade-In + Sales Tax */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                {t("tradeInPrice")}
                            </label>
                            <div className="mt-1 flex rounded-md border border-gray-300 shadow-sm">
                                <span className="inline-flex items-center rounded-l-md border-r border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                                    $
                                </span>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={tradeIn}
                                    onChange={(e) => setTradeIn(e.target.value)}
                                    placeholder="0"
                                    className="block w-full rounded-r-md border-0 py-2 pr-3 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-gray-300 sm:text-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                {t("salesTax")}
                            </label>
                            <div className="mt-1 flex rounded-md border border-gray-300 shadow-sm">
                                <span className="inline-flex items-center rounded-l-md border-r border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                                    %
                                </span>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={salesTax}
                                    onChange={(e) => setSalesTax(e.target.value)}
                                    className="block w-full rounded-r-md border-0 py-2 pr-3 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-gray-300 sm:text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Down Payment */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            {t("downPayment")}
                        </label>
                        <div className="mt-1 flex rounded-md border border-gray-300 shadow-sm">
                            <span className="inline-flex items-center rounded-l-md border-r border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                                $
                            </span>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={downPayment}
                                onChange={(e) => setDownPayment(e.target.value)}
                                placeholder="0"
                                className="block w-full rounded-r-md border-0 py-2 pr-3 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-gray-300 sm:text-sm"
                            />
                        </div>
                    </div>

                    {/* Balance to Finance (read-only) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            {t("balanceToFinance")}
                        </label>
                        <div className="mt-1 text-lg font-bold text-[#dc2626]">
                            {formatCurrency(balanceToFinance)}
                        </div>
                    </div>

                    {/* Term + Payment Frequency */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                {t("term")}
                            </label>
                            <select
                                value={term}
                                onChange={(e) => setTerm(Number(e.target.value))}
                                className="mt-1 block w-full rounded-md border border-gray-300 py-2 pl-3 pr-8 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                            >
                                {TERM_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                {t("paymentFrequency")}
                            </label>
                            <select
                                value={frequency}
                                onChange={(e) =>
                                    setFrequency(e.target.value as PaymentFrequency)
                                }
                                className="mt-1 block w-full rounded-md border border-gray-300 py-2 pl-3 pr-8 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                            >
                                {PAYMENT_FREQUENCIES.map((f) => (
                                    <option key={f} value={f}>
                                        {f === "monthly"
                                            ? t("monthly")
                                            : f === "bi-weekly"
                                            ? t("biWeekly")
                                            : t("weekly")}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Interest Rate */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            {t("interestRate")}
                        </label>
                        <div className="mt-1 flex rounded-md border border-gray-300 shadow-sm">
                            <span className="inline-flex items-center rounded-l-md border-r border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                                %
                            </span>
                            <input
                                type="text"
                                inputMode="decimal"
                                value={interestRate}
                                onChange={(e) => setInterestRate(e.target.value)}
                                className="block w-full rounded-r-md border-0 py-2 pr-3 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-gray-300 sm:text-sm"
                            />
                        </div>
                    </div>

                    <p className="text-xs text-gray-500">{t("disclaimer")}</p>

                    {/* Result */}
                    <div className="rounded-md bg-red-50 px-4 py-3">
                        <p className="text-sm font-medium text-gray-700">
                            {t("recurringPayment")}
                        </p>
                        <p className="mt-1 text-xl font-bold text-[#dc2626]">
                            {formatCurrency(paymentAmount)} / {frequencyLabel}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
