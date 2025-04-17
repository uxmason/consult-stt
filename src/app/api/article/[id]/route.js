import sql from 'mssql';
import { NextRequest, NextResponse  } from 'next/server';
import ExecuteQuery from '../../../../utils/msSql';

export async function GET(request, context) {
  const { id } = await context.params;
  try {
    const data2 = await ExecuteQuery(`SELECT * FROM CORE_CONSULT_SEGMENTS WHERE ARTICLE_id = ${id} ORDER BY END_TIME`);
    return NextResponse.json({success:true, segments:data2}, { status: 200 });
  } catch(e) {
    return NextResponse.json({success:false, message:e.message}, { status: 500 });
  }
}