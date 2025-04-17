import sql from 'mssql';
import { NextRequest, NextResponse  } from 'next/server';
import ExecuteQuery from '../../../../../../utils/msSql';

export async function GET(request, context) {
  const { id } = await context.params;
  try {
    const data = await ExecuteQuery(`SELECT * FROM CORE_CONSULT_ROOMS WHERE BRANCH_id = ${id}`);
    return NextResponse.json({success:true, data:data}, { status: 200 });
  } catch(e) {
    return NextResponse.json({success:false, message:e.message}, { status: 500 });
  }
}