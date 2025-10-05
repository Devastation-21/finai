import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await request.json();

    // Update financial goal
    const { data: goal, error: goalError } = await supabase
      .from('financial_goals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (goalError) {
      console.error('Error updating financial goal:', goalError);
      return NextResponse.json({ error: 'Failed to update financial goal' }, { status: 500 });
    }

    return NextResponse.json(goal);
  } catch (error) {
    console.error('Error in financial goals PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete financial goal
    const { error: goalError } = await supabase
      .from('financial_goals')
      .delete()
      .eq('id', id);

    if (goalError) {
      console.error('Error deleting financial goal:', goalError);
      return NextResponse.json({ error: 'Failed to delete financial goal' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in financial goals DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

