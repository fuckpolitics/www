export const groupBy = <T, K extends string | number | symbol, V>(array: T[], keyFn: (item: T) => K, valueFn: (item: T) => V): Record<K, V[]> => 
  array.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(valueFn(item));
    return acc;
  }, {} as Record<K, V[]>);