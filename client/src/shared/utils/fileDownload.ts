const downloadFile = (data: BlobPart, filename: string, mimeType: string) => {
  const blob = new Blob([data], { type: mimeType });

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const downloadExcel = (data: BlobPart, filename?: string) => {
  const defaultFilename = `export_${new Date().toISOString().split("T")[0]}.xlsx`;
  downloadFile(
    data,
    filename || defaultFilename,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
};
