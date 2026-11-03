interface CompositeExportValue {
  compositeOperationId?: string;
  value: string;
  count: number;
  option?: { translationRu: string };
}

export function formatCompositeExport(values: CompositeExportValue[]): string {
  const operations = new Map<string, CompositeExportValue[]>();
  values.forEach((value, index) => {
    const key = value.compositeOperationId ?? `legacy-${index}`;
    operations.set(key, [...(operations.get(key) ?? []), value]);
  });
  return [...operations.values()]
    .map(
      (items, index) =>
        `${index + 1}. ${items.map((item) => item.option?.translationRu ?? item.value).join(' + ')} × ${items[0].count}`,
    )
    .join('\n');
}
