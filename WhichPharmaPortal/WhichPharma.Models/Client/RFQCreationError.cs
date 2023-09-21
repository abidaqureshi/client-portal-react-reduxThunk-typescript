namespace WhichPharmaPortal.Models.Client
{
    public enum RFQCreationError
    {
        None,
        SupplierFirstNameMissing,
        SupplierLastNameMissing,
        UserFirstNameMissing,
        UserLastNameMissing,
        UserEmailMissing,
        UserTitleMissing,
        ProductsTableMissing,
        ReplyFormUrlMissing,
        SupplierNotFoundInDatabase,
        RecipientNotFoundInSupplierData,
        UserNotFoundInDatabase,
        EmailBodyContainsUnknownPlaceholder,
        UnableToConnectToYourEmailAccount,
        DueDateMissing,
    }
}
