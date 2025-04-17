import sql from 'mssql';
import { NextRequest, NextResponse  } from 'next/server';
import ExecuteQuery from '../../../../../utils/msSql';

export async function PUT(request, context) {
  const { id } = await context.params;
  const query = await request.json();
  try {
    const data2 = await ExecuteQuery(`UPDATE CORE_CONSULTS SET ROOM_id = ${query.roomID}, updatedAt = SYSDATETIME() WHERE _id = ${id}`);
    return NextResponse.json({ success:true }, { status:201 });
  } catch(e) {
    return NextResponse.json({ success:false, message:e.message }, { status:500 });
  }
}