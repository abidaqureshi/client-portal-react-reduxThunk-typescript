namespace WhichPharmaPortal.Models.Client
{
    public enum UserChangeResult
    {
        Created,
        Updated,
        WeakPassword,
        UsernameInUse,
        InvalidUsername,
        EmailInUse,
        InvalidEmail,
    }
}
