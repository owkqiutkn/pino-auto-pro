import { createSSRSassClient } from "@/lib/supabase/server";
import { Database } from "@/lib/types";

type Car = Database["public"]["Tables"]["cars"]["Row"];
type CarImage = Database["public"]["Tables"]["car_images"]["Row"];

const LIMIT = 8;

export type Segment = "featured" | "new-arrivals";

export type InventorySegmentResult = {
    cars: Car[];
    coverImageByCarId: Record<string, string>;
};

/**
 * Server-only: fetches inventory segment data (featured or new-arrivals).
 * Use for preloading on the home page or in API routes.
 */
export async function getInventorySegmentData(
    segment: Segment
): Promise<InventorySegmentResult> {
    const client = await createSSRSassClient();
    const { data: cars, error: carsError } =
        segment === "featured"
            ? await client.getFeaturedCars(LIMIT)
            : await client.getNewArrivalsCars(LIMIT);

    if (carsError) {
        throw new Error("Failed to fetch cars.");
    }

    const carsList = (cars ?? []) as Car[];
    if (carsList.length === 0) {
        return { cars: [], coverImageByCarId: {} };
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

    return {
        cars: carsList,
        coverImageByCarId,
    };
}
