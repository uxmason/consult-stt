import sql from 'mssql';
import { NextRequest, NextResponse  } from 'next/server';
import ExecuteQuery from '../../../../../utils/msSql';

export async function GET(request, context) {
  const { id } = await context.params;
  try {
    const data = await ExecuteQuery(`SELECT TOP 1 * FROM CORE_CONSULT_ROOMS WHERE _id = ${id}`);
    return NextResponse.json({success:true, data:data[0]}, { status: 200 });
  } catch(e) {
    return NextResponse.json({success:false, message:e.message}, { status: 500 });
  }
}

export async function PUT(request) {
  const query = await request.json();
  try {
    const data1 = await ExecuteQuery(`SELECT TOP 1 * FROM CORE_CONSULT_ROOMS WHERE ROOM_NAME = '${query.roomName}' AND BRANCH_id = ${query.branchID}`);
    if(data1 && data1.length > 0) {
      return NextResponse.json({ success:false, message:'이 지점에 이 이름으로 등록된 상담실이 이미 있습니다.' }, { status:200 });
    } else {
      const data2 = await ExecuteQuery(`UPDATE CORE_CONSULT_ROOMS SET ROOM_NAME = '${query.roomName}', updatedAt = SYSDATETIME() WHERE _id = ${query.id}`);
      return NextResponse.json({ success:true }, { status:201 });
    }
  } catch(e) {
    return NextResponse.json({ success:false, message:e.message }, { status:500 });
  }
}