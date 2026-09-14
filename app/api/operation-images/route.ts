import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { ownerCanManageOperation } from "@/features/operation/content";
import { ApiError, jsonError } from "@/lib/http";

const maxImageBytes = 8 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) throw new ApiError(401, "Authentication required");
    if (!ownerCanManageOperation(user.role)) throw new ApiError(403, "Owner or Admin permission is required");
    if (!process.env.BLOB_READ_WRITE_TOKEN) throw new ApiError(503, "Image storage has not been configured yet.");

    const form = await request.formData();
    const file = form.get("image");
    if (!(file instanceof File)) throw new ApiError(400, "Choose an image to upload.");
    if (!/^image\/(avif|gif|jpe?g|png|webp)$/i.test(file.type)) throw new ApiError(400, "Use a JPG, PNG, WebP, GIF or AVIF image.");
    if (file.size > maxImageBytes) throw new ApiError(400, "Images must be 8 MB or smaller.");

    const extension = file.type.split("/")[1]?.replace(/[^a-z0-9]/gi, "") || "jpg";
    const blob = await put(`operation/${user.organizationId}/${crypto.randomUUID()}.${extension}`, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type,
    });
    return NextResponse.json({ url: blob.url }, { status: 201 });
  } catch (error) {
    return jsonError(error, request);
  }
}
