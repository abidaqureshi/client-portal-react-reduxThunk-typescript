namespace WhichPharmaPortal.Models.Client
{
    public enum RFQUpdateError
    {
        None,

        UserIsNotACollaborator,
        UserNotFound,
        UserIsNotAllowed,
        ThreadNotFound,
        SupplierEntryNotFound,
    }
}
