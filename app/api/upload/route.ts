// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import crypto from "crypto";
import { getSession } from "@/lib/dal";
import { rateLimitWrite } from "@/lib/rate-limit";

// Allowed image MIME types
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
]);

// Allowed file extensions
const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".svg",
]);

export async function POST(request: NextRequest) {
  try {
    // Verify authentication - only OWNER can upload
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role !== "OWNER") {
      return NextResponse.json(
        { error: "Forbidden - Owner access required" },
        { status: 403 }
      );
    }

    const limited = await rateLimitWrite(session.userId);
    if (limited) return limited;

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate MIME type against allowlist
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "File must be an image (JPEG, PNG, GIF, WebP, or SVG)" },
        { status: 400 }
      );
    }

    // Validate file extension
    const originalExtension = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(originalExtension)) {
      return NextResponse.json(
        { error: "Invalid file extension" },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate a safe, random filename (avoid using user-provided name in filesystem path)
    const randomId = crypto.randomBytes(16).toString("hex");
    const filename = `${Date.now()}-${randomId}${originalExtension}`;

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Ensure the resolved filepath stays within uploads directory (prevent path traversal)
    const filepath = path.resolve(uploadsDir, filename);
    if (!filepath.startsWith(path.resolve(uploadsDir))) {
      return NextResponse.json(
        { error: "Invalid filename" },
        { status: 400 }
      );
    }

    // Save file
    await writeFile(filepath, buffer);

    // Return public URL
    const url = `/uploads/${filename}`;

    return NextResponse.json({ url }, { status: 200 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
