import { Database } from "@/lib/types";
import { getTranslations } from "next-intl/server";
import { getLocale } from "next-intl/server";
import { getLocalizedCategoryName } from "@/lib/i18n/categories";
import { getLocalizedEngineName } from "@/lib/i18n/engines";
import { getLocalizedFuelName } from "@/lib/i18n/fuels";
import { getLocalizedTransmissionName } from "@/lib/i18n/transmissions";

type Car = Database["public"]["Tables"]["cars"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];
type Engine = Database["public"]["Tables"]["engines"]["Row"];
type Fuel = Database["public"]["Tables"]["fuels"]["Row"];
type Transmission = Database["public"]["Tables"]["transmissions"]["Row"];

interface CarDetailSpecsProps {
    car: Car;
    categories: Category[];
    engines: Engine[];
    fuels: Fuel[];
    transmissions: Transmission[];
}

function SpecItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col gap-0.5 border-b border-gray-100 py-2 last:border-0">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-sm font-medium text-gray-900">{value}</p>
        </div>
    );
}

export default async function CarDetailSpecs({
    car,
    categories,
    engines,
    fuels,
    transmissions,
}: CarDetailSpecsProps) {
    const t = await getTranslations("Inventory.carDetail");
    const locale = await getLocale();

    const categoryRow = categories.find((c) => c.name_en === car.category || c.name_fr === car.category || c.name === car.category);
    const categoryDisplay = categoryRow ? getLocalizedCategoryName(categoryRow, locale) : car.category;
    const engineRow = engines.find((e) => (e.name_en ?? e.name) === car.engine || e.name === car.engine);
    const engineDisplay = engineRow ? getLocalizedEngineName(engineRow, locale) : car.engine;
    const fuelRow = fuels.find((f) => (f.name_en ?? f.name) === car.fuel || f.name === car.fuel);
    const fuelDisplay = fuelRow ? getLocalizedFuelName(fuelRow, locale) : car.fuel;
    const transmissionRow = transmissions.find((tr) => (tr.name_en ?? tr.name) === car.transmission || tr.name_fr === car.transmission || tr.name === car.transmission);
    const transmissionDisplay = transmissionRow ? getLocalizedTransmissionName(transmissionRow, locale) : car.transmission;

    const specs = [
        { id: "drive", label: t("drive"), value: categoryDisplay ?? car.category ?? t("na") },
        { id: "mileage", label: t("mileage"), value: `${car.km.toLocaleString()} km` },
        { id: "exteriorColor", label: t("exteriorColor"), value: car.exterior_color ?? t("na") },
        { id: "interiorColor", label: t("interiorColor"), value: t("na") },
        { id: "transmission", label: t("transmission"), value: transmissionDisplay ?? t("na") },
        { id: "fuelType", label: t("fuelType"), value: fuelDisplay ?? t("na") },
        { id: "engine", label: t("engine"), value: engineDisplay ?? t("na") },
        { id: "drivetrain", label: t("drivetrain"), value: categoryDisplay ?? car.category ?? t("na") },
    ];

    return (
        <div className="grid grid-cols-2 gap-x-4 gap-y-0">
            {specs.map((s) => (
                <SpecItem key={s.id} label={s.label} value={s.value} />
            ))}
        </div>
    );
}
