/** Trigger a browser download of `data` as `filename`. */
export function download(filename: string, data: Blob | string, type = 'text/plain'): void {
	const blob = typeof data === 'string' ? new Blob([data], { type }) : data;
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}
