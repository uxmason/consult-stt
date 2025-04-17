import sql from 'mssql';
import { NextRequest, NextResponse  } from 'next/server';
import ExecuteQuery from '../../../../../utils/msSql';

export async function GET(request, context) {
  const { id } = await context.params;
  try {
    const data = await ExecuteQuery(`SELECT TOP 1 * FROM CORE_ADMINS A, CORE_ADMIN_POSITION P WHERE A._id = ${id} AND A.POSITION_id = P._id`);
    const positionID = data[0].POSITION_id;
    let data1, data2, data3, data4, data5, data6, data7, data8, data9;
    if(positionID == 11) {
      data1 = await ExecuteQuery(`SELECT COUNT(*) AS NOT_READ FROM CORE_CONSULTS WHERE STATUS_NUMBER = 0`);
      data2 = await ExecuteQuery(`SELECT COUNT(*) AS WAITING_EDIT FROM CORE_CONSULTS WHERE STATUS_NUMBER = 1`);
      data3 = await ExecuteQuery(`SELECT COUNT(*) AS COMPLETE_EDIT FROM CORE_CONSULTS WHERE STATUS_NUMBER = 2`);
      data4 = await ExecuteQuery(`SELECT COUNT(*) AS CNT, SUM(DATEDIFF(ss, START_TIME, END_TIME)) AS AMOUNT FROM CORE_CONSULTS WHERE START_TIME = GETDATE()`);
      data5 = await ExecuteQuery(`SELECT COUNT(*) AS CNT FROM CORE_CONSULTS WHERE YEAR(START_TIME) = YEAR(GETDATE()) AND MONTH(START_TIME) = MONTH(GETDATE())`);
      data6 = await ExecuteQuery(`SELECT COUNT(*) AS CNT FROM CORE_CONSULTS WHERE YEAR(START_TIME) = YEAR(GETDATE())`);
      data7 = await ExecuteQuery(`SELECT COUNT(*) AS CNT FROM CORE_CONSULTS WHERE YEAR(START_TIME) = YEAR(GETDATE())-1 AND MONTH(START_TIME) = MONTH(GETDATE())`);
      data8 = await ExecuteQuery(`SELECT COUNT(*) AS CNT FROM CORE_CONSULTS WHERE YEAR(START_TIME) = YEAR(GETDATE())-1`);
      data9 = await ExecuteQuery(`SELECT COUNT(*) AS CNT, SUM(DATEDIFF(ss, START_TIME, END_TIME)) AS AMOUNT FROM CORE_CONSULTS`);
    }else {
      data1 = await ExecuteQuery(`SELECT COUNT(*) AS NOT_READ FROM CORE_CONSULTS WHERE ADMIN_id = ${id} AND STATUS_NUMBER = 0`);
      data2 = await ExecuteQuery(`SELECT COUNT(*) AS WAITING_EDIT FROM CORE_CONSULTS WHERE ADMIN_id = ${id} AND STATUS_NUMBER = 1`);
      data3 = await ExecuteQuery(`SELECT COUNT(*) AS COMPLETE_EDIT FROM CORE_CONSULTS WHERE ADMIN_id = ${id} AND STATUS_NUMBER = 2`);
      data4 = await ExecuteQuery(`SELECT COUNT(*) AS CNT, SUM(DATEDIFF(ss, START_TIME, END_TIME)) AS AMOUNT FROM CORE_CONSULTS WHERE ADMIN_id = ${id} AND START_TIME = GETDATE()`);
      data5 = await ExecuteQuery(`SELECT COUNT(*) AS CNT FROM CORE_CONSULTS WHERE ADMIN_id = ${id} AND YEAR(START_TIME) = YEAR(GETDATE()) AND MONTH(START_TIME) = MONTH(GETDATE())`);
      data6 = await ExecuteQuery(`SELECT COUNT(*) AS CNT FROM CORE_CONSULTS WHERE ADMIN_id = ${id} AND YEAR(START_TIME) = YEAR(GETDATE())`);
      data7 = await ExecuteQuery(`SELECT COUNT(*) AS CNT FROM CORE_CONSULTS WHERE ADMIN_id = ${id} AND YEAR(START_TIME) = YEAR(GETDATE())-1 AND MONTH(START_TIME) = MONTH(GETDATE())`);
      data8 = await ExecuteQuery(`SELECT COUNT(*) AS CNT FROM CORE_CONSULTS WHERE ADMIN_id = ${id} AND YEAR(START_TIME) = YEAR(GETDATE())-1`);
      data9 = await ExecuteQuery(`SELECT COUNT(*) AS CNT, SUM(DATEDIFF(ss, START_TIME, END_TIME)) AS AMOUNT FROM CORE_CONSULTS WHERE ADMIN_id = ${id}`);
    }
    return NextResponse.json({success:true, 
      notRead:data1[0].NOT_READ, 
      waitingEdit:data2[0].WAITING_EDIT, 
      completeEdit:data3[0].COMPLETE_EDIT,
      todayCount:data4[0].CNT,
      todayTime:data4[0].AMOUNT,
      thisMonthCount:data5[0].CNT,
      thisYearCount:data6[0].CNT,
      lastMonthCount:data7[0].CNT,
      lastYearCount:data8[0].CNT,
      totalCount:data9[0].CNT,
      totalTime:data9[0].AMOUNT
    }, { status: 200 });
  } catch(e) {
    return NextResponse.json({success:false, message:e.message}, { status: 500 });
  }
}