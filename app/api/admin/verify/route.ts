import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/lib/secure-admin';

export async function GET(request: NextRequest) {
  try {
    const { isAdmin, user } = await verifyAdminAccess();
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    return NextResponse.json({
      isAdmin: true,
      user: {
        id: user?.id,
        email: user?.email,
        // Don't expose sensitive user data
      }
    });
  } catch (error) {
    console.error('Admin verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
