import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Ajustar si el auth está en otro archivo
import { pusherServer } from "@/lib/pusher";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await req.formData();
    const socketId = data.get("socket_id") as string;
    const channel = data.get("channel_name") as string;

    // Validación básica de canal privado: verificar que quien intenta suscribirse a su canal sea él mismo
    if (channel.startsWith('private-') && channel !== `private-${session.user.id}`) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const authResponse = pusherServer.authorizeChannel(socketId, channel);
    
    return NextResponse.json(authResponse);
  } catch (error) {
    console.error("PUSHER_AUTH_ERROR", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
