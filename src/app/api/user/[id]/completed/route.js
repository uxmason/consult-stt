import sql from 'mssql';
import { NextRequest, NextResponse  } from 'next/server';
import ExecuteQuery from '../../../../../utils/msSql';

export async function GET(request, context) {
  const { id } = await context.params;
  try {
    const data = await ExecuteQuery(`SELECT TOP 1 * FROM CORE_ADMINS A LEFT JOIN CUSTOM_ADMINS CA ON A._id = CA.ADMIN_id, CORE_ADMIN_POSITION P, CORE_ADMIN_RANK R, CORE_BRANCHES B WHERE A._id = ${id} AND A.POSITION_id = P._id AND A.RANK_id = R._id AND A.BRANCH_id = B._id`);
    return NextResponse.json({success:true, data:data[0]}, { status: 200 });
  } catch(e) {
    return NextResponse.json({success:false, message:e.message}, { status: 500 });
  }
}