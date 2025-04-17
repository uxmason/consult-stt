import sql from 'mssql';
import { NextRequest, NextResponse  } from 'next/server';
import ExecuteQuery from '../../../../utils/msSql';

export async function GET(request, context) {
  const { id } = await context.params;
  try {
    const data0 = await ExecuteQuery(`SELECT TOP 1 CA.ABRIDGMENT FROM tsfmc_stt_system.dbo.CORE_CONSULTS C, tsfmc_stt_system.dbo.CUSTOM_CONSULT_ABRIDGMENTS CA, tsfmc_stt_system.dbo.CORE_CONSULT_ARTICLES AR WHERE C._id = CA.CONSULT_id AND C._id = AR.CONSULT_id AND CA.ARTICLE_id = AR._id AND C._id = ${id} ORDER BY AR.createdAt DESC`);
    const data1 = await ExecuteQuery(`SELECT A._id AS ARTICLE_ID FROM tsfmc_stt_system.dbo.CORE_CONSULTS C, tsfmc_stt_system.dbo.CORE_CONSULT_ARTICLES A WHERE C._id = A.CONSULT_id AND C._id = ${id} ORDER BY A._id DESC`);
    const articleLastID = data1[0]['ARTICLE_ID'];
    const data2 = await ExecuteQuery(`SELECT TOP 20 WORD, COUNT FROM tsfmc_stt_system.dbo.CORE_CONSULTS C, tsfmc_stt_system.dbo.DERIVED_CONSULT_WORDS_CLOUD DC, tsfmc_stt_system.dbo.CORE_CONSULT_ARTICLES AR WHERE C._id = DC.CONSULT_id AND C._id = AR.CONSULT_id AND DC.ARTICLE_id = AR._id AND DC.CONSULT_id = ${id} AND DC.ARTICLE_id = ${articleLastID} ORDER BY DC.COUNT DESC`);
    return NextResponse.json({success:true, abridgment:data0[0]['ABRIDGMENT'], articleLastID:articleLastID, keywords:data2}, { status: 200 });
  } catch(e) {
    return NextResponse.json({success:false, message:e.message}, { status: 500 });
  }
}