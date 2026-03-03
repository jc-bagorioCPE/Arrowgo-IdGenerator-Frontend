import * as XLSX from "xlsx";

export const downloadExcel = (data, filename = "data_export") => {
  try {
    if (!data || data.length === 0) return;

    // Prepare data with auto-increment "No." column
    const dataWithIndex = data.map((row, index) => {
      const { id, ...rest } = row; // remove original id
      return { No: index + 1, ...rest }; // add incrementing No.
    });

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(dataWithIndex);

    // Auto-fit column widths
    const cols = Object.keys(dataWithIndex[0]).map((key) => {
      const maxLength = Math.max(
        key.length,
        ...dataWithIndex.map((row) => (row[key] ? row[key].toString().length : 0))
      );
      return { wch: maxLength + 2 }; // padding
    });
    ws["!cols"] = cols;

    // Create workbook and append worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");

    // Save the file
    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split("T")[0]}.xlsx`);
  } catch (error) {
    console.error("Excel export failed:", error);
  }
};
