using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace WhichPharma.Services.Email
{
    public interface IEmailService
    {
        Task SendEmailThroughSMTPAsync(
            string gmail,
            string name,
            string password,
            IEnumerable<(string Email, string Name)> to,
            IEnumerable<(string Email, string Name)> cc,
            string subject,
            string body,
            CancellationToken token);

        //Task SendEmailThroughSMTPAsync(
        //    string gmail,
        //    string name,
        //    string password,
        //    IEnumerable<(string Email, string Name)> to,
        //    IEnumerable<(string Email, string Name)> cc,
        //    string subject,
        //    string body,
        //  //  string attachedFiles,
        //    CancellationToken token);

        Task<string> SendEmailThroughGoogleApiAsync(
            string name,
            string gmailCode,
            IEnumerable<(string Email, string Name)> to,
            IEnumerable<(string Email, string Name)> cc,
            string subject,
            string body,
            CancellationToken token);

        Task SendEmailFromWhichPharmaAccountThroughSMTPAsync(
            IEnumerable<(string Email, string Name)> to,
            IEnumerable<(string Email, string Name)> cc,
            string subject,
            string body,
            CancellationToken token);

        //Task<string> SendEmailFromWhichPharmaAccountThroughGoogleApiAsync(
        //    IEnumerable<(string Email, string Name)> to,
        //    IEnumerable<(string Email, string Name)> cc,
        //    string subject,
        //    string body,
        //    CancellationToken token);

        Task<string> SendEmailFromWhichPharmaAccountThroughGoogleApiAsync(
         IEnumerable<(string Email, string Name)> to,
         IEnumerable<(string Email, string Name)> cc,
         string subject,
         string body,
        // string? attachment,
         CancellationToken token);

        Task<string> SendEmailFromWhichPharmaAccountThroughGoogleApiAsync(
         IEnumerable<(string Email, string Name)> to,
         IEnumerable<(string Email, string Name)> cc,
         string subject,
         string body,
         (byte[] Bytes, string Name) attachment,
         CancellationToken token);
    }
}
