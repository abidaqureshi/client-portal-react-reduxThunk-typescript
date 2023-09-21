using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using WhichPharma.Database.Filters;
using WhichPharma.Database.Services;
using WhichPharmaPortal.Models.Client;
using WhichPharma.Models.Server;
using DbProduct = WhichPharma.Models.Database.Products.LegacyProduct;
using DbShortageInfo = WhichPharma.Models.Products.ShortageInfo;
using DbShortageType = WhichPharma.Models.Products.ShortageType;

namespace WhichPharma.Services.Products.Tests
{
    [TestClass()]
    public class ProductsServiceTests
    {
        private Mock<ILegacyProductsStorage> _productsStorageMock;
        private LegacyProductsService _productService;
        private CancellationToken _ct;

        [TestInitialize]
        public void TestInitialize()
        {
            _ct = new CancellationToken();
            _productsStorageMock = new Mock<ILegacyProductsStorage>(MockBehavior.Strict);
            _productService = new LegacyProductsService(_productsStorageMock.Object);
        }

        [TestMethod()]
        [DataRow(1990, 2999, DbShortageType.Partial, ProductStatus.PartialShortage)]
        [DataRow(1990, 2999, DbShortageType.Permanent, ProductStatus.Discontinued)]
        [DataRow(1990, 2999, DbShortageType.Temporary, ProductStatus.Shortage)]
        [DataRow(1990, null, DbShortageType.Temporary, ProductStatus.Shortage)]
        [DataRow(2990, null, DbShortageType.Temporary, ProductStatus.Authorised)]
        [DataRow(1990, 2000, DbShortageType.Temporary, ProductStatus.Authorised)]
        [DataRow(2990, 2999, DbShortageType.Temporary, ProductStatus.Authorised)]
        [DataRow(null, null, DbShortageType.Temporary, ProductStatus.Authorised)]
        public async Task GetProductsAsync_WhenProductHasShortage_ShouldMapStatusDependingOnShortageType(
            int? startYear, 
            int? endYear, 
            DbShortageType type, 
            ProductStatus expectedStatus)
        {
            _productsStorageMock
                .Setup(s => s.GetProductsAsync(It.IsAny<LegacyProductsFilter>(), null, 0, 0, _ct))
                .Returns(Task.FromResult((new List<DbProduct>()
                {
                    new DbProduct 
                    { 
                        Status = Models.Database.Products.LegacyProductStatus.Authorised,
                        ShortageInfo = !startYear.HasValue ? null : new DbShortageInfo 
                        { 
                            Start = new DateTime(startYear.Value, 1, 1), 
                            End = !endYear.HasValue ? null : (DateTime?) new DateTime(endYear.Value, 1, 1), 
                            Type = type 
                        },
                        Country = "PT",
                    },
                }, 1L)));

            var res = await _productService.GetProductsAsync(new GetLegacyProductsFilters(), 0, 0, _ct);

            Assert.AreEqual(expectedStatus, res?.Items?.FirstOrDefault()?.Status);
        }
    }
}