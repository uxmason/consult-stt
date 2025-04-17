import sql from 'mssql';
import { NextRequest, NextResponse  } from 'next/server';
import ExecuteQuery from '../../../../../utils/msSql';

export async function PUT(request) {
  const query = await request.json();
  try {
    const data2 = await ExecuteQuery(`SELECT TOP 1 * FROM CORE_BRANCHES WHERE _id = ${query.id}`);
    const data0 = await ExecuteQuery(`SELECT TOP 1 * FROM CORE_BRANCHES WHERE BRANCH_INFO_CODE = '${query.textCode}'`);
    if(data2[0].BRANCH_INFO_CODE != query.textCode && data0.length > 0) {
      return NextResponse.json({success:false, message:'지점 코드가 이미 존재합니다.'}, { status: 200 });
    } else {
      const data1 = await ExecuteQuery(`SELECT TOP 1 * FROM CORE_BRANCHES WHERE BRANCH_NAME = '${query.textName}'`);
      if(data2[0].BRANCH_NAME != query.textName && data1.length > 0) {
        return NextResponse.json({success:false, message:'지점 이름이 이미 존재합니다.'}, { status: 200 });
      } else {
        const data = await ExecuteQuery(`UPDATE CORE_BRANCHES SET BRANCH_NAME = '${query.textName}', BRANCH_INFO_CODE = '${query.textCode}', updatedAt = SYSDATETIME() WHERE _id = ${query.id}`);
        return NextResponse.json({ success:true}, { status:201 });
      }
    }
  } catch(e) {
    return NextResponse.json({ success:false, message:e.message }, { status:500 });
  }
}