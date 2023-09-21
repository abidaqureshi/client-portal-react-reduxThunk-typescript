namespace WhichPharmaPortal.Models.Client
{
    public enum UserRole
    {
        Administrator,
        Collaborator, // RBPharma staff (able to create RFQs)
        Supplier, // Suppliers (able to submit RFQ replies)
        PlatformContributor, // RBPharma staff (able to add processing mappings)
        External,
    }
}
