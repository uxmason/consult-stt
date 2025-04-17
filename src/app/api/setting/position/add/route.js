import sql from 'mssql';
import { NextRequest, NextResponse  } from 'next/server';
import ExecuteQuery from '../../../../../utils/msSql';

export async function POST(request) {
  const query = await request.json();
  try {
    const data = await ExecuteQuery(`INSERT INTO CORE_ADMIN_POSITION (POSITION_NAME, createdAt) VALUES ('${query.textPosition}', SYSDATETIME())`);
    return NextResponse.json({ success:true}, { status:201 });
  } catch(e) {
    return NextResponse.json({ success:false, message:e.message }, { status:500 });
  }
}

// export default async function handler(req = NextApiRequest, res = NextApiResponse) {
//   try {
//     const pool = await sql.connect(config);

//     if (req.method === 'GET') {
//       const result = await pool.request().query('SELECT * FROM Users');
//       return NextResponse.json(result.recordset, { status: 200 });
//     }
//     if (req.method === 'POST') {
//       const { name, email } = req.body;
//       const result = await pool
//         .request()
//         .input('name', sql.VarChar, name)
//         .input('email', sql.VarChar, email)
//         .query('INSERT INTO Users (name, email) VALUES (@name, @email)');
//       return NextResponse.json({ message: 'User created successfully!' }, { status: 201 });
//     }
//     if (req.method === 'PUT') {
//       const { id, name, email } = req.body;
//       const result = await pool
//         .request()
//         .input('id', sql.Int, id)
//         .input('name', sql.VarChar, name)
//         .input('email', sql.VarChar, email)
//         .query('UPDATE Users SET name = @name, email = @email WHERE id = @id');
//       return NextResponse.json({ message: 'User updated successfully!' }, { status: 200 });
//     }
//     if (req.method === 'DELETE') {
//       const { id } = req.body;
//       const result = await pool
//         .request()
//         .input('id', sql.Int, id)
//         .query('DELETE FROM Users WHERE id = @id');
//       return NextResponse.json({ message: 'User deleted successfully!' }, { status: 200 });
//     } else {
//       res.status(405).json({ message: 'Method Not Allowed' });
//     }
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   } finally {
//     sql.close();
//   }
// }