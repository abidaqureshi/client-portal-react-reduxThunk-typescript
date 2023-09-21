import { Action } from 'redux';
import { Supplier } from '../../models/Supplier';
import { SearchResult } from '../../models/SearchResult';

export interface SuppliersLoadedAction extends Action {
    result: SearchResult<Supplier>;
}

export interface SupplierAction extends Action {
    supplierId: string;
}

export interface SupplierActionV3 extends Action {
    supplierId: string;
    productId: string;
}

export interface SupplierByProductAction extends Action {
    supplierId: string;
    productId: string;
}

export interface SupplierContactAction extends Action {
    email: string;
}

export interface SupplierContactActionV3 extends Action {
    email: string;
    productId: string;
}

export interface SupplierContactSelectedAction extends Action {
    email: string;
    isCC: boolean;
}

export interface SupplierContactSelectedActionV3 extends Action {
    productId: string;
    email: string;
    isCC: boolean;
}
