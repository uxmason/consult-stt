import sql from 'mssql';
import { NextRequest, NextResponse  } from 'next/server';
import ExecuteQuery from '../../../../../utils/msSql';

export async function PUT(request) {
  const query = await request.json();
  try {
    const data = await ExecuteQuery(`UPDATE CORE_ADMIN_POSITION SET POSITION_NAME = '${query.textPosition}', updatedAt = SYSDATETIME() WHERE _id = ${query.id}`);
    return NextResponse.json({ success:true}, { status:201 });
  } catch(e) {
    return NextResponse.json({ success:false, message:e.message }, { status:500 });
  }
}