import sql from 'mssql';
import { NextRequest, NextResponse  } from 'next/server';
import ExecuteQuery from '../../../utils/msSql';

export async function POST(request) {
  const query = await request.json();
  try {
    const data0 = await ExecuteQuery(`SELECT TOP 1 * FROM CORE_ADMINS WHERE ADMIN_ID = '${query.ID}'`);
    if(data0 && data0.length > 0) {
      return NextResponse.json({ success:false, message:'이 아이디로 가입된 회원이 이미 있습니다.' }, { status:200 });
    } else {
      if(query.userNumber && query.userNumber.length > 0) {
        const data1 = await ExecuteQuery(`SELECT TOP 1 * FROM CUSTOM_ADMINS WHERE USER_NUMBER = '${query.userNumber}'`);
        if(data1 && data1.length > 0) {
          return NextResponse.json({ success:false, message:'이 사원번호로 등록된 회원이 이미 있습니다.' }, { status:200 });
        } else {
          const data2 = await ExecuteQuery(`INSERT INTO CORE_ADMINS (ADMIN_ID, PASSWORD, ADMIN_NAME, BRANCH_id, RANK_id, POSITION_id, VERIFICATION, createdAt) VALUES ('${query.ID}', HASHBYTES('MD5', '${query.password}'), '${query.name}', ${query.branchID}, ${query.rankID}, ${query.positionID}, 0, SYSDATETIME())`);
          const data20 = await ExecuteQuery(`SELECT IDENT_CURRENT('CORE_ADMINS') AS LAST_ID`);
          const adminID = data20[0].LAST_ID;
          const data3 = await ExecuteQuery(`INSERT INTO CUSTOM_ADMINS (ADMIN_id, USER_NUMBER, createdAt) VALUES (${adminID}, '${query.userNumber}', SYSDATETIME())`);
          return NextResponse.json({ success:true, test:adminID, aa:query.userNumber }, { status:201 });
        }
      } else {
        const data2 = await ExecuteQuery(`INSERT INTO CORE_ADMINS (ADMIN_ID, PASSWORD, ADMIN_NAME, BRANCH_id, RANK_id, POSITION_id, VERIFICATION, createdAt) VALUES ('${query.ID}', HASHBYTES('MD5', '${query.password}'), '${query.name}', ${query.branchID}, ${query.rankID}, ${query.positionID}, 0, SYSDATETIME())`);
        return NextResponse.json({ success:true }, { status:201 });
      }
    }
  } catch(e) {
    return NextResponse.json({ success:false, message:e.message }, { status:500 });
  }
}