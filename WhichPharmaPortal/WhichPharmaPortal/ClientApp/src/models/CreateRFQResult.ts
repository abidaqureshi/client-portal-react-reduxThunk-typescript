export enum CreateRFQResult {
	Created = 'Created',
	ErrorSendingEmails = 'ErrorSendingEmails',
	ErrorAccessingDatabase = 'ErrorAccessingDatabase',
	EmailsSentButErrorIntegratingWithStreak = 'EmailsSentButErrorIntegratingWithStreak',
	EmailsSentButErrorSavingInDatabase = 'EmailsSentButErrorSavingInDatabase',
	RfqNumberIsAlreadyInUse = 'RfqNumberIsAlreadyInUse',
	ExistingRfqNotFound = 'ExistingRfqNotFound',
}