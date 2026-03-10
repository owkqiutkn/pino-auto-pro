 "use client";

 import {APIProvider, Map, Marker} from "@vis.gl/react-google-maps";

 const defaultCenter = {lat: 45.4215, lng: -75.6972};

 const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string | undefined;

 export default function ContactMap() {
     if (!GOOGLE_MAPS_API_KEY) {
         return (
             <div className="flex h-44 w-full items-center justify-center bg-gray-300 text-xs text-gray-700 md:h-56">
                 Google Maps API key is not configured.
             </div>
         );
     }

     return (
         <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
             <div className="h-44 w-full md:h-56">
                 <Map
                     defaultCenter={defaultCenter}
                     defaultZoom={14}
                     gestureHandling={"greedy"}
                     disableDefaultUI={true}
                     className="h-full w-full"
                 >
                     <Marker position={defaultCenter} />
                 </Map>
             </div>
         </APIProvider>
     );
 }

