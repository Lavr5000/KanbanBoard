export const exportToJson = (data: any) => {
  const fileData = JSON.stringify(data, null, 2);
  const blob = new Blob([fileData], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `kanban-export-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
};
