import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/operators`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Aquí deberías agregar el token de autenticación si es necesario
        // "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Error al crear el operador");
    }

    const result = await response.json();

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating operator:", error);
    return NextResponse.json(
      { error: "Error al crear el operador" },
      { status: 500 }
    );
  }
} 