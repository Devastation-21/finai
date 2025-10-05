"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, X } from "lucide-react";
import { BudgetCategory } from "@/hooks/useBudgetData";
import { EXPENSE_CATEGORIES } from "@/lib/categories";

interface BudgetCategoryFormProps {
  onSave: (category: Omit<BudgetCategory, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  editingCategory?: BudgetCategory | null;
  onCancel?: () => void;
}

export function BudgetCategoryForm({ onSave, editingCategory, onCancel }: BudgetCategoryFormProps) {
  const [formData, setFormData] = useState({
    category_name: editingCategory?.category_name || "",
    budget_amount: editingCategory?.budget_amount?.toString() || "",
    period: editingCategory?.period || "monthly",
    alert_threshold: editingCategory?.alert_threshold?.toString() || "80"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category_name || !formData.budget_amount) return;

    setIsLoading(true);
    try {
      await onSave({
        category_name: formData.category_name,
        budget_amount: parseFloat(formData.budget_amount),
        spent_amount: editingCategory?.spent_amount || 0,
        period: formData.period as 'weekly' | 'monthly' | 'yearly',
        alert_threshold: parseInt(formData.alert_threshold),
        is_active: true
      });
      
      setFormData({
        category_name: "",
        budget_amount: "",
        period: "monthly",
        alert_threshold: "80"
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Error saving budget category:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      category_name: "",
      budget_amount: "",
      period: "monthly",
      alert_threshold: "80"
    });
    setIsOpen(false);
    onCancel?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {editingCategory ? 'Edit' : 'Add'} Budget
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingCategory ? 'Edit Budget Category' : 'Add Budget Category'}
          </DialogTitle>
          <DialogDescription>
            {editingCategory 
              ? 'Update your budget category settings.' 
              : 'Create a new budget category to track your spending.'
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="category_name">Category Name</Label>
              <Select
                value={formData.category_name}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category_name: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="budget_amount">Budget Amount (₹)</Label>
              <Input
                id="budget_amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.budget_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, budget_amount: e.target.value }))}
                placeholder="0.00"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="period">Period</Label>
              <Select
                value={formData.period}
                onValueChange={(value) => setFormData(prev => ({ ...prev, period: value as 'weekly' | 'monthly' | 'yearly' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="alert_threshold">Alert Threshold (%)</Label>
              <Input
                id="alert_threshold"
                type="number"
                min="0"
                max="100"
                value={formData.alert_threshold}
                onChange={(e) => setFormData(prev => ({ ...prev, alert_threshold: e.target.value }))}
                placeholder="80"
              />
              <p className="text-xs text-muted-foreground">
                Get notified when you reach this percentage of your budget
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
