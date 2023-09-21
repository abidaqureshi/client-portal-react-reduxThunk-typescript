using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using System.ComponentModel.DataAnnotations;

namespace WhichPharmaPortal.Models.Server
{
    public class SupplierProductsSearch
    {
        [FromQuery(Name = "name")]
        [SwaggerParameter("Product name term to search for")]
        [MinLength(3)]
        [Required]
        public string Name { get; set; }
    }
}
