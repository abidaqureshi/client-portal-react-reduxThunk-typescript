namespace WhichPharmaPortal.Models.Client
{
    public enum CreateRFQResult
    {
        Created,
        ErrorSendingEmails,
        ErrorAccessingDatabase,
        EmailsSentButErrorIntegratingWithStreak,
        EmailsSentButErrorSavingInDatabase,
        RfqNumberIsAlreadyInUse,
        ExistingRfqNotFound,
    }
}
