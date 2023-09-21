import { ApplicationState } from '..';
import { Supplier } from '../../models/Supplier';
import { Email } from './state';

export const getSuppliers = (state: ApplicationState): { [id: string]: Supplier } => state.suppliers.items;
export const getSearchResultSuppliers = (state: ApplicationState): Supplier[] =>
    state.suppliers.searchResult.map((id) => state.suppliers.items[id]);
export const getSelectedSuppliers = (state: ApplicationState): Supplier[] =>
    state.suppliers.selectedItems.map((id) => state.suppliers.items[id]);
export const getSelectedSuppliersEmails = (state: ApplicationState): Email[] => state.suppliers.selectedEmails;

export const getSelectedSuppliersIds = (state: ApplicationState): string[] => state.suppliers.selectedItems;
export const getSearchTotalIncludingNotLoaded = (state: ApplicationState): number => state.suppliers.searchTotal;
export const isLoadingSuppliers = (state: ApplicationState): boolean => state.suppliers.isLoading;
export const getProductSelectedSuppliers = (state: ApplicationState): { [id: string]: string[] } =>
    state.suppliers.selectedProductSuppliers;
export const getProductSelectedSupplierSelectedEmails = (state: ApplicationState): { [id: string]: Email[] } =>
    state.suppliers.selectedProductSupplierEmails;
export const getSelectedSuppliersByProductIds = (state: ApplicationState): { [id: string]: string[] } =>
    state.suppliers.selectedItemsByProductId;
