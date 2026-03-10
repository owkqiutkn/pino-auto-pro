import { NextRequest } from "next/server";
import { createSSRSassClient } from "@/lib/supabase/server";
import { Database } from "@/lib/types";

type Car = Database["public"]["Tables"]["cars"]["Row"];
type CarImage = Database["public"]["Tables"]["car_images"]["Row"];

const LIMIT = 8;

export async function GET(request: NextRequest) {
    const segment = request.nextUrl.searchParams.get("segment");
    if (segment !== "featured" && segment !== "new-arrivals") {
        return Response.json(
            { error: "Invalid segment. Use 'featured' or 'new-arrivals'." },
            { status: 400 }
        );
    }

    try {
        const client = await createSSRSassClient();
        const { data: cars, error: carsError } =
            segment === "featured"
                ? await client.getFeaturedCars(LIMIT)
                : await client.getNewArrivalsCars(LIMIT);

        if (carsError) {
            return Response.json(
                { error: "Failed to fetch cars." },
                { status: 500 }
            );
        }

        const carsList = (cars ?? []) as Car[];
        if (carsList.length === 0) {
            return Response.json({ cars: [], coverImageByCarId: {} });
        }

        const { data: images } = await client.getCarImagesForCars(
            carsList.map((c) => c.id)
        );
        const imagesList = (images ?? []) as CarImage[];

        const imagesByCar = new Map<string, CarImage[]>();
        for (const img of imagesList) {
            const list = imagesByCar.get(img.car_id) ?? [];
            list.push(img);
            imagesByCar.set(img.car_id, list);
        }
        const coverImageByCarId: Record<string, string> = {};
        for (const car of carsList) {
            const list = imagesByCar.get(car.id) ?? [];
            const cover = list.find((i) => i.is_cover) ?? list[0];
            if (cover) coverImageByCarId[car.id] = cover.image_url;
        }

        return Response.json({
            cars: carsList,
            coverImageByCarId,
        });
    } catch {
        return Response.json(
            { error: "Failed to fetch inventory segment." },
            { status: 500 }
        );
    }
}
