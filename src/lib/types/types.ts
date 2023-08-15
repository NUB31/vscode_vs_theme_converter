export type ThemeConverterResponse = {
	success: boolean;
	message: string | null;
	data: {
		url: string;
	} | null;
};
