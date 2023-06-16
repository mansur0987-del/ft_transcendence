export class Payload {
	id?: number

	name: string

	twoFactorAuthenticatedCode?: string;

	isTwoFactorAuthenticated?: boolean;

	isTwoFactorAuthenticationEnabled: boolean;
}
