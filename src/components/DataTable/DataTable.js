import styles from "./datatable.module.css";

/**
 * DataTable
 * props:
 * - columns: [{ key, header, width?, render?(row), editable? }]
 * - rows: array de objetos
 * - rowKey: string (default "id")
 * - actions?: (row) => JSX (render de botões por linha)
 * - emptyMessage?: string
 */
export default function DataTable({
  columns,
  rows,
  rowKey = "id",
  actions,
  emptyMessage = "Nenhum item encontrado.",
}) {
  return (
    <div className={styles.tableWrap} role="region" aria-label="Lista de itens">
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} style={c.width ? { width: c.width } : undefined}>
                {c.header}
              </th>
            ))}
            {actions && <th className={styles.actionsTh}>Ações</th>}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td className={styles.empty} colSpan={columns.length + (actions ? 1 : 0)}>
                {emptyMessage}
              </td>
            </tr>
          )}
          {rows.map((row) => (
            <tr key={row[rowKey]}>
              {columns.map((c) => (
                <td key={c.key}>
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
              {actions && <td className={styles.actionsTd}>{actions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}