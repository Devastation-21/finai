"use client";

import React from "react";
import { FinancialMetrics } from "./FinancialMetrics";
import { SpendingChart } from "./SpendingChart";
import { TransactionList } from "./TransactionList";
import { FinancialMetrics as FinancialMetricsType, SpendingCategory, Transaction } from "@/types";

interface DashboardProps {
  metrics: FinancialMetricsType;
  spendingData: SpendingCategory[];
  transactions: Transaction[];
}

export function Dashboard({ metrics, spendingData, transactions }: DashboardProps) {
  return (
    <div className="space-y-6">
      {/* Financial Metrics */}
      <FinancialMetrics metrics={metrics} />
      
      {/* Charts and Transactions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Chart */}
        <SpendingChart data={spendingData} />
        
        {/* Transaction List */}
        <TransactionList transactions={transactions} />
      </div>
    </div>
  );
}


