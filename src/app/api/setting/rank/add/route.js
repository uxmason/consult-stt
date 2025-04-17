import sql from 'mssql';
import { NextRequest, NextResponse  } from 'next/server';
import ExecuteQuery from '../../../../../utils/msSql';

export async function POST(request) {
  const query = await request.json();
  try {
    const data = await ExecuteQuery(`INSERT INTO CORE_ADMIN_RANK (RANK_NAME, createdAt) VALUES ('${query.textPosition}', SYSDATETIME())`);
    return NextResponse.json({ success:true}, { status:201 });
  } catch(e) {
    return NextResponse.json({ success:false, message:e.message }, { status:500 });
  }
}