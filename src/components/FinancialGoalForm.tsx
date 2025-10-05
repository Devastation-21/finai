"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, X } from "lucide-react";
import { FinancialGoal } from "@/hooks/useBudgetData";

interface FinancialGoalFormProps {
  onSave: (goal: Omit<FinancialGoal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  editingGoal?: FinancialGoal | null;
  onCancel?: () => void;
}

export function FinancialGoalForm({ onSave, editingGoal, onCancel }: FinancialGoalFormProps) {
  const [formData, setFormData] = useState({
    title: editingGoal?.title || "",
    description: editingGoal?.description || "",
    target_amount: editingGoal?.target_amount?.toString() || "",
    current_amount: editingGoal?.current_amount?.toString() || "",
    deadline: editingGoal?.deadline || "",
    goal_type: editingGoal?.goal_type || "savings",
    priority: editingGoal?.priority || "medium"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.target_amount) return;

    setIsLoading(true);
    try {
      await onSave({
        title: formData.title,
        description: formData.description || undefined,
        target_amount: parseFloat(formData.target_amount),
        current_amount: parseFloat(formData.current_amount) || 0,
        deadline: formData.deadline || undefined,
        goal_type: formData.goal_type as any,
        priority: formData.priority as any,
        is_achieved: false
      });
      
      setFormData({
        title: "",
        description: "",
        target_amount: "",
        current_amount: "",
        deadline: "",
        goal_type: "savings",
        priority: "medium"
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Error saving financial goal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: "",
      description: "",
      target_amount: "",
      current_amount: "",
      deadline: "",
      goal_type: "savings",
      priority: "medium"
    });
    setIsOpen(false);
    onCancel?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {editingGoal ? 'Edit' : 'Add'} Goal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingGoal ? 'Edit Financial Goal' : 'Add Financial Goal'}
          </DialogTitle>
          <DialogDescription>
            {editingGoal 
              ? 'Update your financial goal details.' 
              : 'Set a new financial goal to work towards.'
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Goal Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Emergency Fund"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your goal..."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="target_amount">Target Amount (₹)</Label>
                <Input
                  id="target_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.target_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_amount: e.target.value }))}
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="current_amount">Current Amount (₹)</Label>
                <Input
                  id="current_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.current_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, current_amount: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="deadline">Deadline (Optional)</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="goal_type">Goal Type</Label>
                <Select
                  value={formData.goal_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, goal_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="savings">Savings</SelectItem>
                    <SelectItem value="debt_payment">Debt Payment</SelectItem>
                    <SelectItem value="investment">Investment</SelectItem>
                    <SelectItem value="purchase">Purchase</SelectItem>
                    <SelectItem value="emergency_fund">Emergency Fund</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : editingGoal ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

