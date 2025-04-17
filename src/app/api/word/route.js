import sql from 'mssql';
import { NextRequest, NextResponse  } from 'next/server';
import ExecuteQuery from '../../../utils/msSql';

export async function GET(request) {
  try {
    let count = 1;
    if(request.nextUrl.searchParams.get('index')) count = request.nextUrl.searchParams.get('index');
    let addTable = '';
    let conditions = '';
    if(request.nextUrl.searchParams.get('keyword') != null && request.nextUrl.searchParams.get('keyword') != '')
    conditions += ` AND W.WORD LIKE '%${request.nextUrl.searchParams.get('keyword')}%'`;
    if(request.nextUrl.searchParams.get('branchID') != null && request.nextUrl.searchParams.get('branchID') != '' && request.nextUrl.searchParams.get('branchID') != 0)
    conditions += ` AND C.BRANCH_id = ${request.nextUrl.searchParams.get('branchID')}`;
    if(request.nextUrl.searchParams.get('dateFrom') != null && request.nextUrl.searchParams.get('dateFrom') != '')
    conditions += ` AND C.START_TIME >= CONVERT(DATE, '${request.nextUrl.searchParams.get('dateFrom')}')`;
    if(request.nextUrl.searchParams.get('dateTo') != null && request.nextUrl.searchParams.get('dateTo') != '')
    conditions += ` AND C.END_TIME <= CONVERT(DATETIME, '${request.nextUrl.searchParams.get('dateTo')} 23:59:59')`;
    if(request.nextUrl.searchParams.get('sorting') == null || request.nextUrl.searchParams.get('sorting') == '' || request.nextUrl.searchParams.get('sorting') == 0) {
      conditions += ` AND D.WORD = W.WORD`;
      addTable += `, CORE_DICTIONARIES D`;
    }
    const data = await ExecuteQuery(`SELECT W.WORD AS WORD, CASE WHEN EXISTS (
      SELECT 1 FROM CORE_DICTIONARIES ID WHERE ID.WORD = W.WORD
    ) THEN 1 ELSE 0 END AS ISDIC, COUNT(*) AS CNT FROM CORE_CONSULT_WORDS W${addTable}, CORE_CONSULTS C
    WHERE W.CONSULT_id = C._id${conditions}
    GROUP BY W.WORD
    ORDER BY CNT DESC, W.WORD OFFSET ${(count-1)*request.nextUrl.searchParams.get('limitCount')} ROWS FETCH NEXT ${request.nextUrl.searchParams.get('limitCount')} ROWS ONLY`);
    const totalCount = await ExecuteQuery(`SELECT COUNT(*) AS count FROM (SELECT W.WORD FROM CORE_CONSULT_WORDS W${addTable}, CORE_CONSULTS C
    WHERE W.CONSULT_id = C._id${conditions}
    GROUP BY W.WORD) AS W`);
    return NextResponse.json({success:true, data:data, totalCount:totalCount[0].count}, { status: 200 });
  } catch(e) {
    return NextResponse.json({success:false, message:e.message}, { status: 500 });
  }
}

export async function POST(request) {
  const query = await request.json();
  try {
    let insertString = '';
    query.words.map(async (word, index) => {
      if(index == 0) {
        insertString += `(${query.consultID}, ${query.segmentID}, '${word[2]}', SYSDATETIME())`;
      } else {
        insertString += `, (${query.consultID}, ${query.segmentID}, '${word[2]}', SYSDATETIME())`;
      }
    })
    const data12 = await ExecuteQuery(`INSERT INTO CORE_CONSULT_WORDS (CONSULT_id, SEGMENT_id, WORD, createdAt) 
    VALUES ${insertString}`);
    return NextResponse.json({success:true}, { status: 200 });
  } catch(e) {
    return NextResponse.json({success:false, message:e.message}, { status: 500 });
  }
}