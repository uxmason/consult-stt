import sql from 'mssql';
import { NextRequest, NextResponse  } from 'next/server';
import jwt from "jsonwebtoken";
import ExecuteQuery from '../../../utils/msSql';

export async function POST(request) {
  const query = await request.json();
  try {
    const data0 = await ExecuteQuery(`SELECT TOP 1 * FROM CORE_ADMINS WHERE ADMIN_ID = '${query.ID}' AND PASSWORD = HASHBYTES('MD5', '${query.password}')`);
    if(data0 && data0.length > 0) {
      const token = jwt.sign({ userID: data0.ADMIN_ID }, process.env.JWT_SECRET, {
        expiresIn: "1w",
      });
      return NextResponse.json({ success:true, token:token, USER_id: data0[0]._id, POSITION_id: data0[0].POSITION_id }, { status:201 });
    }else {
      return NextResponse.json({ success:false, message:'계정정보가 일치하지 않습니다.' }, { status:200 });
    }
  } catch(e) {
    return NextResponse.json({ success:false, message:e.message }, { status:500 });
  }
}