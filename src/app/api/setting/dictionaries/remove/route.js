import sql from 'mssql';
import { NextRequest, NextResponse  } from 'next/server';
import ExecuteQuery from '../../../../../utils/msSql';

export async function DELETE(request) {
  const query = await request.json();
  try {
    const data0 = await ExecuteQuery(`DELETE FROM CORE_DICTIONARIES WHERE _id = ${query.dictionaryID}`);
    return NextResponse.json({ success:true }, { status: 200 });
  } catch(e) {
    return NextResponse.json({ success:false, message:e.message }, { status:500 });
  }
}