import { Supplier } from '../../models/Supplier';

export interface Email {
    value: string;
    isCC?: boolean;
}
export interface SuppliersState {
    items: { [id: string]: Supplier };
    selectedItemsByProductId: { [id: string]: string[] };
    selectedProductSuppliers: { [id: string]: string[] };
    selectedProductSupplierEmails: { [id: string]: Email[] };
    isLoading: boolean;
    searchResult: string[];
    selectedItems: string[];
    selectedEmails: Email[];
    searchTotal: number;
}
