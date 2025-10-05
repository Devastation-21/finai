import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const updates = await request.json();

    // Update budget category
    const { data: category, error: categoryError } = await supabase
      .from('budget_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (categoryError) {
      console.error('Error updating budget category:', categoryError);
      return NextResponse.json({ error: 'Failed to update budget category' }, { status: 500 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error in budget categories PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Delete budget category
    const { error: categoryError } = await supabase
      .from('budget_categories')
      .delete()
      .eq('id', id);

    if (categoryError) {
      console.error('Error deleting budget category:', categoryError);
      return NextResponse.json({ error: 'Failed to delete budget category' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in budget categories DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

