import { originalUpload } from './original-image';
import type { OriginalImage } from './scan-preview';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  prescriptionError,
  overallReview,
  ensureReviewUnchanged,
  confirmationBody,
  nextPage,
  type Prescription,
  type Request,
} from './prescription-model';
export function usePrescriptions(
  api: Request,
  report: (error: unknown) => void,
  revision = 0,
) {
  const [rows, setRows] = useState<Prescription[]>([]),
    [detail, setDetail] = useState<Prescription | null>(null),
    [creating, setCreating] = useState(false),
    [filter, setFilter] = useState(''),
    [page, setPage] = useState(1),
    [pages, setPages] = useState(1),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [reload, setReload] = useState(0),
    [blocked, setBlocked] = useState(false);
  const mounted = useRef(false),
    lock = useRef(false),
    epoch = useRef(0);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const fail = useCallback(
    (e: unknown) => {
      setError(prescriptionError(e));
      if ((e as { status?: number })?.status === 401) report(e);
    },
    [report],
  );
  useEffect(() => {
    let live = true;
    const generation = epoch.current;
    void Promise.resolve()
      .then(() => {
        if (live) {
          setLoading(true);
          setRows([]);
        }
        return api<Prescription[]>(
          `/me/prescriptions?page=${page}&limit=20${filter ? `&status=${filter}` : ''}`,
        );
      })
      .then((r) => {
        if (live && generation === epoch.current) {
          setRows(r.data);
          setPages(r.meta?.totalPages ?? 1);
        }
      })
      .catch((e) => {
        if (live && generation === epoch.current) fail(e);
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [api, filter, page, reload, revision, fail]);
  async function run(work: () => Promise<void>) {
    if (lock.current || !mounted.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await work();
    } catch (e) {
      if (mounted.current) fail(e);
    } finally {
      lock.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  async function open(id: string) {
    await run(async () => {
      const r = await api<Prescription>(`/me/prescriptions/${id}`);
      if (mounted.current) {
        setDetail(r.data);
        setCreating(false);
        setBlocked(false);
        epoch.current++;
      }
    });
  }
  function list() {
    if (lock.current) return;
    epoch.current++;
    setDetail(null);
    setCreating(false);
    setBlocked(false);
    setError('');
    setReload((n) => n + 1);
  }
  async function create(body: unknown, originals: OriginalImage[] = []) {
    await run(async () => {
      let saved: Prescription;
      try {
        const r = await api<Prescription>('/me/prescriptions', 'POST', body);
        saved = r.data;
        if (mounted.current) {
          setDetail(r.data);
          setCreating(false);
          setReload((n) => n + 1);
          setNotice('Draft saved. Review the fields before confirming.');
        }
      } catch (e) {
        if (
          mounted.current &&
          (!(e as { status?: number })?.status ||
            (e as { status: number }).status >= 500)
        ) {
          setBlocked(true);
          setNotice(
            'The save result is uncertain. Return to the list and check for your draft before creating it again.',
          );
        }
        throw e;
      }
      if (originals.length) {
        try {
          let page = nextPage(saved);
          for (const image of originals)
            await api(
              `/me/prescriptions/${saved.id}/documents`,
              'POST',
              originalUpload(image, page++),
            );
          const fresh = await api<Prescription>(
            `/me/prescriptions/${saved.id}`,
          );
          if (mounted.current) {
            setDetail(fresh.data);
            setNotice(
              'Draft saved with original images. Review the summary before approving.',
            );
          }
        } catch (error) {
          if (mounted.current) {
            setBlocked(true);
            setNotice(
              'Draft saved, but an original image could not be attached. Reload to check saved pages before attaching it again.',
            );
          }
          throw error;
        }
      }
    });
  }
  async function mutate(body: unknown, method = 'PATCH') {
    if (!detail || blocked) return;
    await run(async () => {
      try {
        await api(`/me/prescriptions/${detail.id}`, method, body);
        const r = await api<Prescription>(`/me/prescriptions/${detail.id}`);
        if (mounted.current) {
          setDetail(r.data);
          setReload((n) => n + 1);
          setNotice('Prescription updated.');
        }
      } catch (e) {
        if (mounted.current) setBlocked(true);
        throw e;
      }
    });
  }
  async function upload(form: FormData) {
    if (!detail || blocked) return;
    await run(async () => {
      try {
        await api(`/me/prescriptions/${detail.id}/documents`, 'POST', form);
        const r = await api<Prescription>(`/me/prescriptions/${detail.id}`);
        if (mounted.current) {
          setDetail(r.data);
          setNotice(
            'Image attached. No text was extracted; review the medicine fields manually.',
          );
        }
      } catch (e) {
        if (mounted.current) {
          setBlocked(true);
          setNotice(
            'Reload and check the attached pages before retrying. A page may have been saved even if its response was lost.',
          );
        }
        throw e;
      }
    });
  }
  async function approve() {
    if (!detail || blocked) return;
    await run(async () => {
      const batches = overallReview(detail);
      try {
        for (const body of batches)
          await api(`/me/prescriptions/${detail.id}`, 'PATCH', body);
        const fresh = await api<Prescription>(`/me/prescriptions/${detail.id}`);
        ensureReviewUnchanged(detail, fresh.data);
        await api(
          `/me/prescriptions/${detail.id}`,
          'PATCH',
          confirmationBody(fresh.data),
        );
        const result = await api<Prescription>(
          `/me/prescriptions/${detail.id}`,
        );
        if (mounted.current) {
          setDetail(result.data);
          setNotice('Prescription approved. No treatment has been started.');
        }
      } catch (error) {
        if (mounted.current) setBlocked(true);
        throw error;
      }
    });
  }
  return {
    loading,
    rows,
    detail,
    creating,
    filter,
    page,
    pages,
    busy,
    error,
    notice,
    blocked,
    setError,
    setCreating,
    setFilter,
    setPage,
    list,
    open,
    create,
    approve,
    mutate,
    upload,
    run,
    api,
  };
}
