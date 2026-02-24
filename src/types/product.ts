export interface ProductCategory {
    _id: string;
    name: string;
    image?: string;
    description?: string;
    status: 'Active' | 'Inactive';
    order?: number;
    createdAt: string;
    updatedAt: string;
}
