import { Download } from 'lucide-react';
import { useMemo, useState } from 'react';
import { adminApi } from '../api/client';
import { adminInputClass, FormField } from '../components/FormField';
import { PageHeader } from '../components/PageHeader';

const today = new Date().toISOString().slice(0, 10);
const currentMonth = today.slice(0, 7);
const currentYear = today.slice(0, 4);
type ExportType = 'day' | 'month' | 'year' | 'all';

export function AccountingExportPage() {
  const [type, setType] = useState<ExportType>('month');
  const [date, setDate] = useState(today);
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [source, setSource] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('');

  const exportPath = useMemo(() => {
    const params = new URLSearchParams({ type });

    if (type === 'day') params.set('date', date);
    if (type === 'month') params.set('month', month);
    if (type === 'year') params.set('year', year);
    if (paymentStatus) params.set('payment_status', paymentStatus);
    if (source) params.set('source', source);
    if (documentType) params.set('document_type', documentType);

    return `/admin/accounting-export?${params.toString()}`;
  }, [date, documentType, month, paymentStatus, source, type, year]);

  const xlsxExportPath = useMemo(() => exportPath.replace('/admin/accounting-export?', '/admin/accounting-export/xlsx?'), [exportPath]);

  const filename = useMemo(() => {
    if (type === 'day') return `export-${date}.csv`;
    if (type === 'month') return `export-${month}.csv`;
    if (type === 'year') return `export-${year}.csv`;
    return 'export-all.csv';
  }, [date, month, type, year]);

  const xlsxFilename = filename.replace('.csv', '.xlsx');

  const download = async (format: 'csv' | 'xlsx') => {
    setError('');
    setIsDownloading(true);

    try {
      await adminApi.downloadAdminFile(format === 'xlsx' ? xlsxExportPath : exportPath, format === 'xlsx' ? xlsxFilename : filename);
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : 'Export impossible.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <PageHeader title="Export comptable" description="Exports CSV filtres par jour, mois, annee ou totalite." />
      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <form
          className="grid gap-5 rounded-[1.5rem] border border-grove/10 bg-white p-5 shadow-soft lg:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            download('csv');
          }}
        >
          <FormField label="Periode">
            <select className={adminInputClass} value={type} onChange={(event) => setType(event.target.value as ExportType)}>
              <option value="day">Jour</option>
              <option value="month">Mois</option>
              <option value="year">Annee</option>
              <option value="all">Totalite</option>
            </select>
          </FormField>

          {type === 'day' && <FormField label="Date"><input className={adminInputClass} type="date" value={date} onChange={(event) => setDate(event.target.value)} /></FormField>}
          {type === 'month' && <FormField label="Mois"><input className={adminInputClass} type="month" value={month} onChange={(event) => setMonth(event.target.value)} /></FormField>}
          {type === 'year' && <FormField label="Annee"><input className={adminInputClass} inputMode="numeric" maxLength={4} value={year} onChange={(event) => setYear(event.target.value)} /></FormField>}
          {type === 'all' && <div className="rounded-2xl bg-cream p-4 text-sm font-semibold text-grove/65">Aucune restriction de periode ne sera appliquee.</div>}

          <FormField label="Statut paiement">
            <select className={adminInputClass} value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)}>
              <option value="">Tous</option>
              <option value="paid">Paye</option>
              <option value="pending">En attente</option>
              <option value="failed">Echoue</option>
            </select>
          </FormField>

          <FormField label="Source">
            <select className={adminInputClass} value={source} onChange={(event) => setSource(event.target.value)}>
              <option value="">Toutes</option>
              <option value="pos">POS / caisse</option>
              <option value="web">Online</option>
              <option value="admin">Admin</option>
            </select>
          </FormField>

          <FormField label="Type document">
            <select className={adminInputClass} value={documentType} onChange={(event) => setDocumentType(event.target.value)}>
              <option value="">Factures + avoirs</option>
              <option value="invoice">Factures</option>
              <option value="credit_note">Avoirs</option>
            </select>
          </FormField>

          <div className="rounded-2xl bg-leaf-50 p-4 text-sm text-grove/70 lg:col-span-2">
            <p className="font-bold text-grove">Fichiers generes</p>
            <p className="mt-1 font-mono text-xs">{filename}</p>
            <p className="mt-1 font-mono text-xs">{xlsxFilename}</p>
          </div>

          {error && <p className="rounded-2xl bg-tomato/10 p-3 text-sm font-semibold text-tomato lg:col-span-2">{error}</p>}

          <div className="flex flex-wrap gap-2 lg:col-span-2">
            <button type="button" className="btn btn-primary" disabled={isDownloading} onClick={() => download('xlsx')}>
              <Download size={17} />
              {isDownloading ? 'Generation...' : 'Telecharger XLSX stylé'}
            </button>
            <button type="submit" className="btn btn-secondary" disabled={isDownloading}>
              <Download size={17} />
              CSV brut
            </button>
          </div>
        </form>

        <aside>
          <article className="rounded-3xl border border-grove/10 bg-white p-5 shadow-soft">
            <h2 className="font-display text-2xl font-semibold text-grove">Conseil</h2>
            <p className="mt-2 text-sm leading-6 text-grove/65">L export comptable inclut les factures et les avoirs. Les bons non payes restent visibles dans le journal de ventes mais ne sont jamais melanges a la comptabilite.</p>
          </article>
        </aside>
      </section>
    </>
  );
}
