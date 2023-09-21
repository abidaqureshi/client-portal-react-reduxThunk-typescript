
namespace WhichPharma.Services.Identity
{
    public static class Roles
    {
        public const string External = "External";
        public const string Administrator = "Administrator";
        public const string Collaborator = "Collaborator"; // RBPharma staff
        public const string Supplier = "Supplier"; // Suppliers (able to submit RFQ replies)
        public const string PlatformContributor = "PlatformContributor";

        public const string AdministratorOrCollaborator = Administrator + "," + Collaborator;
        public const string AdministratorOrContributor = Administrator + "," + PlatformContributor;
        public const string AllExceptExternal = Administrator + "," + Collaborator + "," + Supplier + "," + PlatformContributor;
    }
}
