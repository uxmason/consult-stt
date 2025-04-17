import sql from 'mssql';
import { NextRequest, NextResponse  } from 'next/server';
import ExecuteQuery from '../../../../../utils/msSql';

export async function GET(request, context) {
  const { id } = await context.params;
  try {
    const data = await ExecuteQuery(`SELECT TOP 1 * FROM CORE_ADMINS A LEFT JOIN CUSTOM_ADMINS CA ON A._id = CA.ADMIN_id WHERE A._id = ${id}`);
    return NextResponse.json({success:true, data:data[0]}, { status: 200 });
  } catch(e) {
    return NextResponse.json({success:false, message:e.message}, { status: 500 });
  }
}

export async function PUT(request, context) {
  const query = await request.json();
  const { id } = await context.params;
  try {
    const data1 = await ExecuteQuery(`SELECT TOP 1 * FROM CUSTOM_ADMINS WHERE USER_NUMBER = '${query.userNumber}'`);
    if(data1 && data1.length > 0 && data1[0].ADMIN_id != id) {
      return NextResponse.json({ success:false, message:'이 사원번호로 등록된 회원이 이미 있습니다.' }, { status:200 });
    } else {
      const data2 = await ExecuteQuery(`UPDATE CORE_ADMINS SET ADMIN_NAME = '${query.name}', BRANCH_id = ${query.branchID}, RANK_id = ${query.rankID}, POSITION_id = ${query.positionID}, updatedAt = SYSDATETIME() WHERE _id = ${id}`);
      const data20 = await ExecuteQuery(`SELECT TOP 1 * FROM CUSTOM_ADMINS WHERE ADMIN_id = ${id}`);
      if(data20 && data20.length > 0) {
        const data3 = await ExecuteQuery(`UPDATE CUSTOM_ADMINS SET USER_NUMBER = ${query.userNumber}, updatedAt = SYSDATETIME() WHERE ADMIN_id = ${id}`);
      }else {
        const data3 = await ExecuteQuery(`INSERT INTO CUSTOM_ADMINS (ADMIN_id, USER_NUMBER, createdAt) VALUES (${id}, '${query.userNumber}', SYSDATETIME())`);
      }
      return NextResponse.json({ success:true }, { status:201 });
    }
  } catch(e) {
    return NextResponse.json({ success:false, message:e.message }, { status:500 });
  }
}