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

    // Update budget alert (e.g., mark as read)
    const { data: alert, error: alertError } = await supabase
      .from('budget_alerts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (alertError) {
      console.error('Error updating budget alert:', alertError);
      return NextResponse.json({ error: 'Failed to update budget alert' }, { status: 500 });
    }

    return NextResponse.json(alert);
  } catch (error) {
    console.error('Error in budget alerts PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

