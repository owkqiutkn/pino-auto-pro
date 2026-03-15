import { NextRequest } from "next/server";
import { getInventorySegmentData, type Segment } from "@/lib/inventory/segment";

export async function GET(request: NextRequest) {
    const segment = request.nextUrl.searchParams.get("segment") as Segment | null;
    if (segment !== "featured" && segment !== "new-arrivals") {
        return Response.json(
            { error: "Invalid segment. Use 'featured' or 'new-arrivals'." },
            { status: 400 }
        );
    }

    try {
        const data = await getInventorySegmentData(segment);
        return Response.json(data);
    } catch {
        return Response.json(
            { error: "Failed to fetch inventory segment." },
            { status: 500 }
        );
    }
}
