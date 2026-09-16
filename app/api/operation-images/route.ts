import { del, put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { ownerCanManageOperation } from "@/features/operation/content";
import { ApiError, jsonError } from "@/lib/http";
import { logServerError } from "@/lib/observability";

const maxImageBytes = 4 * 1024 * 1024;
const allowedImageTypes = /^image\/(avif|gif|jpe?g|png|webp)$/i;

function imageExtension(file: File) {
  return file.type.split("/")[1]?.replace(/[^a-z0-9]/gi, "") || "jpg";
}

function assertImage(file: FormDataEntryValue | null, field?: string): asserts file is File {
  if (!(file instanceof File)) throw new ApiError(400, field ? `Choose a ${field} image to upload.` : "Choose an image to upload.");
  if (!allowedImageTypes.test(file.type)) throw new ApiError(400, "Use a JPG, PNG, WebP, GIF or AVIF image.");
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) throw new ApiError(401, "Authentication required");
    if (!ownerCanManageOperation(user.role)) throw new ApiError(403, "Owner or Admin permission is required");
    if (!process.env.BLOB_READ_WRITE_TOKEN) throw new ApiError(503, "Image storage has not been configured yet.");

    const form = await request.formData();
    const preview = form.get("preview");
    const detail = form.get("detail");
    const legacyImage = form.get("image");
    if (preview || detail) {
      assertImage(preview, "preview");
      assertImage(detail, "detail");
      if (preview.size + detail.size > maxImageBytes) throw new ApiError(400, "Prepared images must be 4 MB or smaller.");
      const imageId = crypto.randomUUID();
      let previewBlob;
      try {
        previewBlob = await put(`operation/${user.organizationId}/${imageId}-preview.${imageExtension(preview)}`, preview, {
          access: "private",
          addRandomSuffix: false,
          contentType: preview.type,
        });
        const detailBlob = await put(`operation/${user.organizationId}/${imageId}-detail.${imageExtension(detail)}`, detail, {
          access: "private",
          addRandomSuffix: false,
          contentType: detail.type,
        });
        return NextResponse.json({
          url: `/api/operation-images/${previewBlob.pathname}`,
          fullUrl: `/api/operation-images/${detailBlob.pathname}`,
        }, { status: 201 });
      } catch (error) {
        if (previewBlob) await del(previewBlob.url).catch(() => undefined);
        logServerError(error, { route: "operation-images", organizationId: user.organizationId });
        throw new ApiError(503, "Image storage could not save this photo. Confirm the Vercel Blob store and BLOB_READ_WRITE_TOKEN are connected.");
      }
    }

    assertImage(legacyImage);
    if (legacyImage.size > maxImageBytes) throw new ApiError(400, "Images must be 4 MB or smaller.");
    let blob;
    try {
      blob = await put(`operation/${user.organizationId}/${crypto.randomUUID()}.${imageExtension(legacyImage)}`, legacyImage, {
        access: "private",
        addRandomSuffix: false,
        contentType: legacyImage.type,
      });
    } catch (error) {
      logServerError(error, { route: "operation-images", organizationId: user.organizationId });
      throw new ApiError(503, "Image storage could not save this photo. Confirm the Vercel Blob store and BLOB_READ_WRITE_TOKEN are connected.");
    }
    return NextResponse.json({ url: `/api/operation-images/${blob.pathname}` }, { status: 201 });
  } catch (error) {
    return jsonError(error, request);
  }
}
