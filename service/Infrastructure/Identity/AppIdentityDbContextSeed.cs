using Core.Entities.Identity;
using Microsoft.AspNetCore.Identity;

namespace Infrastructure.Identity;

public class AppIdentityDbContextSeed
{
    public static async Task SeedUserAsync(UserManager<AppUser> userManager)
    {
        if (!userManager.Users.Any())
        {
            var user = new AppUser
            {
                DisplayName = "Rai",
                Email = "rai@test.com",
                UserName = "rai@test.com",
                Address = new Address {
                    FirstName = "Rai",
                    LastName = "Wlkr",
                    Street = "420 Gold Street",
                    City = "San Pablo",
                    State = "Laguna",
                    ZipCode = "8080"
                }
            };

            await userManager.CreateAsync(user, "Pa$$w0rd");
        }
    }
}
