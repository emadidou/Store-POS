export function DataTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: React.ReactNode[];
}) {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-grove/10 bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-leaf-50/80 text-xs font-bold uppercase tracking-[0.14em] text-grove/55">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-5 py-4">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-grove/8">{rows}</tbody>
        </table>
      </div>
    </div>
  );
}
