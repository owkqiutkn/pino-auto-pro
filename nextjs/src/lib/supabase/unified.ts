import {SupabaseClient} from "@supabase/supabase-js";
import {Database} from "@/lib/types";

export enum ClientType {
    SERVER = 'server',
    SPA = 'spa'

}

export class SassClient {
    private client: SupabaseClient<Database, "public", "public">;
    private clientType: ClientType;

    constructor(client: SupabaseClient<Database, "public", "public">, clientType: ClientType) {
        this.client = client;
        this.clientType = clientType;

    }

    async loginEmail(email: string, password: string) {
        return this.client.auth.signInWithPassword({
            email: email,
            password: password
        });
    }

    async registerEmail(email: string, password: string) {
        return this.client.auth.signUp({
            email: email,
            password: password
        });
    }

    async exchangeCodeForSession(code: string) {
        return this.client.auth.exchangeCodeForSession(code);
    }

    async resendVerificationEmail(email: string) {
        return this.client.auth.resend({
            email: email,
            type: 'signup'
        })
    }

    async logout() {
        const { error } = await this.client.auth.signOut({
            scope: 'local',
        });
        if (error) throw error;
        if(this.clientType === ClientType.SPA) {
            window.location.href = '/auth/login';
        }
    }

    async uploadFile(myId: string, filename: string, file: File) {
        filename = filename.replace(/[^0-9a-zA-Z!\-_.*'()]/g, '_');
        filename = myId + "/" + filename
        return this.client.storage.from('files').upload(filename, file);
    }

    async getFiles(myId: string) {
        return this.client.storage.from('files').list(myId)
    }

    async deleteFile(myId: string, filename: string) {
        filename = myId + "/" + filename
        return this.client.storage.from('files').remove([filename])
    }

    async shareFile(myId: string, filename: string, timeInSec: number, forDownload: boolean = false) {
        filename = myId + "/" + filename
        return this.client.storage.from('files').createSignedUrl(filename, timeInSec, {
            download: forDownload
        });

    }

    async getMyTodoList(page: number = 1, pageSize: number = 100, order: string = 'created_at', done: boolean | null = false) {
        let query = this.client.from('todo_list').select('*').range(page * pageSize - pageSize, page * pageSize - 1).order(order)
        if (done !== null) {
            query = query.eq('done', done)
        }
        return query
    }

    async createTask(row: Database["public"]["Tables"]["todo_list"]["Insert"]) {
        return this.client.from('todo_list').insert(row)
    }

    async getAvailableCars(filters?: {
        brand?: string;
        category?: string;
        model?: string;
        year?: number;
        kmMax?: number;
        priceMax?: number;
    }) {
        let query = this.client
            .from('cars')
            .select('*')
            .eq('status', 'available')
            .order('created_at', { ascending: false });

        if (filters?.brand) {
            query = query.eq('brand', filters.brand);
        }
        if (filters?.category) {
            query = query.eq('category', filters.category);
        }
        if (filters?.model) {
            query = query.eq('model', filters.model);
        }
        if (filters?.year) {
            query = query.eq('year', filters.year);
        }
        if (typeof filters?.kmMax === 'number') {
            query = query.lte('km', filters.kmMax);
        }
        if (typeof filters?.priceMax === 'number') {
            query = query.lte('price', filters.priceMax);
        }

        return query;
    }

    /** Available cars marked as featured, newest first. */
    async getFeaturedCars(limit: number = 8) {
        return this.client
            .from('cars')
            .select('*')
            .eq('status', 'available')
            .eq('featured', true)
            .order('created_at', { ascending: false })
            .limit(limit);
    }

    /** Available cars ordered by most recently added (created_at desc). */
    async getNewArrivalsCars(limit: number = 8) {
        return this.client
            .from('cars')
            .select('*')
            .eq('status', 'available')
            .order('created_at', { ascending: false })
            .limit(limit);
    }

    async getCarBySlug(slug: string) {
        return this.client
            .from('cars')
            .select('*')
            .eq('slug', slug)
            .maybeSingle();
    }

    async getAvailableCarBySlug(slug: string) {
        return this.client
            .from('cars')
            .select('*')
            .eq('slug', slug)
            .eq('status', 'available')
            .maybeSingle();
    }

    async getAllCars() {
        return this.client
            .from('cars')
            .select('*')
            .order('created_at', { ascending: false });
    }

    async getCarById(id: string) {
        return this.client
            .from('cars')
            .select('*')
            .eq('id', id)
            .maybeSingle();
    }

    async createCar(row: Database["public"]["Tables"]["cars"]["Insert"]) {
        return this.client
            .from('cars')
            .insert(row)
            .select('*')
            .single();
    }

    async updateCar(id: string, row: Database["public"]["Tables"]["cars"]["Update"]) {
        return this.client
            .from('cars')
            .update(row)
            .eq('id', id)
            .select('*')
            .single();
    }

    async deleteCar(id: string) {
        return this.client
            .from('cars')
            .delete()
            .eq('id', id);
    }

    async getBrands() {
        return this.client
            .from('brands')
            .select('*')
            .order('name', { ascending: true });
    }

    async createBrand(name: string) {
        return this.client
            .from('brands')
            .insert({ name })
            .select('*')
            .single();
    }

    async deleteBrand(id: string) {
        return this.client
            .from('brands')
            .delete()
            .eq('id', id);
    }

    async getCategories() {
        return this.client
            .from('categories')
            .select('*')
            .order('name', { ascending: true });
    }

    async createCategory(name: string) {
        return this.client
            .from('categories')
            .insert({ name })
            .select('*')
            .single();
    }

    async deleteCategory(id: string) {
        return this.client
            .from('categories')
            .delete()
            .eq('id', id);
    }

    async getBrandModels(brandId?: string) {
        let query = this.client
            .from('brand_models')
            .select('*')
            .order('name', { ascending: true });

        if (brandId) {
            query = query.eq('brand_id', brandId);
        }

        return query;
    }

    async createBrandModel(brandId: string, name: string) {
        return this.client
            .from('brand_models')
            .insert({ brand_id: brandId, name })
            .select('*')
            .single();
    }

    async deleteBrandModel(id: string) {
        return this.client
            .from('brand_models')
            .delete()
            .eq('id', id);
    }

    async getCarImages(carId: string) {
        return this.client
            .from('car_images')
            .select('*')
            .eq('car_id', carId)
            .order('sort_order', { ascending: true });
    }

    async getCarImagesForCars(carIds: string[]) {
        if (carIds.length === 0) {
            return { data: [], error: null };
        }
        return this.client
            .from('car_images')
            .select('*')
            .in('car_id', carIds)
            .order('sort_order', { ascending: true });
    }

    async createCarImage(row: Database["public"]["Tables"]["car_images"]["Insert"]) {
        return this.client
            .from('car_images')
            .insert(row)
            .select('*')
            .single();
    }

    async deleteCarImage(id: string) {
        return this.client
            .from('car_images')
            .delete()
            .eq('id', id);
    }

    async setCoverImage(carId: string, imageId: string) {
        const clearPrevious = await this.client
            .from('car_images')
            .update({ is_cover: false })
            .eq('car_id', carId);
        if (clearPrevious.error) {
            return clearPrevious;
        }
        return this.client
            .from('car_images')
            .update({ is_cover: true })
            .eq('id', imageId)
            .eq('car_id', carId);
    }

    async updateCarImageOrder(carId: string, orderedImageIds: string[]) {
        const updates = orderedImageIds.map((id, index) =>
            this.client
                .from('car_images')
                .update({ sort_order: index + 1 })
                .eq('id', id)
                .eq('car_id', carId)
        );
        return Promise.all(updates);
    }

    async uploadCarImage(carId: string, filename: string, file: File) {
        const cleaned = filename.replace(/[^0-9a-zA-Z!\-_.*'()]/g, '_');
        const storagePath = `cars/${carId}/${Date.now()}_${cleaned}`;
        const uploadResponse = await this.client.storage.from('car-images').upload(storagePath, file, {
            upsert: false,
        });
        if (uploadResponse.error) {
            return uploadResponse;
        }
        const publicUrlResponse = this.client.storage.from('car-images').getPublicUrl(storagePath);
        return {
            data: {
                path: storagePath,
                publicUrl: publicUrlResponse.data.publicUrl,
            },
            error: null,
        };
    }

    async deleteCarImageFromStorage(storagePath: string) {
        return this.client.storage.from('car-images').remove([storagePath]);
    }

    async removeTask (id: number) {
        return this.client.from('todo_list').delete().eq('id', id)
    }

    async updateAsDone (id: number) {
        return this.client.from('todo_list').update({done: true}).eq('id', id)
    }

    getSupabaseClient() {
        return this.client;
    }


}
