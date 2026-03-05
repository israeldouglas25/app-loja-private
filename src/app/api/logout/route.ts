import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    // Clear the token cookie from the server
    (await cookies()).delete("token");
    
    return new NextResponse(
      JSON.stringify({ message: "Logout realizado com sucesso" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          // Additional headers to ensure cookies are cleared
          "Set-Cookie": "token=; path=/; max-age=0; sameSite=lax",
        },
      }
    );
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    return new NextResponse(
      JSON.stringify({ message: "Erro ao fazer logout", error: error }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
