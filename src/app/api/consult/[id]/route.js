import sql from 'mssql';
import { NextRequest, NextResponse  } from 'next/server';
import ExecuteQuery from '../../../../utils/msSql';

export async function GET(request, context) {
  const { id } = await context.params;
  try {
    const data0 = await ExecuteQuery(`SELECT TOP 1 * FROM CORE_CONSULTS S, CORE_ADMINS A, CORE_CLIENTS C, CORE_ADMIN_POSITION P, CUSTOM_CONSULT_VALIDATIONS CV
    WHERE S.ADMIN_id = A._id AND S.CLIENT_id = C._id AND A.POSITION_id = P._id AND CV.CONSULT_id = S._id AND S._id = ${id}`);
    const data1 = await ExecuteQuery(`SELECT *, AR._id AS ARTICLE_ID
    FROM CORE_CONSULT_ARTICLES AR 
    LEFT JOIN CORE_ADMINS AM ON AR.EDITOR_id = AM._id 
    LEFT JOIN CORE_BRANCHES BR ON AM.BRANCH_id = BR._id 
    LEFT JOIN CORE_ADMIN_RANK RK ON AM.RANK_id = RK._id 
    LEFT JOIN CORE_ADMIN_POSITION PS ON AM.POSITION_id = PS._id 
    WHERE AR.CONSULT_id = ${id} ORDER BY AR.createdAt DESC`);
    const articleID = data1[0].ARTICLE_ID;
    const data2 = await ExecuteQuery(`SELECT * FROM CORE_CONSULT_SEGMENTS S LEFT JOIN CORE_GENTILES G ON S.GENTILE_id = G._id WHERE S.ARTICLE_id = ${articleID} ORDER BY S.END_TIME`);
    const data4 = await ExecuteQuery(`SELECT TOP 1 * FROM tsfmc_stt_system.dbo.CUSTOM_CONSULT_ABRIDGMENTS WHERE ARTICLE_id = ${articleID} AND CONSULT_id = ${id}`);
    if(data0.length > 0 && data0[0].STATUS_NUMBER == 0) {
      const data3 = await ExecuteQuery(`UPDATE CORE_CONSULTS SET STATUS_NUMBER = 1, updatedAt = SYSDATETIME() WHERE _id = ${id}`);
    }
    return NextResponse.json({success:true, info:data0[0], articles:data1, segments:data2, existAnalysis:data4.length}, { status: 200 });
  } catch(e) {
    return NextResponse.json({success:false, message:e.message}, { status: 500 });
  }
}