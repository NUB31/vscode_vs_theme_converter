export type ThemeConverterResponse = {
	success: boolean;
	message: string | null;
	data: {
		pkgUrl: string;
		ps1Url: string;
		name: string;
	} | null;
};
