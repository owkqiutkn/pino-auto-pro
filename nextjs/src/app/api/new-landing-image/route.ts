import { readFile } from "node:fs/promises";

const IMAGE_PATH =
    "C:\\Users\\Playd\\.cursor\\projects\\c-Users-Playd-Documents-projects\\assets\\c__Users_Playd_AppData_Roaming_Cursor_User_workspaceStorage_38088e63bee07033ffa59452dab2cf1c_images_screencapture-mlautos-ca-2026-03-10-14_20_52-95b47749-7ed6-448d-9ee3-11e84548c577.png";

export async function GET() {
    try {
        const image = await readFile(IMAGE_PATH);
        return new Response(new Uint8Array(image), {
            headers: {
                "Content-Type": "image/png",
                "Cache-Control": "no-store",
            },
        });
    } catch {
        return new Response("Image not found", { status: 404 });
    }
}
