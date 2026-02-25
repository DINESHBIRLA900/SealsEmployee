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
export interface Variant {
    _id: string;
    unit_value: number;
    unit_master: {
        name: string;
        short_name: string;
    };
    packing: {
        name: string;
    };
    gst_bill: {
        mrp: number;
        total_amount: number;
    };
}

export interface Product {
    _id: string;
    name: string;
    product_images?: { url: string }[];
    category: ProductCategory;
    variants: Variant[];
    status: 'Active' | 'Inactive';
}
