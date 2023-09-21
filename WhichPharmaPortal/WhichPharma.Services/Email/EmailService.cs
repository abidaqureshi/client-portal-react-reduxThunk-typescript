using Google.Apis.Gmail.v1.Data;
using Microsoft.Extensions.Logging;
using MimeKit;
using Polly;
using Polly.Retry;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Mail;
using System.Threading;
using System.Threading.Tasks;
using WhichPharma.Services.Extensions;
using WhichPharma.Services.GoogleServices;

namespace WhichPharma.Services.Email
{
    public class EmailService : IEmailService
    {
        private readonly ILogger<EmailService> _logger;
        private readonly IEmailServiceConfig _config;
        private readonly IGoogleService _googleService;
        private readonly AsyncRetryPolicy _retryPolicy;

        public EmailService(ILogger<EmailService> logger, IEmailServiceConfig config, IGoogleService googleService)
        {
            _logger = logger;
            _config = config;
            _googleService = googleService;
            _retryPolicy = Policy.Handle<Exception>().WaitAndRetryAsync(
                3, 
                retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)),
                onRetry: (ex, count) => _logger.LogWarning(ex, $"Error! Retrying ({count})"));
        }

        public static MailMessage CreateEmail(
            string from, 
            string name,
            IEnumerable<(string Email, string Name)> to,
            IEnumerable<(string Email, string Name)> cc,
            string subject, 
            string htmlBody)
        {
            var mail = new MailMessage();
            mail.From = new MailAddress(from, name);

            foreach (var recipient in to)
            {
                mail.To.Add(new MailAddress(recipient.Email, recipient.Name ?? recipient.Email));
            }

            foreach (var recipient in cc)
            {
                mail.CC.Add(new MailAddress(recipient.Email, recipient.Name ?? recipient.Email));
            }

            mail.ReplyToList.Add(from);
            mail.Subject = subject;
            mail.Body = htmlBody;
            mail.IsBodyHtml = true;
            return mail;
        }

        public Task SendEmailThroughSMTPAsync(
            string from,
            string name,
            string password,
            IEnumerable<(string Email, string Name)> to,
            IEnumerable<(string Email, string Name)> cc,
            string subject, 
            string body, 
         //   string attachedFiles,
            CancellationToken token)
        {
            var mail = CreateEmail(from, name, to, cc, subject, body);
            var server = new SmtpClient("smtp.gmail.com")
            {
                Port = 587,
                Credentials = new NetworkCredential(from, password),
                EnableSsl = true,
            };
            return _retryPolicy.ExecuteAsync(_ => Task.Run(() => server.Send(mail), token), token);
        }

   

        public async Task<string> SendEmailThroughGoogleApiAsync(
            string name,
            string gmailCode,
            IEnumerable<(string Email, string Name)> to,
            IEnumerable<(string Email, string Name)> cc,
            string subject,
            string body,
            CancellationToken token)
        {
            var user = await _googleService.GetUserProfileAsync(gmailCode, token);

            var mail = CreateEmail(user.Email, name, to, cc, subject, body);
            var mime = MimeMessage.CreateFromMailMessage(mail);
            var message = new Message { Raw = mime.Encode() };

            var gmailService = await _googleService.GetGmailServiceAsync(user.Email, gmailCode, token);

            var res = await _retryPolicy.ExecuteAsync(_ => gmailService.Users.Messages.Send(message, user.Email).ExecuteAsync(token), token);

            return res.Id;
        }

        public Task SendEmailFromWhichPharmaAccountThroughSMTPAsync(
            IEnumerable<(string Email, string Name)> to,
            IEnumerable<(string Email, string Name)> cc,
            string subject,
            string body,
            CancellationToken token)
        {
            return SendEmailThroughSMTPAsync(_config.Email, _config.Name, _config.Password, to, cc, subject, body, token);
        }

        public async Task<string> SendEmailFromWhichPharmaAccountThroughGoogleApiAsync(
            IEnumerable<(string Email, string Name)> to,
            IEnumerable<(string Email, string Name)> cc,
            string subject,
            string body,
            //string? attachedFiles,
            CancellationToken token)
        {
            var from = _config.Email;
            var name = _config.Name;

            var mail = CreateEmail(from, name, to, cc, subject, body);
            var mime = MimeMessage.CreateFromMailMessage(mail);
            var message = new Message { Raw = mime.Encode() };

            var gmailService = await _googleService.GetImpersonatedGmailServiceAsync(from, token);

            var res = await _retryPolicy.ExecuteAsync(_ => gmailService.Users.Messages.Send(message, from).ExecuteAsync(token), token);

            return res.Id;
        }

        public async Task<string> SendEmailFromWhichPharmaAccountThroughGoogleApiAsync(
            IEnumerable<(string Email, string Name)> to, 
            IEnumerable<(string Email, string Name)> cc, 
            string subject, 
            string body, 
            (byte[] Bytes, string Name) attachment, 
            CancellationToken token)
        {
            var from = _config.Email;
            var name = _config.Name;

            var mail = CreateEmail(from, name, to, cc, subject, body);

            if (attachment.Bytes != null)
            {
                mail.Attachments.Add(new Attachment(new MemoryStream(attachment.Bytes), attachment.Name));
            }

            var mime = MimeMessage.CreateFromMailMessage(mail);
            var message = new Message { Raw = mime.Encode() };

            var gmailService = await _googleService.GetImpersonatedGmailServiceAsync(from, token);

            var res = await _retryPolicy.ExecuteAsync(_ => gmailService.Users.Messages.Send(message, from).ExecuteAsync(token), token);

            return res.Id;
        }
    }
}
