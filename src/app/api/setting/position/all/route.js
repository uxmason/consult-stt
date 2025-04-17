import sql from 'mssql';
import { NextRequest, NextResponse  } from 'next/server';
import ExecuteQuery from '../../../../../utils/msSql';

export async function GET(request) {
  try {
    const data = await ExecuteQuery(`SELECT * FROM CORE_ADMIN_POSITION WHERE NOT _id IN (11) ORDER BY createdAt`);
    return NextResponse.json({success:true, data:data}, { status: 200 });
  } catch(e) {
    return NextResponse.json({success:false, message:e.message}, { status: 500 });
  }
}