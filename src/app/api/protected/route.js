import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
// import { headers } from "next/headers";

export async function GET(req) {

  try {
    // const headersInstance = headers();
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { message: "Authorization header missing" }, 
        { status: 400 }
      );
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { message: "Token missing" }, 
        { status: 400 }
      );
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return NextResponse.json(
        { message: "Expired" },
        { status: 400 }
      );
    } else if (decoded.exp < Math.floor(Date.now() / 1000)) {
      return NextResponse.json(
        { message: "Expired" },
        { status: 400 }
      );
    } else {
      return NextResponse.json(
        { data: "Protected data" },
        { status: 200 }
      );
    }
  } catch (error) {
    console.log("Token verification failed", error);
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 400 }
    );
  }
}