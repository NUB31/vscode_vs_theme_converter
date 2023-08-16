export type ThemeConverterResponse = {
	success: boolean;
	message: string | null;
	data: {
		pkgUrl: string;
		scriptUrl: string;
	} | null;
};
